'use server'

import { createClient } from '@/lib/supabase/server'
import { startOfDay, endOfDay, startOfMonth, endOfMonth, subDays } from 'date-fns'

export async function getDashboardStats() {
  const supabase = await createClient()
  const todayStart = startOfDay(new Date()).toISOString()
  const todayEnd = endOfDay(new Date()).toISOString()
  const monthStart = startOfMonth(new Date()).toISOString()
  const monthEnd = endOfMonth(new Date()).toISOString()

  // 1. 오늘의 예약 수 (시술 대기 중인 것만)
  const { count: todayReservationsCount } = await supabase
    .from('reservations')
    .select('*', { count: 'exact', head: true })
    .gte('reserved_at', todayStart)
    .lte('reserved_at', todayEnd)
    .eq('status', '예약')

  // 2. 오늘 매출
  const { data: todayTreatments } = await supabase
    .from('treatments')
    .select('total_price')
    .gte('treated_at', todayStart)
    .lte('treated_at', todayEnd)
  
  const todaySales = todayTreatments?.reduce((acc, curr) => acc + (curr.total_price || 0), 0) || 0

  // 3. 이번 달 누적 매출
  const { data: monthTreatments } = await supabase
    .from('treatments')
    .select('total_price')
    .gte('treated_at', monthStart)
    .lte('treated_at', monthEnd)
  
  const monthSales = monthTreatments?.reduce((acc, curr) => acc + (curr.total_price || 0), 0) || 0

  // 4. 오늘 신규 고객
  const { count: todayNewCustomers } = await supabase
    .from('customers')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', todayStart)
    .lte('created_at', todayEnd)

  // 5. 오늘 시술 대기 목록 (예약 상태만)
  const { data: reservations } = await supabase
    .from('reservations')
    .select(`
      id,
      reserved_at,
      status,
      memo,
      customers (
        name,
        phone
      )
    `)
    .gte('reserved_at', todayStart)
    .lte('reserved_at', todayEnd)
    .eq('status', '예약')
    .order('reserved_at', { ascending: true })

  // 6. 최근 시술 기록 (10개)
  const { data: recentTreatments } = await supabase
    .from('treatments')
    .select(`
      id,
      treated_at,
      total_price,
      payment_method,
      treatment_types (
        name
      ),
      customers (
        name
      )
    `)
    .order('treated_at', { ascending: false })
    .limit(5)

  // 7. 염색약 부족 고객 (임보: 잔여 1.0 미만)
  const { data: lowStockCustomers } = await supabase
    .from('customer_dye_stocks')
    .select(`
      current_amount,
      customers (
        id,
        name,
        phone
      )
    `)
    .lt('current_amount', 1.0)
    .order('current_amount', { ascending: true })
    .limit(5)

  return {
    todayReservationsCount: todayReservationsCount || 0,
    todaySales,
    monthSales,
    todayNewCustomers: todayNewCustomers || 0,
    reservations: (reservations || []).map(r => ({
      ...r,
      reservation_time: r.reserved_at // UI compatibility
    })),
    recentTreatments: (recentTreatments || []).map(t => ({
      ...t,
      treatment_date: t.treated_at,
      payment_amount: t.total_price
    })),
    lowStockCustomers: (lowStockCustomers || []).map(s => ({
      ...s,
      remaining_quantity: s.current_amount
    }))
  }
}
