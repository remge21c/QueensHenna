'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getTreatmentTypes() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('treatment_types').select('*').order('name')
  
  if (error) throw new Error(error.message)
  return data
}

export async function getDyeTypes() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('dye_types').select('*').order('name')
  
  if (error) throw new Error(error.message)
  return data
}

export async function getUnits() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('units').select('*').order('name')
  
  if (error) throw new Error(error.message)
  return data
}

export async function getCustomerDyeStocks(customerId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('customer_dye_stocks')
    .select(`
      *,
      dye:dye_types(name),
      unit:units(name)
    `)
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
  usages: { dye_id: string; unit_id: string; amount: number }[]
) {
  const supabase = await createClient()
  
  const { data, error } = await supabase.rpc('register_treatment', {
    p_customer_id: customerId,
    p_treatment_type_id: treatmentTypeId,
    p_total_price: totalPrice,
    p_payment_method: paymentMethod,
    p_memo: memo,
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
