"use client"

import { useState, useEffect } from "react"
import {
  GoogleDriveLogoIcon,
  CheckCircleIcon,
  WarningIcon,
  ClockIcon,
  CloudArrowUpIcon,
  LinkSimpleIcon,
  CalendarBlankIcon,
} from "@phosphor-icons/react"
import {
  getBackupStatus,
  testDriveConnection,
  saveBackupConfig,
  triggerManualBackup,
  disconnectGoogleDrive,
} from "./backup-actions"

export default function BackupSettingsCard() {
  const [loading, setLoading] = useState(true)
  const [folderInput, setFolderInput] = useState("")
  const [folderName, setFolderName] = useState<string | null>(null)
  const [savedFolderId, setSavedFolderId] = useState<string | null>(null)
  const [lastRun, setLastRun] = useState<{ at: string; filename: string } | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [testing, setTesting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [backingUp, setBackingUp] = useState(false)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    try {
      const { config, lastRun, isConnected } = await getBackupStatus()
      if (config) {
        setSavedFolderId(config.folderId)
        setFolderName(config.folderName ?? null)
        setFolderInput(config.folderId)
      }
      if (lastRun) setLastRun(lastRun)
      setIsConnected(isConnected)
    } catch (e: any) {
      setStatus({ type: "error", message: e?.message ?? "상태 조회 실패" })
    }
    setLoading(false)
  }

  async function handleTest() {
    if (!folderInput.trim()) return
    setTesting(true)
    setStatus(null)
    const result = await testDriveConnection(folderInput)
    if (result.success) {
      setFolderName(result.folderName)
      setStatus({ type: "success", message: `폴더 확인 완료: "${result.folderName}"` })
    } else {
      setFolderName(null)
      setStatus({ type: "error", message: result.error || "연결 실패" })
    }
    setTesting(false)
  }

  async function handleSave() {
    if (!folderInput.trim()) return
    setSaving(true)
    setStatus(null)
    const result = await saveBackupConfig(folderInput)
    if (result.success) {
      setSavedFolderId(result.folderId)
      setFolderName(result.folderName)
      setStatus({ type: "success", message: "Google Drive 폴더 설정이 저장되었습니다." })
    } else {
      setStatus({ type: "error", message: result.error || "저장 실패" })
    }
    setSaving(false)
  }

  async function handleManualBackup() {
    if (!isConnected) {
      setStatus({ type: "error", message: "먼저 Google 계정을 연결하세요." })
      return
    }
    if (!savedFolderId) {
      setStatus({ type: "error", message: "먼저 폴더 ID를 저장하세요." })
      return
    }
    setBackingUp(true)
    setStatus(null)
    const result = await triggerManualBackup()
    if (result.success) {
      setStatus({
        type: "success",
        message: `백업 완료: ${result.filename}${result.webViewLink ? ` (Drive에서 보기 가능)` : ""}`,
      })
      await load()
    } else {
      setStatus({ type: "error", message: result.error || "백업 실패" })
    }
    setBackingUp(false)
  }

  async function handleDisconnect() {
    if (!confirm("정말 Google 계정 연결을 해제하시겠습니까?")) return
    setLoading(true)
    setStatus(null)
    const result = await disconnectGoogleDrive()
    if (result.success) {
      setIsConnected(false)
      setStatus({ type: "success", message: "Google 계정 연결이 해제되었습니다." })
    }
    setLoading(false)
  }

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="p-8 rounded-xl bg-card border border-border card-shadow space-y-6">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary-container flex items-center justify-center text-primary shrink-0">
          <GoogleDriveLogoIcon size={24} weight="fill" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-foreground text-lg mb-1">Google Drive 자동 백업</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            매주 월요일 새벽 3시에 데이터베이스 전체를 Google Drive에 자동 백업합니다.
          </p>
        </div>
      </div>

      {status && (
        <div className={`p-4 rounded-xl flex items-start gap-3 text-sm font-medium ${
          status.type === "success"
            ? "bg-green-50 text-green-700 border border-green-100"
            : "bg-error-container/20 text-error border border-error-container/30"
        }`}>
          {status.type === "success"
            ? <CheckCircleIcon weight="fill" size={20} className="shrink-0 mt-0.5" />
            : <WarningIcon weight="fill" size={20} className="shrink-0 mt-0.5" />}
          <span>{status.message}</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-8 text-muted-foreground gap-2 text-sm">
          <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          불러오는 중...
        </div>
      ) : (
        <>
          {/* Google 계정 연결 상태 표시 */}
          <div className="p-4 rounded-xl border border-border bg-card card-shadow-sm space-y-3">
            <h4 className="text-sm font-bold text-foreground">Google 계정 연동</h4>
            {isConnected ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium text-green-600">
                  <CheckCircleIcon weight="fill" size={20} />
                  <span>Google Drive에 연결됨</span>
                </div>
                <button
                  onClick={handleDisconnect}
                  className="px-3 py-1.5 text-xs font-bold text-error bg-error-container/20 rounded-lg hover:bg-error-container/30 transition-all"
                >
                  연결 해제
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  백업 파일을 저장할 본인의 Google Drive 계정을 먼저 연결해주세요.
                </p>
                <a
                  href="/api/auth/google-drive/start"
                  className="inline-flex items-center justify-center h-10 px-4 bg-primary text-primary-foreground rounded-lg font-bold hover:bg-primary/90 transition-all text-sm self-start"
                >
                  Google 계정 연결하기
                </a>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <label className="text-xs font-black text-outline-variant uppercase tracking-widest ml-1 flex items-center gap-2">
              <LinkSimpleIcon size={14} weight="bold" />
              Google Drive 폴더 ID 또는 URL
            </label>
            <div className="relative">
              <input
                type="text"
                value={folderInput}
                onChange={(e) => setFolderInput(e.target.value)}
                placeholder="1aBcDeFgHiJk... 또는 폴더 URL 붙여넣기"
                className="w-full h-12 px-4 rounded-xl border-2 border-border focus:border-primary transition-all outline-none text-sm font-medium card-shadow"
                disabled={!isConnected}
              />
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed pl-1">
              Google Drive에서 백업 폴더의 URL을 통째로 붙여넣거나, <code className="px-1.5 py-0.5 bg-muted rounded text-[11px]">/folders/</code> 뒤에 오는 ID 부분만 입력하세요.
            </p>

            <div className="flex gap-2 pt-1">
              <button
                onClick={handleTest}
                disabled={testing || !folderInput.trim() || !isConnected}
                className="flex-1 h-11 px-4 bg-card border-2 border-border text-foreground rounded-xl font-bold hover:border-primary hover:text-primary transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
              >
                {testing
                  ? <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  : <CheckCircleIcon size={16} weight="bold" />}
                연결 테스트
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !folderInput.trim() || !isConnected}
                className="flex-1 h-11 px-4 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
              >
                {saving
                  ? <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  : null}
                저장
              </button>
            </div>

            {folderName && savedFolderId && (
              <div className="px-4 py-3 bg-primary-container/30 border border-primary-container/40 rounded-xl text-sm flex items-center gap-2 mt-2">
                <CheckCircleIcon size={16} weight="fill" className="text-primary shrink-0" />
                <span className="font-bold text-foreground">현재 폴더:</span>
                <span className="text-foreground">{folderName}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 bg-muted rounded-xl border border-border">
              <div className="flex items-center gap-2 text-xs font-black text-outline-variant uppercase tracking-widest mb-1.5">
                <CalendarBlankIcon size={14} weight="bold" />
                다음 자동 백업
              </div>
              <p className="text-sm font-bold text-foreground">매주 월요일 03:00 (KST)</p>
            </div>
            <div className="p-4 bg-muted rounded-xl border border-border">
              <div className="flex items-center gap-2 text-xs font-black text-outline-variant uppercase tracking-widest mb-1.5">
                <ClockIcon size={14} weight="bold" />
                마지막 백업
              </div>
              <p className="text-sm font-bold text-foreground">
                {lastRun ? formatDate(lastRun.at) : "기록 없음"}
              </p>
              {lastRun && (
                <p className="text-[11px] text-muted-foreground truncate mt-0.5">{lastRun.filename}</p>
              )}
            </div>
          </div>

          <button
            onClick={handleManualBackup}
            disabled={backingUp || !isConnected || !savedFolderId}
            className="w-full h-12 bg-card border-2 border-primary text-primary rounded-xl font-black hover:bg-primary hover:text-primary-foreground transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {backingUp
              ? <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              : <CloudArrowUpIcon size={20} weight="bold" />}
            지금 Drive로 백업
          </button>
        </>
      )}
    </div>
  )
}
