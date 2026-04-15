import { createClient } from '@/lib/supabase/server'

export async function getInventory() {
  const supabase = await createClient()

  // 재고 + 레시피를 2번의 쿼리로 처리 (기존 N+1 → 2 queries)
  const [stocksResult, recipesResult] = await Promise.all([
    supabase
      .from('customer_dye_stocks')
      .select(`
        id,
        customer_id,
        dye_id,
        current_amount,
        status,
        created_at,
        customers(name),
        dye_types(name),
        units(name)
      `)
      .order('created_at', { ascending: false }),

    supabase
      .from('customer_recipes')
      .select('customer_id, dye_id, default_use_amount'),
  ])

  if (stocksResult.error) {
    console.error('Error fetching inventory:', stocksResult.error)
    return []
  }

  // 레시피를 Map으로 변환하여 O(1) 조회
  const recipeMap = new Map(
    (recipesResult.data ?? []).map((r) => [
      `${r.customer_id}:${r.dye_id}`,
      r.default_use_amount,
    ])
  )

  return (stocksResult.data ?? []).map((stock) => {
    const recipeAmount = recipeMap.get(`${stock.customer_id}:${stock.dye_id}`) || 0
    const remainingUses =
      recipeAmount > 0
        ? Number((stock.current_amount / recipeAmount).toFixed(1))
        : 0

    return {
      ...stock,
      customer: stock.customers,
      dye_type: stock.dye_types,
      unit: stock.units,
      recipe_amount: recipeAmount,
      remaining_uses: remainingUses,
    }
  })
}
