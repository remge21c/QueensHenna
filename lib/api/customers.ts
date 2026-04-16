import { createClient } from '@/lib/supabase/server'

export async function getCustomers() {
  const supabase = await createClient()

  // 고객 정보와 시술 통계를 병렬로 조회
  const [customersResult, treatmentStatsResult] = await Promise.all([
    supabase
      .from('customers')
      .select(`
        id, name, phone, birth_date, memo, created_at, updated_at,
        customer_dye_stocks(
          id, status, current_amount, dye_id,
          dye_types(name),
          units(name)
        )
      `)
      .order('name', { ascending: true }),

    // 시술 통계: 고객별 횟수 + 최근 날짜를 단일 쿼리로 집계
    supabase
      .from('treatments')
      .select('customer_id, treated_at')
      .order('treated_at', { ascending: false }),
  ])

  if (customersResult.error) {
    console.error('Error fetching customers:', customersResult.error)
    return []
  }

  // 시술 데이터를 고객별로 집계 (JS에서 O(n) 처리)
  const treatmentMap = new Map<string, { count: number; latest: string | null }>()
  for (const t of treatmentStatsResult.data ?? []) {
    const existing = treatmentMap.get(t.customer_id)
    if (!existing) {
      treatmentMap.set(t.customer_id, { count: 1, latest: t.treated_at })
    } else {
      existing.count += 1
      // treated_at DESC 정렬이므로 첫 번째가 최신
    }
  }

  return (customersResult.data ?? []).map((customer: any) => {
    const stats = treatmentMap.get(customer.id)
    return {
      ...customer,
      last_visit: stats?.latest ?? null,
      total_visits: stats?.count ?? 0,
      primary_stock: customer.customer_dye_stocks?.[0] ?? null,
    }
  })
}

export async function getCustomerDetail(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('customers')
    .select(`
      id, name, phone, birth_date, memo, created_at, updated_at,
      treatments(
        id, treated_at, total_price, payment_method, memo, status,
        treatment_types(id, name, base_price)
      ),
      customer_dye_stocks(
        id, dye_id, current_amount, status, created_at,
        dye_types(id, name),
        units(id, name)
      ),
      customer_recipes(
        id, dye_id, default_use_amount,
        dye_types(id, name),
        units(id, name)
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching customer detail:', error)
    return null
  }

  return data
}
