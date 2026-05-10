"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { LockSimpleIcon, CheckCircleIcon, WarningCircleIcon, PlantIcon } from "@phosphor-icons/react"
import { createClient } from "@/lib/supabase/client"
import { setInitialPassword } from "@/app/(auth)/actions"

export default function ConfirmPage() {
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [loading, setLoading] = useState(false)
  const [sessionReady, setSessionReady] = useState(false)
  const [sessionError, setSessionError] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function detectSession() {
      const supabase = createClient()

      // 1. Try PKCE code in query params (admin invite flow)
      const params = new URLSearchParams(window.location.search)
      const code = params.get("code")
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
          setSessionReady(true)
          return
        }
      }

      // 2. Try tokens in URL hash (implicit flow)
      const hash = window.location.hash.slice(1)
      if (hash) {
        const hashParams = new URLSearchParams(hash)
        const access_token = hashParams.get("access_token")
        const refresh_token = hashParams.get("refresh_token")
        if (access_token && refresh_token) {
          const { error } = await supabase.auth.setSession({ access_token, refresh_token })
          if (!error) {
            setSessionReady(true)
            return
          }
        }
      }

      // 3. Fall back to existing session
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setSessionReady(true)
        return
      }

      setSessionError("유효하지 않은 초대 링크입니다. 다시 초대를 요청해 주세요.")
    }

    detectSession()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) {
      setError("비밀번호가 일치하지 않습니다.")
      return
    }
    if (password.length < 6) {
      setError("비밀번호는 6자 이상이어야 합니다.")
      return
    }
    setLoading(true)
    setError(null)
    const result = await setInitialPassword(password)
    if (result.success) {
      router.push("/")
    } else {
      setError(result.error || "오류가 발생했습니다.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] md:min-h-screen flex items-center justify-center -mx-4 -mt-4 md:-mx-8 md:-mt-8 px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground shadow-sm">
            <PlantIcon weight="fill" size={20} />
          </div>
          <div>
            <h1 className="text-lg font-black text-primary leading-none">Queens Henna</h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">비밀번호 설정</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 card-shadow">
          {!sessionReady && !sessionError ? (
            <div className="flex flex-col items-center gap-3 py-6 text-muted-foreground">
              <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              <p className="text-sm">인증 정보를 확인하는 중...</p>
            </div>
          ) : sessionError ? (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-error-container/20 border border-error-container/30 text-sm text-error font-medium w-full">
                <WarningCircleIcon size={16} weight="fill" className="shrink-0" />
                {sessionError}
              </div>
              <button
                onClick={() => router.push("/login")}
                className="text-sm text-primary hover:underline font-medium"
              >
                로그인 페이지로 이동
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-black text-foreground mb-1">비밀번호를 설정하세요</h2>
              <p className="text-sm text-muted-foreground mb-6">처음 로그인하셨습니다. 사용할 비밀번호를 입력해 주세요.</p>

              {error && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-error-container/20 border border-error-container/30 text-sm text-error font-medium mb-4">
                  <WarningCircleIcon size={16} weight="fill" />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-outline-variant uppercase tracking-widest ml-1">새 비밀번호</label>
                  <div className="relative">
                    <LockSimpleIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="6자 이상 입력"
                      required
                      minLength={6}
                      className="w-full h-12 pl-10 pr-4 rounded-xl border-2 border-border focus:border-primary transition-all outline-none text-sm font-medium"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-outline-variant uppercase tracking-widest ml-1">비밀번호 확인</label>
                  <div className="relative">
                    <LockSimpleIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="비밀번호 재입력"
                      required
                      className="w-full h-12 pl-10 pr-4 rounded-xl border-2 border-border focus:border-primary transition-all outline-none text-sm font-medium"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full h-12 mt-2"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  ) : (
                    <CheckCircleIcon size={18} weight="fill" />
                  )}
                  비밀번호 설정 완료
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
