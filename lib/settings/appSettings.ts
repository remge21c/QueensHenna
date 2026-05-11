import { createAdminClient } from '@/lib/supabase/admin'

export async function getSetting<T = any>(key: string): Promise<T | null> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('app_settings')
    .select('value')
    .eq('key', key)
    .maybeSingle()
  return (data?.value as T) ?? null
}

export async function setSetting(key: string, value: any, userId?: string) {
  const admin = createAdminClient()
  const { error } = await admin.from('app_settings').upsert({
    key,
    value,
    updated_at: new Date().toISOString(),
    updated_by: userId ?? null,
  })
  if (error) throw new Error(error.message)
}
