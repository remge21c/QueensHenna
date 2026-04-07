"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createDyePurchase(formData: any) {
  const supabase = await createClient()

  const {
    customer_id,
    dye_id,
    unit_id,
    amount,
    memo
  } = formData

  // 기성 재고 확인
  const { data: existingStock } = await supabase
    .from("customer_dye_stocks")
    .select("*")
    .eq("customer_id", customer_id)
    .eq("dye_id", dye_id)
    .single()

  let error
  if (existingStock) {
    const { error: updateError } = await supabase
      .from("customer_dye_stocks")
      .update({
        purchased_amount: Number(existingStock.purchased_amount) + Number(amount),
        current_amount: Number(existingStock.current_amount) + Number(amount),
        updated_at: new Date().toISOString()
      })
      .eq("id", existingStock.id)
    error = updateError
  } else {
    const { error: insertError } = await supabase
      .from("customer_dye_stocks")
      .insert({
        customer_id,
        dye_id,
        unit_id,
        purchased_amount: amount,
        current_amount: amount,
        status: "정상"
      })
    error = insertError
  }

  if (error) {
    console.error("Error creating dye purchase:", error)
    return { error: error.message }
  }

  revalidatePath("/inventory")
  revalidatePath(`/customers/${customer_id}`)
  redirect("/inventory")
}
