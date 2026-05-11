'use server'

import { createClient } from '@/lib/supabase/server'
import { startOfDay, endOfDay, startOfMonth, endOfMonth, subDays } from 'date-fns'

export async function getDashboardStats() {
  const supabase = await createClient()
  const todayStart = startOfDay(new Date()).toISOString()
  const todayEnd = endOfDay(new Date()).toISOString()
  const monthStart = startOfMonth(new Date()).toISOString()
  const monthEnd = endOfMonth(new Date()).toISOString()
  const tomorrowStart = startOfDay(new Date(new Date().getTime() + 24 * 60 * 60 * 1000)).toISOString()
  const nextWeekEnd = endOfDay(new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000)).toISOString()
  const now = new Date().toISOString()

  // 독립적인 8개 쿼리를 Promise.all로 병렬 실행
  const [
    { count: todayReservationsCount },
    { data: todayTreatments },
    { data: monthTreatments },
    { count: todayNewCustomers },
    { data: reservations },
    { data: weeklyReservations },
    { data: recentTreatments },
    { data: lowStockCustomers },
  ] = await Promise.all([
    // 1. 오늘 예약 수
    supabase
      .from('reservations')
      .select('*', { count: 'exact', head: true })
      .gte('reserved_at', todayStart)
      .lte('reserved_at', todayEnd)
      .eq('status', '예약'),

    // 2. 오늘 매출
    supabase
      .from('treatments')
      .select('total_price')
      .gte('treated_at', todayStart)
      .lte('treated_at', todayEnd),

    // 3. 이번 달 누적 매출
    supabase
      .from('treatments')
      .select('total_price')
      .gte('treated_at', monthStart)
      .lte('treated_at', monthEnd),

    // 4. 오늘 신규 고객
    supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', todayStart)
      .lte('created_at', todayEnd),

    // 5. 오늘 예약 목록
    supabase
      .from('reservations')
      .select('id, reserved_at, status, memo, customers(name, phone)')
      .gte('reserved_at', todayStart)
      .lte('reserved_at', todayEnd)
      .eq('status', '예약')
      .order('reserved_at', { ascending: true }),

    // 5-1. 주간 예약 목록
    supabase
      .from('reservations')
      .select('id, reserved_at, status, memo, customers(name, phone)')
      .gte('reserved_at', tomorrowStart)
      .lte('reserved_at', nextWeekEnd)
      .eq('status', '예약')
      .order('reserved_at', { ascending: true }),

    // 6. 최근 시술 기록 5개 (미래 날짜 제외)
    supabase
      .from('treatments')
      .select('id, treated_at, total_price, payment_method, treatment_types(name), customers(name)')
      .lte('treated_at', now)
      .order('treated_at', { ascending: false })
      .limit(5),

    // 7. 염색약 부족 고객 (잔여 1.0 미만)
    supabase
      .from('customer_dye_stocks')
      .select('current_amount, customers(id, name, phone)')
      .lt('current_amount', 1.0)
      .order('current_amount', { ascending: true })
      .limit(5),
  ])

  const todaySales = todayTreatments?.reduce((acc, curr) => acc + (curr.total_price || 0), 0) || 0
  const monthSales = monthTreatments?.reduce((acc, curr) => acc + (curr.total_price || 0), 0) || 0

  return {
    todayReservationsCount: todayReservationsCount || 0,
    todaySales,
    monthSales,
    todayNewCustomers: todayNewCustomers || 0,
    reservations: (reservations || []).map(r => ({
      ...r,
      reservation_time: r.reserved_at,
    })),
    weeklyReservations: (weeklyReservations || []).map(r => ({
      ...r,
      reservation_time: r.reserved_at,
    })),
    recentTreatments: (recentTreatments || []).map(t => ({
      ...t,
      treatment_date: t.treated_at,
      payment_amount: t.total_price,
    })),
    lowStockCustomers: (lowStockCustomers || []).map(s => ({
      ...s,
      remaining_quantity: s.current_amount,
    })),
  }
}
