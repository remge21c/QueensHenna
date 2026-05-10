"use client"

import { useState, useEffect } from "react"
import {
  UserPlusIcon,
  TrashIcon,
  CrownIcon,
  UserIcon,
  EnvelopeSimpleIcon,
  WarningIcon,
  CheckCircleIcon,
  ClockIcon,
} from "@phosphor-icons/react"
import { createClient } from "@/lib/supabase/client"
import { getUsers, inviteUser, updateUserRole, deleteUser } from "./actions"
import type { UserRole } from "@/lib/auth/roles"

type AppUser = {
  id: string
  email?: string
  role: UserRole
  confirmed: boolean
  created_at: string
}

export default function UsersManagementClient() {
  const [users, setUsers] = useState<AppUser[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<UserRole>("staff")
  const [inviting, setInviting] = useState(false)
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setCurrentUserId(user.id)
    })
    load()
  }, [])

  async function load() {
    setLoading(true)
    const result = await getUsers()
    if (result.success) {
      setUsers(
        result.users.map((u: any) => ({
          id: u.id,
          email: u.email,
          role: u.app_metadata?.role ?? "staff",
          confirmed: !!u.email_confirmed_at,
          created_at: u.created_at,
        }))
      )
    }
    setLoading(false)
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    if (!inviteEmail) return
    setInviting(true)
    setStatus(null)
    const result = await inviteUser(inviteEmail, inviteRole)
    if (result.success) {
      setStatus({ type: "success", message: `${inviteEmail}로 초대 이메일을 발송했습니다.` })
      setInviteEmail("")
      await load()
    } else {
      setStatus({ type: "error", message: result.error || "초대 실패" })
    }
    setInviting(false)
  }

  async function handleRoleChange(userId: string, role: UserRole) {
    const result = await updateUserRole(userId, role)
    if (result.success) {
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role } : u)))
      setStatus({ type: "success", message: "역할이 변경되었습니다. 해당 사용자는 재로그인이 필요합니다." })
    } else {
      setStatus({ type: "error", message: result.error || "역할 변경 실패" })
    }
  }

  async function handleDelete(userId: string, email?: string) {
    if (!confirm(`${email ?? "이 사용자"}를 삭제하시겠습니까?`)) return
    const result = await deleteUser(userId)
    if (result.success) {
      setUsers((prev) => prev.filter((u) => u.id !== userId))
      setStatus({ type: "success", message: "사용자가 삭제되었습니다." })
    } else {
      setStatus({ type: "error", message: result.error || "삭제 실패" })
    }
  }

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
      <div className="border-b border-border/50 pb-6">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <UserPlusIcon size={24} weight="fill" className="text-primary" />
          사용자 관리
        </h2>
        <p className="text-sm text-muted-foreground mt-1">직원을 초대하고 역할을 관리합니다.</p>
      </div>

      {status && (
        <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${
          status.type === "success"
            ? "bg-green-50 text-green-700 border border-green-100"
            : "bg-error-container/20 text-error border border-error-container/30"
        }`}>
          {status.type === "success" ? <CheckCircleIcon weight="fill" size={20} /> : <WarningIcon weight="fill" size={20} />}
          {status.message}
        </div>
      )}

      {/* 초대 폼 */}
      <div className="p-6 bg-muted rounded-xl border border-border">
        <h3 className="text-sm font-black text-outline-variant uppercase tracking-widest mb-4">새 사용자 초대</h3>
        <form onSubmit={handleInvite} className="grid grid-cols-1 md:grid-cols-[1fr_140px_auto] gap-3 items-end">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-muted-foreground">이메일</label>
            <div className="relative">
              <EnvelopeSimpleIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="staff@example.com"
                required
                className="w-full h-11 pl-9 pr-4 rounded-xl border-2 border-card focus:border-primary transition-all outline-none text-sm card-shadow"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-muted-foreground">역할</label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as UserRole)}
              className="h-11 px-3 rounded-xl border-2 border-card focus:border-primary transition-all outline-none text-sm card-shadow bg-background appearance-none"
            >
              <option value="staff">직원</option>
              <option value="owner">원장</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={inviting}
            className="h-11 px-5 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {inviting ? (
              <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <UserPlusIcon size={16} weight="bold" />
            )}
            초대
          </button>
        </form>
      </div>

      {/* 사용자 목록 */}
      <div>
        <h3 className="text-sm font-black text-outline-variant uppercase tracking-widest mb-4">현재 사용자</h3>
        {loading ? (
          <div className="flex items-center justify-center py-10 text-muted-foreground text-sm gap-2">
            <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            불러오는 중...
          </div>
        ) : (
          <div className="border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted text-outline-variant font-black uppercase tracking-tighter border-b border-border text-xs">
                  <th className="px-4 py-3 text-left">이메일</th>
                  <th className="px-4 py-3 text-center hidden sm:table-cell">상태</th>
                  <th className="px-4 py-3 text-center">역할</th>
                  <th className="px-4 py-3 text-center">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          user.role === "owner"
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground"
                        }`}>
                          {user.role === "owner" ? <CrownIcon size={14} weight="fill" /> : <UserIcon size={14} weight="bold" />}
                        </div>
                        <span className="font-medium text-foreground truncate max-w-[160px] sm:max-w-none">
                          {user.email}
                        </span>
                        {user.id === currentUserId && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-bold shrink-0">나</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center hidden sm:table-cell">
                      {user.confirmed ? (
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-green-50 text-green-700 font-bold">
                          <CheckCircleIcon size={12} weight="fill" />
                          확인됨
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-warning/10 text-warning-foreground font-bold">
                          <ClockIcon size={12} weight="bold" />
                          초대 대기
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {user.id === currentUserId ? (
                        <span className="text-xs font-bold text-primary">
                          {user.role === "owner" ? "원장" : "직원"}
                        </span>
                      ) : (
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                          className="text-xs px-2 py-1.5 rounded-lg border border-border bg-background outline-none focus:border-primary transition-all"
                        >
                          <option value="staff">직원</option>
                          <option value="owner">원장</option>
                        </select>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {user.id !== currentUserId ? (
                        <button
                          onClick={() => handleDelete(user.id, user.email)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-error hover:bg-error/5 transition-all"
                          aria-label="삭제"
                        >
                          <TrashIcon size={15} weight="bold" />
                        </button>
                      ) : (
                        <span className="text-muted-foreground/30 text-lg">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
