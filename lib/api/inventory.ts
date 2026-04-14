import { createClient } from '@/lib/supabase/server'

export async function getInventory() {
  const supabase = await createClient()

  // 고객별 염색약 잔량(customer_dye_stocks) 조회 및 레시피(customer_recipes) 조인
  const { data, error } = await supabase
    .from('customer_dye_stocks')
    .select(`
      *,
      customers(name),
      dye_types(name),
      units(name)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching inventory:', error)
    return []
  }

  // 레시피 기반 사용량 조회를 위한 개별 요청 (Supabase join 제약 해결)
  // 실제 서비스라면 RPC를 사용하는 것이 성능상 유리할 수 있음.
  const inventoryWithRecipes = await Promise.all(data.map(async (stock) => {
    const { data: recipe } = await supabase
      .from('customer_recipes')
      .select('default_use_amount')
      .eq('customer_id', stock.customer_id)
      .eq('dye_id', stock.dye_id)
      .single()

    const recipeAmount = recipe?.default_use_amount || 0
    const remainingUses = recipeAmount > 0 
      ? Number((stock.current_amount / recipeAmount).toFixed(1)) 
      : 0

    return {
      ...stock,
      customer: stock.customers,
      dye_type: stock.dye_types,
      unit: stock.units,
      recipe_amount: recipeAmount,
      remaining_uses: remainingUses
    }
  }))

  return inventoryWithRecipes
}
