'use server'

import { createClient } from '@/lib/supabase/server'
import { startOfDay, endOfDay, parseISO, addDays, format } from 'date-fns'

export async function getTreatmentTypesForReservation() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('treatment_types')
    .select('id, name')
    .order('name')
  if (error) return []
  return data
}

export async function getReservationsByWeek(mondayStr: string) {
  const supabase = await createClient()
  const monday = parseISO(mondayStr)
  const start = startOfDay(monday).toISOString()
  const end = endOfDay(addDays(monday, 6)).toISOString()

  const { data, error } = await supabase
    .from('reservations')
    .select(`
      id,
      reserved_at,
      status,
      memo,
      customer_id,
      treatment_type_id,
      customers (name),
      treatment_types (name)
    `)
    .gte('reserved_at', start)
    .lte('reserved_at', end)
    .not('status', 'in', '("취소","노쇼")')
    .order('reserved_at', { ascending: true })

  if (error) return {} as Record<string, any[]>

  // 날짜별로 그룹핑
  const grouped: Record<string, any[]> = {}
  for (let i = 0; i < 7; i++) {
    const dateKey = format(addDays(monday, i), 'yyyy-MM-dd')
    grouped[dateKey] = []
  }
  data.forEach((res: any) => {
    const dateKey = format(parseISO(res.reserved_at), 'yyyy-MM-dd')
    if (grouped[dateKey]) {
      grouped[dateKey].push({
        id: res.id,
        reserved_at: res.reserved_at,
        status: res.status,
        memo: res.memo,
        customer_id: res.customer_id,
        customer: res.customers,
        treatment_type: res.treatment_types,
      })
    }
  })
  return grouped
}

export async function getReservationsByDate(dateString: string) {
  const supabase = await createClient()
  
  // If dateString is '2026-04-07', we need to cover the whole day in UTC or Local?
  // Supabase TIMESTAMP WITH TIME ZONE stores in UTC but accepts ISO.
  // For '2026-04-07', we want to fetch from 00:00:00 to 23:59:59 in the local timezone of the picker.
  
  const date = parseISO(dateString)
  const start = startOfDay(date).toISOString()
  const end = endOfDay(date).toISOString()

  const { data, error } = await supabase
    .from('reservations')
    .select(`
      id,
      reserved_at,
      status,
      memo,
      customer_id,
      treatment_type_id,
      customers (name),
      treatment_types (name, base_price)
    `)
    .gte('reserved_at', start)
    .lte('reserved_at', end)
    .order('reserved_at', { ascending: true })

  if (error) {
    console.error('Error fetching reservations:', error)
    return []
  }

  // 각 예약에 연결된 pending treatment id 조회
  const reservationIds = data.map((r: any) => r.id)
  let treatmentMap: Record<string, string> = {}
  if (reservationIds.length > 0) {
    const { data: treatments } = await supabase
      .from('treatments')
      .select('id, reservation_id')
      .in('reservation_id', reservationIds)
      .eq('status', 'pending')
    treatments?.forEach((t: any) => { treatmentMap[t.reservation_id] = t.id })
  }

  return data.map((res: any) => ({
    id: res.id,
    reserved_at: res.reserved_at,
    status: res.status,
    memo: res.memo,
    customer_id: res.customer_id,
    customer: res.customers,
    treatment_type: res.treatment_types,
    treatment_id: treatmentMap[res.id] || null,
  }))
}

export async function updateReservationStatus(id: string, status: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('reservations')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()

  if (error) {
    throw new Error(error.message)
  }
  return data[0]
}

export async function deleteReservation(id: string) {
  const supabase = await createClient()
  // 연결된 pending 시술 기록 먼저 삭제
  await supabase.from('treatments').delete().eq('reservation_id', id).eq('status', 'pending')
  const { error } = await supabase.from('reservations').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function createReservation(payload: {
  customer_id: string
  reserved_at: string
  status: string
  memo?: string
  treatment_type_id?: string | null
}) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('reservations')
    .insert([payload])
    .select()

  if (error) {
    console.error('Error creating reservation:', error)
    throw new Error(error.message)
  }

  const reservation = data[0]

  // 시술 종류가 선택된 경우 pending 시술 기록 자동 생성
  if (reservation && payload.treatment_type_id) {
    const { error: treatmentError } = await supabase
      .from('treatments')
      .insert({
        customer_id: payload.customer_id,
        treatment_type_id: payload.treatment_type_id,
        reservation_id: reservation.id,
        treated_at: payload.reserved_at,
        status: 'pending',
        total_price: 0,
      })
    if (treatmentError) {
      console.error('Error creating pending treatment:', treatmentError)
    }
  }

  return reservation
}
