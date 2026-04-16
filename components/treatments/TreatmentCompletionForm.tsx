'use client'

import React, { useState, useEffect } from 'react'
import { X, CreditCard, Plus, Trash, Warning, CheckCircle, Drop } from '@phosphor-icons/react'
import {
  getDyeTypes,
  getUnits,
  getCustomerDyeStocks,
  getDefaultRecipe,
  completeTreatmentAction,
} from '@/app/treatments/actions'

interface Props {
  treatmentId: string
  reservationId: string | null
  customerId: string
  customerName: string
  treatmentTypeName: string
  basePrice: number
  reservedAt: string
  onClose: () => void
  onSuccess: () => void
}

interface UsageRow {
  dye_id: string
  unit_id: string
  amount: number
}

export default function TreatmentCompletionForm({
  treatmentId,
  reservationId,
  customerId,
  customerName,
  treatmentTypeName,
  basePrice,
  reservedAt,
  onClose,
  onSuccess,
}: Props) {
  const [paymentMethod, setPaymentMethod] = useState('카드')
  const [additionalPrice, setAdditionalPrice] = useState(0)
  const [memo, setMemo] = useState('')
  const [usages, setUsages] = useState<UsageRow[]>([{ dye_id: '', unit_id: '', amount: 0 }])
  const [dyeTypes, setDyeTypes] = useState<any[]>([])
  const [units, setUnits] = useState<any[]>([])
  const [dyeStocks, setDyeStocks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const totalPrice = basePrice + additionalPrice

  useEffect(() => {
    async function load() {
      const [dt, u, stocks, recipe] = await Promise.all([
        getDyeTypes(),
        getUnits(),
        getCustomerDyeStocks(customerId),
        getDefaultRecipe(customerId),
      ])
      setDyeTypes(dt)
      setUnits(u)
      setDyeStocks(stocks)
      if (recipe.length > 0) {
        setUsages(recipe.map((r: any) => ({
          dye_id: r.dye_id,
          unit_id: r.unit_id,
          amount: Number(r.amount),
        })))
      }
      setLoading(false)
    }
    load()
  }, [customerId])

  function updateUsage(index: number, field: keyof UsageRow, value: string | number) {
    setUsages(prev => prev.map((row, i) => i === index ? { ...row, [field]: value } : row))
  }

  function addUsage() {
    setUsages(prev => [...prev, { dye_id: dyeTypes[0]?.id || '', unit_id: units[0]?.id || '', amount: 0 }])
  }

  function removeUsage(index: number) {
    if (usages.length === 1) return
    setUsages(prev => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const validUsages = usages.filter(u => u.dye_id && u.amount > 0)
    setSubmitting(true)
    const res = await completeTreatmentAction(
      treatmentId,
      reservationId,
      customerId,
      totalPrice,
      paymentMethod,
      memo,
      validUsages,
    )
    if (res.success) {
      onSuccess()
    } else {
      setError(`시술 완료 처리 실패: ${res.error}`)
    }
    setSubmitting(false)
  }

  // ESC 키로 닫기
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div
        className="bg-card rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="bg-primary p-6 text-primary-foreground relative flex justify-between items-start">
          <div>
            <h2 className="text-xl font-black tracking-tight">시술 완료 처리</h2>
            <p className="text-primary-foreground/70 text-sm mt-1">
              <span className="font-bold">{customerName}</span> 고객 · {treatmentTypeName}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-primary-foreground/20 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground"
          >
            <X size={22} weight="bold" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">
            <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin mr-2" />
            불러오는 중...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                <Warning size={16} weight="fill" />
                {error}
              </div>
            )}

            {/* 결제 정보 */}
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">결제 수단</label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value)}
                  className="h-11 px-3 bg-background border border-border rounded-xl outline-none text-sm appearance-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  {['카드', '현금', '계좌이체'].map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">추가 금액</label>
                <input
                  type="number"
                  value={additionalPrice}
                  onChange={e => setAdditionalPrice(Number(e.target.value))}
                  min={0}
                  className="h-11 px-3 bg-background border border-border rounded-xl outline-none text-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">총 결제 금액</label>
                <div className="h-11 px-3 bg-muted border border-border rounded-xl flex items-center text-sm font-bold text-primary">
                  {totalPrice.toLocaleString()}원
                </div>
              </div>
            </div>

            {/* 사용 염색약 */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Drop size={14} weight="fill" className="text-primary" />
                  사용 염색약
                </label>
                <button type="button" onClick={addUsage} className="flex items-center gap-1 text-xs text-primary font-bold hover:bg-primary/5 px-2 py-1 rounded-lg transition-all">
                  <Plus size={14} weight="bold" />추가
                </button>
              </div>

              {/* 고객 보유량 참고 */}
              {dyeStocks.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {dyeStocks.map((s: any) => (
                    <span key={s.id} className={`text-xs px-2 py-1 rounded-full border font-medium ${
                      s.current_amount < 50 ? 'border-warning/40 bg-warning/5 text-warning' : 'border-border bg-muted text-muted-foreground'
                    }`}>
                      {s.dye?.name} {s.current_amount}{s.unit?.name}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex flex-col gap-2">
                {usages.map((row, i) => (
                  <div key={i} className="grid grid-cols-[1fr_100px_80px_36px] gap-2 items-center">
                    <select
                      value={row.dye_id}
                      onChange={e => updateUsage(i, 'dye_id', e.target.value)}
                      className="h-10 px-3 bg-background border border-border rounded-lg outline-none text-sm appearance-none focus:border-primary"
                    >
                      <option value="">염색약 선택</option>
                      {dyeTypes.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                    <input
                      type="number"
                      value={row.amount || ''}
                      onChange={e => updateUsage(i, 'amount', Number(e.target.value))}
                      placeholder="사용량"
                      min={0}
                      step="any"
                      className="h-10 px-3 bg-background border border-border rounded-lg outline-none text-sm focus:border-primary"
                    />
                    <select
                      value={row.unit_id}
                      onChange={e => updateUsage(i, 'unit_id', e.target.value)}
                      className="h-10 px-3 bg-background border border-border rounded-lg outline-none text-sm appearance-none focus:border-primary"
                    >
                      <option value="">단위</option>
                      {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                    <button
                      type="button"
                      onClick={() => removeUsage(i)}
                      disabled={usages.length === 1}
                      className="h-10 w-10 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-destructive hover:border-destructive/30 transition-all disabled:opacity-30"
                    >
                      <Trash size={15} weight="bold" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 메모 */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">시술 메모 (선택)</label>
              <textarea
                value={memo}
                onChange={e => setMemo(e.target.value)}
                rows={2}
                placeholder="색상 혼합 비율, 두피 상태 등 특이사항"
                className="w-full p-3 bg-background border border-border rounded-xl outline-none text-sm resize-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* 버튼 */}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl font-bold text-muted-foreground hover:bg-muted transition-all">
                취소
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-[2] py-3 bg-primary text-primary-foreground rounded-xl font-black hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting
                  ? <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  : <CheckCircle size={18} weight="fill" />
                }
                시술 완료 처리
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
