'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getRoleFromUser, type UserRole } from '@/lib/auth/roles'

async function requireOwner() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || getRoleFromUser(user) !== 'owner') {
    throw new Error('권한이 없습니다.')
  }
  return user
}

export async function getUsers() {
  await requireOwner()
  const admin = createAdminClient()
  const { data, error } = await admin.auth.admin.listUsers()
  if (error) return { success: false as const, error: error.message, users: [] }
  return { success: true as const, users: data.users }
}

export async function inviteUser(email: string, role: UserRole) {
  await requireOwner()
  const admin = createAdminClient()

  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/confirm`,
  })
  if (error) return { success: false as const, error: error.message }

  const { error: updateError } = await admin.auth.admin.updateUserById(data.user.id, {
    app_metadata: { role },
  })
  if (updateError) return { success: false as const, error: updateError.message }

  return { success: true as const }
}

export async function updateUserRole(userId: string, role: UserRole) {
  await requireOwner()
  const admin = createAdminClient()
  const { error } = await admin.auth.admin.updateUserById(userId, {
    app_metadata: { role },
  })
  if (error) return { success: false as const, error: error.message }
  return { success: true as const }
}

export async function deleteUser(userId: string) {
  const currentUser = await requireOwner()
  if (currentUser.id === userId) {
    return { success: false as const, error: '자기 자신은 삭제할 수 없습니다.' }
  }
  const admin = createAdminClient()
  const { error } = await admin.auth.admin.deleteUser(userId)
  if (error) return { success: false as const, error: error.message }
  return { success: true as const }
}
