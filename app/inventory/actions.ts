"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

// ── 염색약 마스터 (dye_types) ──────────────────────────────

export async function getDyeTypes() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("dye_types")
    .select("id, name, total_capacity, default_unit_id, memo, is_active, units:default_unit_id(name)")
    .order("name")
  if (error) {
    console.error("getDyeTypes error:", error)
    return []
  }
  return data
}

export async function getUnits() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("units")
    .select("*")
    .order("name")
  if (error) throw error
  return data
}

export async function createUnit(name: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("units").insert({ name })
  if (error) return { success: false, error: error.message }
  revalidatePath("/inventory")
  return { success: true }
}

export async function updateUnit(id: string, name: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("units").update({ name }).eq("id", id)
  if (error) return { success: false, error: error.message }
  revalidatePath("/inventory")
  return { success: true }
}

export async function deleteUnit(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("units").delete().eq("id", id)
  if (error) return { success: false, error: error.message }
  revalidatePath("/inventory")
  return { success: true }
}

export async function createDyeType(formData: {
  name: string
  total_capacity: number
  default_unit_id: string
  memo?: string
}) {
  const supabase = await createClient()
  const { error } = await supabase.from("dye_types").insert({
    name: formData.name,
    total_capacity: formData.total_capacity,
    default_unit_id: formData.default_unit_id || null,
    memo: formData.memo || null,
    is_active: true,
  })
  if (error) return { success: false, error: error.message }
  revalidatePath("/inventory")
  return { success: true }
}

export async function updateDyeType(
  id: string,
  formData: { name: string; total_capacity: number; default_unit_id: string; memo?: string }
) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("dye_types")
    .update({
      name: formData.name,
      total_capacity: formData.total_capacity,
      default_unit_id: formData.default_unit_id || null,
      memo: formData.memo || null,
    })
    .eq("id", id)
  if (error) return { success: false, error: error.message }
  revalidatePath("/inventory")
  return { success: true }
}

export async function deleteDyeType(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("dye_types").delete().eq("id", id)
  if (error) return { success: false, error: error.message }
  revalidatePath("/inventory")
  return { success: true }
}

export async function createBatchDyePurchase(data: {
  customer_id: string
  entries: { dye_id: string; unit_id: string; amount: number }[]
  memo?: string
  mode?: 'add' | 'set'
}) {
  const supabase = await createClient()
  const { customer_id, entries, mode = 'add' } = data

  for (const entry of entries) {
    const { data: existingStock } = await supabase
      .from("customer_dye_stocks")
      .select("id, purchased_amount, current_amount")
      .eq("customer_id", customer_id)
      .eq("dye_id", entry.dye_id)
      .maybeSingle()

    if (mode === 'set') {
      const status = entry.amount <= 0 ? '소진' : '정상'
      if (existingStock) {
        await supabase
          .from("customer_dye_stocks")
          .update({ purchased_amount: entry.amount, current_amount: entry.amount, status })
          .eq("id", existingStock.id)
      } else {
        await supabase.from("customer_dye_stocks").insert({
          customer_id,
          dye_id: entry.dye_id,
          unit_id: entry.unit_id,
          purchased_amount: entry.amount,
          current_amount: entry.amount,
          status,
        })
      }
    } else {
      // 'add' mode
      if (existingStock) {
        const newAmount = Number(existingStock.current_amount) + Number(entry.amount)
        const status = newAmount <= 0 ? '소진' : '정상'
        await supabase
          .from("customer_dye_stocks")
          .update({
            purchased_amount: Number(existingStock.purchased_amount) + Number(entry.amount),
            current_amount: newAmount,
            status,
          })
          .eq("id", existingStock.id)
      } else {
        await supabase.from("customer_dye_stocks").insert({
          customer_id,
          dye_id: entry.dye_id,
          unit_id: entry.unit_id,
          purchased_amount: entry.amount,
          current_amount: entry.amount,
          status: "정상",
        })
      }
    }
  }

  revalidatePath("/inventory")
  revalidatePath(`/customers/${customer_id}`)
  redirect(`/customers/${customer_id}`)
}

// Sheet(모달)용 액션 — redirect 없이 revalidate만 수행
export async function upsertDyeStocksFromSheet(data: {
  customer_id: string
  entries: { dye_id: string; unit_id: string; amount: number }[]
  memo?: string
  mode?: 'add' | 'set'
}) {
  const supabase = await createClient()
  const { customer_id, entries, mode = 'add' } = data

  for (const entry of entries) {
    const { data: existingStock } = await supabase
      .from("customer_dye_stocks")
      .select("id, purchased_amount, current_amount")
      .eq("customer_id", customer_id)
      .eq("dye_id", entry.dye_id)
      .maybeSingle()

    if (mode === 'set') {
      const status = entry.amount <= 0 ? '소진' : '정상'
      if (existingStock) {
        await supabase
          .from("customer_dye_stocks")
          .update({ purchased_amount: entry.amount, current_amount: entry.amount, status })
          .eq("id", existingStock.id)
      } else {
        await supabase.from("customer_dye_stocks").insert({
          customer_id, dye_id: entry.dye_id, unit_id: entry.unit_id,
          purchased_amount: entry.amount, current_amount: entry.amount, status,
        })
      }
    } else {
      if (existingStock) {
        const newAmount = Number(existingStock.current_amount) + Number(entry.amount)
        const status = newAmount <= 0 ? '소진' : '정상'
        await supabase
          .from("customer_dye_stocks")
          .update({
            purchased_amount: Number(existingStock.purchased_amount) + Number(entry.amount),
            current_amount: newAmount, status,
          })
          .eq("id", existingStock.id)
      } else {
        await supabase.from("customer_dye_stocks").insert({
          customer_id, dye_id: entry.dye_id, unit_id: entry.unit_id,
          purchased_amount: entry.amount, current_amount: entry.amount, status: "정상",
        })
      }
    }
  }

  revalidatePath("/inventory")
  revalidatePath(`/customers/${customer_id}`)
  return { success: true }
}

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
