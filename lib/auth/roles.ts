export type UserRole = 'owner' | 'staff'

export function getRoleFromUser(user: any): UserRole {
  return user?.app_metadata?.role ?? 'staff'
}

export const OWNER_ONLY_PATHS = ['/settings']
