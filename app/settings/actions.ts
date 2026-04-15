'use server'

import { createClient } from '@/lib/supabase/server'

export async function getBackupData() {
  const supabase = await createClient()

  const tables = [
    'customers',
    'reservations',
    'treatments',
    'treatment_usage',
    'customer_dye_stocks',
    'customer_recipes',
    'dye_types',
    'treatment_types',
    'units',
  ]

  // 9개 테이블 병렬 조회
  const results = await Promise.all(
    tables.map(table => supabase.from(table).select('*'))
  )

  const backup: Record<string, any[]> = {}
  results.forEach(({ data, error }, i) => {
    if (error) {
      console.error(`Failed to backup table ${tables[i]}:`, error.message)
    }
    backup[tables[i]] = data || []
  })

  return backup
}

export async function restoreData(backup: Record<string, any[]>) {
  const supabase = await createClient()
  
  // Note: This is a destructive operation or should be upserted carefully.
  // For MVP, we'll try to upsert known tables.
  
  const tables = Object.keys(backup)
  
  for (const table of tables) {
    if (backup[table].length === 0) continue
    
    const { error } = await supabase.from(table).upsert(backup[table])
    if (error) {
      console.error(`Failed to restore table ${table}:`, error.message)
      return { success: false, error: `${table} 복원 실패: ${error.message}` }
    }
  }

  return { success: true }
}

export async function getTreatmentTypes() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('treatment_types').select('id, name, base_price').order('name')
  if (error) throw error
  return data
}

export async function updateTreatmentType(id: string, name: string, defaultPrice: number) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('treatment_types')
    .update({ name, base_price: defaultPrice })
    .eq('id', id)
  
  if (error) return { success: false, error: error.message }
  return { success: true }
}

export async function createTreatmentType(name: string, defaultPrice: number) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('treatment_types')
    .insert({ name, base_price: defaultPrice })
  
  if (error) return { success: false, error: error.message }
  return { success: true }
}

export async function deleteTreatmentType(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('treatment_types').delete().eq('id', id)
  if (error) return { success: false, error: error.message }
  return { success: true }
}

// 단위(units) 관리는 app/inventory/actions.ts 및 염색약 관리 페이지로 통합되었습니다.
