import { createClient } from '@/lib/supabase/client'

export async function getCustomers() {
  const supabase = createClient()

  // 고객 목록과 함께 최근 1개의 시술 기록과 모든 염색약 잔량 정보를 가져옴
  const { data, error } = await supabase
    .from('customers')
    .select(`
      *,
      treatments(treated_at, status),
      customer_dye_stocks(
        id,
        status,
        current_amount,
        dye_id,
        dye_types(name)
      )
    `)
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching customers:', error)
    return []
  }

  // 데이터 가공 (프론트엔드에서 사용하기 편한 형태로 변환)
  return data.map((customer: any) => {
    // 가장 최근의 '방문완료' 일자 찾기
    const lastTreatment = customer.treatments
      ?.filter((t: any) => t.status === '방문완료')
      .sort((a: any, b: any) => 
        new Date(b.treated_at).getTime() - new Date(a.treated_at).getTime()
      )[0]

    return {
      ...customer,
      last_visit: lastTreatment?.treated_at || null,
      total_visits: customer.treatments?.filter((t: any) => t.status === '방문완료').length || 0,
      // 대표 염색약 하나만 표시 (필요 시 수정 가능)
      primary_stock: customer.customer_dye_stocks?.[0] || null
    }
  })
}

export async function getCustomerDetail(id: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('customers')
    .select(`
      *,
      treatments(
        *,
        treatment_types(*)
      ),
      customer_dye_stocks(
        *,
        dye_types(*),
        units(*)
      ),
      customer_recipes(
        *,
        dye_types(*),
        units(*)
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
