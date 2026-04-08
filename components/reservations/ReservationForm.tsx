'use client'

import React, { useState, useEffect } from 'react'
import { searchCustomers } from '@/app/customers/actions'
import { createReservation } from '@/app/reservations/actions'
import { X, MagnifyingGlass, CalendarBlank, Clock, Note, CaretDown, Plus } from '@phosphor-icons/react'
import { format } from 'date-fns'

interface ReservationFormProps {
  initialDate?: Date
  onClose: () => void
  onSuccess: () => void
}

export default function ReservationForm({ initialDate, onClose, onSuccess }: ReservationFormProps) {
  const [customerQuery, setCustomerQuery] = useState('')
  const [customers, setCustomers] = useState<any[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
  const [date, setDate] = useState(format(initialDate || new Date(), 'yyyy-MM-dd'))
  const [time, setTime] = useState('10:00')
  const [memo, setMemo] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (customerQuery.length >= 2) {
        handleSearch()
      } else {
        setCustomers([])
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [customerQuery])

  const handleSearch = async () => {
    const data = await searchCustomers(customerQuery)
    setCustomers(data)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCustomer) {
      alert('고객을 선택해주세요.')
      return
    }

    setLoading(true)
    try {
      const reservedAt = `${date}T${time}:00`
      await createReservation({
        customer_id: selectedCustomer.id,
        reserved_at: reservedAt,
        status: '예약완료',
        memo
      })
      onSuccess()
    } catch (error: any) {
      alert(`예약 등록 실패: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-card rounded-xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-300">
        {/* Header */}
        <div className="bg-primary p-8 text-primary-foreground relative">
          <div className="relative z-10">
            <h2 className="text-2xl font-black tracking-tight">신규 예약 등록</h2>
            <p className="text-primary-foreground/60 text-sm mt-1 font-medium">관리자 전용 예약 등록 시스템</p>
          </div>
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2.5 hover:bg-primary-foreground/20 rounded-full transition-all hover:rotate-90"
          >
            <X size={24} weight="bold" />
          </button>
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-foreground/5 rounded-full -mr-12 -mt-12 blur-2xl"></div>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-8 bg-muted/30">
          {/* Customer Selection */}
          <div className="space-y-3">
            <label className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-2 mb-1">
              <MagnifyingGlass size={16} weight="bold" />
              고객 정보
            </label>
            {!selectedCustomer ? (
              <div className="relative">
                <input
                  type="text"
                  placeholder="이름 또는 전화번호 뒷자리 입력"
                  className="w-full px-5 py-4 rounded-xl border-2 border-border focus:outline-none focus:border-primary transition-all bg-card card-shadow font-medium"
                  value={customerQuery}
                  onChange={(e) => setCustomerQuery(e.target.value)}
                />
                {customers.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-3 bg-card border-2 border-border rounded-xl shadow-xl z-20 max-h-60 overflow-y-auto divide-y divide-surface-variant animate-in slide-in-from-top-2">
                    {customers.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setSelectedCustomer(c)}
                        className="w-full text-left px-5 py-4 hover:bg-surface-container transition-colors flex justify-between items-center group"
                      >
                        <div>
                          <p className="font-bold text-foreground group-hover:text-primary transition-colors">{c.name}</p>
                          <p className="text-xs text-outline-variant mt-0.5">{c.phone}</p>
                        </div>
                        <Plus size={16} className="text-border group-hover:text-primary" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between p-5 bg-card border-2 border-primary/30 rounded-xl card-shadow animate-in fade-in zoom-in-95">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                    {selectedCustomer.name[0]}
                  </div>
                  <div>
                    <span className="font-black text-foreground text-lg">{selectedCustomer.name}</span>
                    <p className="text-xs text-on-surface-variant font-medium">{selectedCustomer.phone}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedCustomer(null)}
                  className="px-3 py-1.5 text-xs font-black text-primary hover:bg-primary/10 rounded-lg transition-all"
                >
                  변경하기
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-2 mb-1">
                <CalendarBlank size={16} weight="bold" />
                날짜 선택
              </label>
              <input
                type="date"
                className="w-full px-5 py-4 rounded-xl border-2 border-border focus:outline-none focus:border-primary transition-all bg-card card-shadow font-bold text-foreground"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="space-y-3">
              <label className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-2 mb-1">
                <Clock size={16} weight="bold" />
                시간 선택
              </label>
              <div className="relative">
                <select
                  className="w-full px-5 py-4 rounded-xl border-2 border-border focus:outline-none focus:border-primary transition-all bg-card card-shadow font-bold text-foreground appearance-none"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                >
                  {Array.from({ length: 12 }, (_, i) => i + 9).map(h => {
                    const label = `${h.toString().padStart(2, '0')}:00`
                    return <option key={h} value={label}>{label} 시</option>
                  })}
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-outline-variant">
                  <CaretDown size={14} weight="bold" />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-2 mb-1">
              <Note size={16} weight="bold" />
              추가 정보 (상담 메모)
            </label>
            <textarea
              rows={3}
              placeholder="특이사항이나 시술 요청 내용을 입력하세요."
              className="w-full px-6 py-5 rounded-xl border-2 border-border focus:outline-none focus:border-primary transition-all bg-card card-shadow resize-none font-medium text-foreground"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
            />
          </div>

          <div className="pt-4 flex gap-4">
             <button
              type="button"
              onClick={onClose}
              className="flex-1 py-5 rounded-xl font-black text-on-surface-variant hover:bg-surface-container transition-all"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading || !selectedCustomer}
              className="flex-[2] bg-primary text-primary-foreground py-5 rounded-xl font-black hover:bg-primary-dim transition-all shadow-xl shadow-primary/20 active:scale-95 disabled:grayscale disabled:opacity-50"
            >
              {loading ? '등록 중...' : '예약 확정하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
