'use server'

import { createClient } from '@/lib/supabase/server'
import { startOfMonth, endOfMonth, format } from 'date-fns'

export async function getSalesStats(monthStr?: string) {
  const supabase = await createClient()
  
  const targetDate = monthStr ? new Date(monthStr) : new Date()
  const monthStart = startOfMonth(targetDate).toISOString()
  const monthEnd = endOfMonth(targetDate).toISOString()

  // 1. Fetch all treatments for the month
  const { data: treatments, error } = await supabase
    .from('treatments')
    .select('*')
    .gte('treated_at', monthStart)
    .lte('treated_at', monthEnd)
    .order('treated_at', { ascending: false })

  if (error) throw error

  // 2. Aggregate data
  const totalRevenue = treatments.reduce((acc, t) => acc + (t.total_price || 0), 0)
  const totalCount = treatments.length
  const cardPayments = treatments.filter(t => t.payment_method === '카드').reduce((acc, t) => acc + (t.total_price || 0), 0)
  const avgTicket = totalCount > 0 ? totalRevenue / totalCount : 0
  const cardRatio = totalRevenue > 0 ? (cardPayments / totalRevenue) * 100 : 0

  // 3. Daily breakdown
  const dailyMap: Record<string, any> = {}
  treatments.forEach(t => {
    const day = format(new Date(t.treated_at), 'yyyy-MM-dd')
    if (!dailyMap[day]) {
      dailyMap[day] = { date: day, count: 0, card: 0, cash: 0, total: 0 }
    }
    dailyMap[day].count += 1
    if (t.payment_method === '카드') dailyMap[day].card += t.total_price
    else dailyMap[day].cash += t.total_price
    dailyMap[day].total += t.total_price
  })

  const dailyBreakdown = Object.values(dailyMap).sort((a, b) => b.date.localeCompare(a.date))

  return {
    totalRevenue,
    totalCount,
    cardRatio,
    avgTicket,
    dailyBreakdown
  }
}
