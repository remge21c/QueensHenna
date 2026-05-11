import { createAdminClient } from '@/lib/supabase/admin'

const TABLES = [
  'customers',
  'reservations',
  'treatments',
  'treatment_usage',
  'customer_dye_stocks',
  'customer_recipes',
  'dye_types',
  'treatment_types',
  'units',
] as const

export async function getAllTableData() {
  const admin = createAdminClient()
  const results = await Promise.all(
    TABLES.map((table) => admin.from(table).select('*'))
  )

  const dump: Record<string, any[]> = {}
  results.forEach(({ data, error }, i) => {
    if (error) {
      console.error(`Failed to dump ${TABLES[i]}:`, error.message)
    }
    dump[TABLES[i]] = data ?? []
  })

  return dump
}
