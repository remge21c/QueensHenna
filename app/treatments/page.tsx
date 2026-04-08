'use client'

import React, { useState, useEffect, useTransition } from 'react'
import { Plus, ClipboardText, Funnel, MagnifyingGlass, CaretLeft, CaretRight } from '@phosphor-icons/react'
import TreatmentForm from '@/components/treatments/TreatmentForm'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

export default function TreatmentsPage() {
  const [showForm, setShowForm] = useState(false)
  const [treatments, setTreatments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    fetchTreatments()
  }, [])

  const fetchTreatments = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('treatments')
      .select(`
        *,
        customer:customers(name, phone),
        type:treatment_types(name)
      `)
      .order('treated_at', { ascending: false })
      .limit(20)

    if (!error && data) {
      setTreatments(data)
    }
    setLoading(false)
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 sticky top-0 z-20 bg-background -mx-4 px-4 pt-4 -mt-4 md:-mx-8 md:px-8 md:pt-8 md:-mt-8">
        <div>
          <h1 className="text-xl md:text-3xl font-bold text-foreground mb-2 tracking-tight">시술 기록 관리</h1>
          <p className="text-muted-foreground">고객님의 시술 내역을 확인하고 새로운 기록을 등록하세요.</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary shadow-lg shadow-primary/20 group"
        >
          <Plus weight="bold" className="group-hover:rotate-90 transition-transform duration-300" />
          <span>신규 시술 등록</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-card p-4 rounded-xl border border-border flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative group">
          <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant" size={20} />
          <input
            type="text"
            placeholder="고객명 또는 전화번호 검색..."
            className="w-full h-12 pl-12 pr-4 bg-muted border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all text-sm"
          />
        </div>
        <div className="flex gap-2 text-sm font-medium text-muted-foreground">
          <button className="h-12 px-6 rounded-xl bg-primary text-primary-foreground flex items-center gap-2">전체</button>
          <button className="h-12 px-6 rounded-xl bg-card border border-border flex items-center gap-2 hover:bg-muted">오늘</button>
          <button className="h-12 px-6 rounded-xl bg-card border border-border flex items-center gap-2 hover:bg-muted">지난 일주일</button>
          <button className="h-12 px-4 rounded-xl bg-card border border-border flex items-center justify-center hover:bg-muted">
            <Funnel size={18} />
          </button>
        </div>
      </div>

      {/* Treatments List */}
      <div className="bg-card rounded-xl border border-border overflow-hidden card-shadow">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-muted border-b border-border text-muted-foreground text-xs font-bold uppercase tracking-wider">
              <th className="px-8 py-4">시술 일시</th>
              <th className="px-6 py-4">고객명</th>
              <th className="px-6 py-4">시술 종류</th>
              <th className="px-6 py-4">결제 금액</th>
              <th className="px-6 py-4">결제 수단</th>
              <th className="px-8 py-4 text-right">상세</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-8 py-12 text-center text-outline-variant">시술 기록을 불러오는 중...</td>
              </tr>
            ) : treatments.length > 0 ? (
              treatments.map((t) => (
                <tr key={t.id} className="hover:bg-muted/50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="text-sm font-bold text-foreground">
                      {format(new Date(t.treated_at), 'yyyy.MM.dd', { locale: ko })}
                    </div>
                    <div className="text-[11px] text-outline-variant mt-0.5">
                      {format(new Date(t.treated_at), 'a hh:mm', { locale: ko })}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-sm font-bold text-foreground">{t.customer?.name}</div>
                    <div className="text-[11px] text-outline-variant mt-0.5">{t.customer?.phone}</div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-container text-on-primary-container">
                      {t.type?.name}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-sm font-bold text-foreground">{t.total_price.toLocaleString()}원</div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-xs text-muted-foreground">{t.payment_method}</div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button className="text-outline-variant hover:text-primary transition-colors p-2 rounded-lg hover:bg-card card-shadow hover:shadow-md">
                      <CaretRight size={20} weight="bold" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-8 py-12 text-center text-outline-variant">등록된 시술 기록이 없습니다.</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="px-8 py-4 bg-muted flex justify-between items-center border-t border-border">
          <span className="text-xs text-outline-variant">총 {treatments.length}건의 기록 중 1~{treatments.length}건 표시</span>
          <div className="flex gap-1">
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-outline-variant disabled:opacity-50" disabled><CaretLeft size={16} weight="bold" /></button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary text-primary-foreground text-xs font-bold">1</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-outline-variant"><CaretRight size={16} weight="bold" /></button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showForm && (
        <TreatmentForm
          onSuccess={() => {
            setShowForm(false)
            fetchTreatments()
          }}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  )
}
