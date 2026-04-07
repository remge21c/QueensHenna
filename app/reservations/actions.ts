'use server'

import { createClient } from '@/lib/supabase/server'
import { startOfDay, endOfDay, parseISO, format } from 'date-fns'

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
      customers (
        name
      )
    `)
    .gte('reserved_at', start)
    .lte('reserved_at', end)
    .order('reserved_at', { ascending: true })

  if (error) {
    console.error('Error fetching reservations:', error)
    return []
  }

  // Transform 'customers' to 'customer' to match our UI interface
  return data.map((res: any) => ({
    id: res.id,
    reserved_at: res.reserved_at,
    status: res.status,
    memo: res.memo,
    customer: res.customers
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

export async function createReservation(payload: {
  customer_id: string
  reserved_at: string
  status: string
  memo?: string
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
  return data[0]
}
