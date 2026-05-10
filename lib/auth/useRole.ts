"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { getRoleFromUser, type UserRole } from "./roles"

export function useRole() {
  const [role, setRole] = useState<UserRole>("staff")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setRole(getRoleFromUser(user))
      setLoading(false)
    })
  }, [])

  return { role, isOwner: role === "owner", loading }
}
