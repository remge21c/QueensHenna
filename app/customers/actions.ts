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

  if (error) {
    console.error("Error creating customer:", error)
    return { error: error.message }
  }

  revalidatePath("/customers")
  redirect("/customers")
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
