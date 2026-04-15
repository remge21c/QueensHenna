'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getTreatments() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('treatments')
    .select(`
      id,
      treated_at,
      status,
      total_price,
      payment_method,
      reservation_id,
      customer_id,
      customer:customers(name, phone),
      type:treatment_types(name, base_price)
    `)
    .order('treated_at', { ascending: false })
    .limit(50)

  if (error) {
    throw new Error(error.message)
  }
  return data
}

export async function completeTreatmentAction(
  treatmentId: string,
  reservationId: string | null,
  customerId: string,
  totalPrice: number,
  paymentMethod: string,
  memo: string,
  usages: { dye_id: string; unit_id: string; amount: number }[]
) {
  const supabase = await createClient()

  // 1. 시술 기록 완료 처리 (treatmentId 없으면 예약에서 직접 생성)
  let resolvedTreatmentId = treatmentId
  if (!treatmentId && reservationId) {
    const { data: reservation } = await supabase
      .from('reservations')
      .select('treatment_type_id, reserved_at')
      .eq('id', reservationId)
      .single()
    if (!reservation) return { success: false, error: '예약 정보를 찾을 수 없습니다.' }
    const { data: newTreatment, error: insertError } = await supabase
      .from('treatments')
      .insert({
        customer_id: customerId,
        treatment_type_id: reservation.treatment_type_id,
        reservation_id: reservationId,
        treated_at: reservation.reserved_at,
        status: 'completed',
        total_price: totalPrice,
        payment_method: paymentMethod,
        memo,
      })
      .select('id')
      .single()
    if (insertError) return { success: false, error: insertError.message }
    resolvedTreatmentId = newTreatment.id
  } else {
    const { error: updateError } = await supabase
      .from('treatments')
      .update({ status: 'completed', total_price: totalPrice, payment_method: paymentMethod, memo })
      .eq('id', treatmentId)
    if (updateError) return { success: false, error: updateError.message }
  }

  // 2. 사용량 기록 + 재고 일괄 조회 (병렬 실행)
  if (usages.length > 0) {
    const usageRows = usages.map(u => ({
      treatment_id: resolvedTreatmentId,
      dye_id: u.dye_id,
      unit_id: u.unit_id,
      amount: u.amount,
    }))
    const dyeIds = usages.map(u => u.dye_id)

    const [, stockResult] = await Promise.all([
      supabase.from('treatment_usage').insert(usageRows),
      supabase
        .from('customer_dye_stocks')
        .select('id, current_amount, dye_id')
        .eq('customer_id', customerId)
        .in('dye_id', dyeIds),
    ])

    // 3. 고객 염색약 잔량 차감 — 병렬 업데이트
    const stockMap = new Map((stockResult.data ?? []).map(s => [s.dye_id, s]))
    await Promise.all(
      usages.map(u => {
        const stock = stockMap.get(u.dye_id)
        if (!stock) return Promise.resolve()
        const newAmount = Math.max(0, Number(stock.current_amount) - Number(u.amount))
        const status = newAmount <= 0 ? '소진' : newAmount < 50 ? '주의' : '정상'
        return supabase
          .from('customer_dye_stocks')
          .update({ current_amount: newAmount, status })
          .eq('id', stock.id)
      })
    )
  }

  // 4. 예약 상태 → 시술완료
  if (reservationId) {
    const { error: resError } = await supabase
      .from('reservations')
      .update({ status: '시술완료', updated_at: new Date().toISOString() })
      .eq('id', reservationId)
    if (resError) console.error('reservation update error:', resError)
  }

  revalidatePath('/treatments')
  revalidatePath('/reservations')
  revalidatePath('/customers')
  revalidatePath('/sales')
  revalidatePath('/')
  return { success: true }
}

export async function getTreatmentTypes() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('treatment_types').select('id, name, base_price').order('name')

  if (error) throw new Error(error.message)
  return data
}

export async function getDyeTypes() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('dye_types').select('id, name').order('name')

  if (error) throw new Error(error.message)
  return data
}

export async function getUnits() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('units').select('id, name').order('name')

  if (error) throw new Error(error.message)
  return data
}

export async function getCustomerDyeStocks(customerId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('customer_dye_stocks')
    .select('id, dye_id, unit_id, current_amount, status, dye:dye_types(name), unit:units(name)')
    .eq('customer_id', customerId)

  if (error) throw new Error(error.message)
  return data
}

export async function registerTreatmentAction(
  customerId: string,
  treatmentTypeId: string,
  totalPrice: number,
  paymentMethod: string,
  memo: string,
  treatedAt: string,
  usages: { dye_id: string; unit_id: string; amount: number }[]
) {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('register_treatment', {
    p_customer_id: customerId,
    p_treatment_type_id: treatmentTypeId,
    p_total_price: totalPrice,
    p_payment_method: paymentMethod,
    p_memo: memo,
    p_treated_at: treatedAt,
    p_usages: usages
  })

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/treatments')
  revalidatePath('/customers')
  return { success: true, treatmentId: data }
}

export async function getLatestTreatmentUsage(customerId: string) {
  const supabase = await createClient()
  
  // 1. Get the latest treatment ID for this customer
  const { data: latestTreatment, error: tError } = await supabase
    .from('treatments')
    .select('id')
    .eq('customer_id', customerId)
    .order('treated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (tError || !latestTreatment) return []

  // 2. Get the usages for that treatment
  const { data: usages, error: uError } = await supabase
    .from('treatment_usage')
    .select('dye_id, unit_id, amount')
    .eq('treatment_id', latestTreatment.id)

  if (uError) throw new Error(uError.message)
  return usages
}

export async function saveDefaultRecipe(
  customerId: string, 
  usages: { dye_id: string; unit_id: string; amount: number }[]
) {
  const supabase = await createClient()
  
  // 1. Delete existing default recipe for this customer
  await supabase.from('customer_recipes').delete().eq('customer_id', customerId)
  
  // 2. Insert new default recipe
  const recipeData = usages.map(u => ({
    customer_id: customerId,
    dye_id: u.dye_id,
    unit_id: u.unit_id,
    default_use_amount: u.amount
  }))

  const { error } = await supabase.from('customer_recipes').insert(recipeData)
  
  if (error) return { success: false, error: error.message }
  return { success: true }
}

export async function getDefaultRecipe(customerId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('customer_recipes')
    .select('dye_id, unit_id, amount:default_use_amount')
    .eq('customer_id', customerId)
  
  if (error) throw new Error(error.message)
  return data
}
