"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createCustomer(formData: any) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("customers")
    .insert({
      name: formData.name,
      phone: formData.phone,
      birth_date: formData.birth_date || null,
      memo: formData.memo || null,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating customer:", error)
    return { error: error.message }
  }

  const customerId = data.id

  // 활성 마스터 염색약으로 기본 레시피 자동 생성 (수량 0 = 미확정)
  const { data: dyeTypes } = await supabase
    .from("dye_types")
    .select("id, default_unit_id")
    .eq("is_active", true)
    .order("name")

  if (dyeTypes && dyeTypes.length > 0) {
    const recipeRows = dyeTypes.map((d) => ({
      customer_id: customerId,
      dye_id: d.id,
      unit_id: d.default_unit_id || null,
      default_use_amount: 0,
    }))
    await supabase.from("customer_recipes").insert(recipeRows)
  }

  revalidatePath("/customers")
  redirect(`/customers/${customerId}`)
}

export async function updateCustomer(id: string, formData: any) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("customers")
    .update({
      name: formData.name,
      phone: formData.phone,
      birth_date: formData.birth_date || null,
      memo: formData.memo || null,
    })
    .eq("id", id)

  if (error) {
    console.error("Error updating customer:", error)
    return { error: error.message }
  }

  revalidatePath("/customers")
  revalidatePath(`/customers/${id}`)
  return { success: true }
}

export async function searchCustomers(query: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('customers')
    .select('id, name, phone')
    .or(`name.ilike.%${query}%,phone.ilike.%${query}%`)
    .limit(10)

  if (error) {
    console.error('Error searching customers:', error)
    return []
  }
  return data
}
