"use client"

import React, { useState } from "react"
import { User, CheckCircle, Drop, ArrowCounterClockwise, PencilSimple } from "@phosphor-icons/react"

interface DyeRow {
  dye_id: string
  dye_name: string
  currentAmount: number   // 기존 잔량 (보충 모드에서 표시용)
  masterCapacity: number  // 마스터 총량 (보충 모드 기본값)
  setAmount: number       // 직접 수정 모드용 수량
  addAmount: number       // 보충 모드용 수량
  unit_id: string
  enabled: boolean
}

interface DyePurchaseFormProps {
  customers: any[]
  dyeTypes: any[]
  units: any[]
  defaultCustomerId?: string
  existingStocks?: { dye_id: string; current_amount: number; unit_id: string }[]
  onSubmit?: (data: {
    customer_id: string
    entries: { dye_id: string; unit_id: string; amount: number }[]
    memo: string
    mode: 'add' | 'set'
  }) => Promise<any>
}

export default function DyePurchaseForm({
  customers,
  dyeTypes,
  units,
  defaultCustomerId,
  existingStocks = [],
  onSubmit,
}: DyePurchaseFormProps) {
  const stockMap = Object.fromEntries(existingStocks.map((s) => [s.dye_id, s]))
  const hasExisting = existingStocks.length > 0

  const [customerId, setCustomerId] = useState(defaultCustomerId || "")
  const [customerError, setCustomerError] = useState("")
  const [memo, setMemo] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mode, setMode] = useState<'add' | 'set'>(hasExisting ? 'set' : 'add')

  const [rows, setRows] = useState<DyeRow[]>(() =>
    dyeTypes.map((d) => {
      const existing = stockMap[d.id]
      const currentAmount = existing?.current_amount ?? 0
      const masterCapacity = d.total_capacity ?? 0
      return {
        dye_id: d.id,
        dye_name: d.name,
        currentAmount,
        masterCapacity,
        setAmount: currentAmount > 0 ? currentAmount : masterCapacity,
        addAmount: masterCapacity,
        unit_id: existing?.unit_id ?? d.default_unit_id ?? units[0]?.id ?? "",
        enabled: mode === 'add' ? masterCapacity > 0 : (currentAmount > 0 || masterCapacity > 0),
      }
    })
  )

  const toggleRow = (idx: number) =>
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, enabled: !r.enabled } : r)))

  const updateSetAmount = (idx: number, value: string) =>
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, setAmount: parseFloat(value) || 0 } : r)))

  const updateAddAmount = (idx: number, value: string) =>
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, addAmount: parseFloat(value) || 0 } : r)))

  const updateUnit = (idx: number, unitId: string) =>
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, unit_id: unitId } : r)))

  const activeAmount = (row: DyeRow) => mode === 'add' ? row.addAmount : row.setAmount
  const enabledCount = rows.filter((r) => r.enabled && activeAmount(r) > 0).length

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!customerId) {
      setCustomerError("고객을 선택해주세요.")
      return
    }
    setCustomerError("")

    const entries = rows
      .filter((r) => r.enabled && activeAmount(r) > 0)
      .map((r) => ({ dye_id: r.dye_id, unit_id: r.unit_id, amount: activeAmount(r) }))

    if (entries.length === 0) {
      alert("등록할 염색약이 없습니다. 최소 한 가지 이상 체크하고 수량을 입력해주세요.")
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit?.({ customer_id: customerId, entries, memo, mode })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8 max-w-3xl">
      {/* 고객 선택 */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-foreground flex items-center gap-2">
          <User size={18} className="text-primary" />
          고객 선택 <span className="text-danger">*</span>
        </label>
        <select
          value={customerId}
          onChange={(e) => { setCustomerId(e.target.value); setCustomerError("") }}
          className="w-full h-11 px-4 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm appearance-none"
        >
          <option value="">고객을 선택하세요</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
          ))}
        </select>
        {customerError && <p className="text-xs text-danger font-medium">{customerError}</p>}
      </div>

      {/* 모드 토글 */}
      <div className="flex flex-col gap-2">
        <div className="flex bg-muted rounded-xl p-1 border border-border w-fit">
          <button
            type="button"
            onClick={() => setMode('add')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              mode === 'add' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <ArrowCounterClockwise size={15} weight="bold" />
            보충 등록
          </button>
          <button
            type="button"
            onClick={() => setMode('set')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              mode === 'set' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <PencilSimple size={15} weight="bold" />
            직접 수정
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          {mode === 'add'
            ? '보충 등록: 추가 용량이 기존 잔량에 합산됩니다.'
            : '직접 수정: 입력한 수량으로 현재 잔량을 덮어씌웁니다.'}
        </p>
      </div>

      {/* 염색약 목록 */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-foreground">
            <Drop size={18} className="text-primary" />
            염색약 재고
          </div>
          <span className="text-xs text-muted-foreground">
            {enabledCount}종 {mode === 'add' ? '보충' : '수정'} 예정
          </span>
        </div>

        <div className="rounded-xl border border-border overflow-hidden">
          {/* 헤더 */}
          {mode === 'add' ? (
            <div className="grid grid-cols-[32px_1fr_88px_120px_72px] gap-2 px-4 py-2.5 bg-muted/50 border-b border-border text-xs font-bold text-muted-foreground">
              <span />
              <span>염색약 종류</span>
              <span>기존 총량</span>
              <span>추가 용량</span>
              <span>단위</span>
            </div>
          ) : (
            <div className="grid grid-cols-[32px_1fr_120px_72px] gap-3 px-4 py-2.5 bg-muted/50 border-b border-border text-xs font-bold text-muted-foreground">
              <span />
              <span>염색약 종류</span>
              <span>설정 수량</span>
              <span>단위</span>
            </div>
          )}

          {rows.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              등록된 염색약 마스터가 없습니다.
            </div>
          ) : mode === 'add' ? (
            rows.map((row, idx) => (
              <div
                key={row.dye_id}
                className={`grid grid-cols-[32px_1fr_88px_120px_72px] items-center gap-2 px-4 py-3 border-b border-border last:border-0 transition-colors ${
                  row.enabled ? "bg-background hover:bg-muted/20" : "bg-muted/30"
                }`}
              >
                <input
                  type="checkbox"
                  checked={row.enabled}
                  onChange={() => toggleRow(idx)}
                  className="w-4 h-4 accent-primary cursor-pointer"
                />
                <span className={`text-sm font-semibold truncate ${row.enabled ? "text-foreground" : "text-muted-foreground"}`}>
                  {row.dye_name}
                </span>
                {/* 기존 총량 — 읽기 전용 */}
                <div className={`h-9 px-3 flex items-center rounded-lg border border-border bg-muted/40 text-sm font-bold tabular-nums ${
                  row.enabled ? "text-foreground" : "text-muted-foreground"
                }`}>
                  {row.currentAmount > 0 ? row.currentAmount : <span className="text-muted-foreground/60 font-normal text-xs">없음</span>}
                </div>
                {/* 추가 용량 — 편집 가능, 마스터 기본값 */}
                <input
                  type="number"
                  step="any"
                  min="0"
                  value={row.addAmount || ""}
                  onChange={(e) => updateAddAmount(idx, e.target.value)}
                  disabled={!row.enabled}
                  className="h-9 px-3 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none disabled:opacity-40 disabled:cursor-not-allowed w-full"
                />
                <select
                  value={row.unit_id}
                  onChange={(e) => updateUnit(idx, e.target.value)}
                  disabled={!row.enabled}
                  className="h-9 px-2 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none appearance-none disabled:opacity-40 disabled:cursor-not-allowed w-full"
                >
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>
            ))
          ) : (
            rows.map((row, idx) => (
              <div
                key={row.dye_id}
                className={`grid grid-cols-[32px_1fr_120px_72px] items-center gap-3 px-4 py-3 border-b border-border last:border-0 transition-colors ${
                  row.enabled ? "bg-background hover:bg-muted/20" : "bg-muted/30"
                }`}
              >
                <input
                  type="checkbox"
                  checked={row.enabled}
                  onChange={() => toggleRow(idx)}
                  className="w-4 h-4 accent-primary cursor-pointer"
                />
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`text-sm font-semibold truncate ${row.enabled ? "text-foreground" : "text-muted-foreground"}`}>
                    {row.dye_name}
                  </span>
                  {row.currentAmount > 0 && (
                    <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                      등록됨
                    </span>
                  )}
                </div>
                <input
                  type="number"
                  step="any"
                  min="0"
                  value={row.setAmount || ""}
                  onChange={(e) => updateSetAmount(idx, e.target.value)}
                  disabled={!row.enabled}
                  className="h-9 px-3 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none disabled:opacity-40 disabled:cursor-not-allowed w-full"
                />
                <select
                  value={row.unit_id}
                  onChange={(e) => updateUnit(idx, e.target.value)}
                  disabled={!row.enabled}
                  className="h-9 px-2 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none appearance-none disabled:opacity-40 disabled:cursor-not-allowed w-full"
                >
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>
            ))
          )}
        </div>
        <p className="text-xs text-muted-foreground">체크된 항목만 저장됩니다.</p>
      </div>

      {/* 메모 */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-foreground">추가 메모</label>
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="메모를 입력하세요 (선택 사항)"
          className="w-full h-20 p-4 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-primary h-12 text-base font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-transform"
      >
        {isSubmitting ? "저장 중..." : (
          <div className="flex items-center gap-2 justify-center">
            <CheckCircle size={20} weight="fill" />
            {mode === 'add' ? '보충 등록' : '재고 수정'} 완료 {enabledCount > 0 && `(${enabledCount}종)`}
          </div>
        )}
      </button>
    </form>
  )
}
