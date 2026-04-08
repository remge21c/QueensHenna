'use client'

import React, { useEffect, useState } from 'react'
import {
  CalendarStar,
  CurrencyKrw,
  ChartBar,
  UserPlus,
  ClockCounterClockwise,
  CheckCircle,
  WarningCircle,
  ChatText,
  PhoneCall,
  CaretRight,
  DotsThreeVertical,
  CalendarBlank,
  MegaphoneSimple
} from '@phosphor-icons/react'
import { getDashboardStats } from './dashboard/actions'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      const data = await getDashboardStats()
      setStats(data)
      setLoading(false)
    }
    loadStats()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-muted-foreground font-medium animate-pulse">데이터를 불러오는 중...</p>
      </div>
    )
  }

  const kpis = [
    { label: '오늘의 예약', value: `${stats.todayReservationsCount}명`, icon: CalendarStar, color: 'primary' },
    { label: '오늘 매출', value: `${stats.todaySales.toLocaleString()}원`, icon: CurrencyKrw, color: 'tertiary' },
    { label: '이번 달 누적 매출', value: `${stats.monthSales.toLocaleString()}원`, icon: ChartBar, color: 'secondary' },
    { label: '오늘 신규 고객', value: `${stats.todayNewCustomers}명`, icon: UserPlus, color: 'primary' }
  ]

  return (
    <div className="animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 sticky top-0 z-20 bg-background -mx-4 px-4 pt-4 -mt-4 md:-mx-8 md:px-8 md:pt-8 md:-mt-8">
        <div>
          <h1 className="text-xl md:text-3xl font-black text-foreground tracking-tight flex items-center gap-2">
            대시보드
            <span className="text-sm font-medium text-primary bg-primary-container px-3 py-1 rounded-full">{format(new Date(), 'M월 d일 (E)', { locale: ko })}</span>
          </h1>
          <p className="text-muted-foreground mt-1 font-headline">"오늘도 아름다운 변화를 응원합니다."</p>
        </div>
        <div className="hidden md:flex items-center gap-4 group cursor-pointer hover:bg-card p-2 pr-4 rounded-xl transition-all card-shadow border border-transparent hover:border-border">
          <div className="text-right">
            <p className="text-sm font-bold text-foreground">이원장</p>
            <p className="text-[10px] text-outline-variant uppercase tracking-widest font-black">Admin Access</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-black shadow-lg group-hover:scale-110 transition-transform">
            원
          </div>
        </div>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-10">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="bg-card p-4 md:p-8 rounded-xl border border-border card-shadow hover:shadow-lg hover:border-primary/20 transition-all group overflow-hidden relative">
            <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-[0.03] group-hover:scale-150 transition-transform bg-${kpi.color}`} />
            <div className="flex justify-between items-start mb-4">
              <span className="text-sm font-bold text-muted-foreground">{kpi.label}</span>
              <div className={`p-3 rounded-xl bg-${kpi.color}-container text-on-${kpi.color}-container`}>
                <kpi.icon size={24} weight="bold" />
              </div>
            </div>
            <div className="text-xl md:text-3xl font-black text-foreground">{kpi.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 flex flex-col gap-8">
          {/* Today's Reservations */}
          <section className="bg-card rounded-xl border border-border p-5 md:p-10card-shadow relative overflow-hidden">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-black text-foreground flex items-center gap-3">
                <ClockCounterClockwise size={28} weight="fill" className="text-primary" />
                오늘 예약 현황
              </h2>
              <button className="text-primary font-bold text-sm flex items-center gap-1 hover:underline">
                전체보기 <CaretRight weight="bold" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-border">
                    <th className="pb-4 font-bold text-muted-foreground text-xs uppercase tracking-widest pl-2">시간</th>
                    <th className="pb-4 font-bold text-muted-foreground text-xs uppercase tracking-widest">고객 정보</th>
                    <th className="pb-4 font-bold text-muted-foreground text-xs uppercase tracking-widest text-center">상태</th>
                    <th className="pb-4 font-bold text-muted-foreground text-xs uppercase tracking-widest">메모</th>
                    <th className="pb-4 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {stats.reservations.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-20 text-center text-muted-foreground font-medium">오늘 예정된 예약이 없습니다.</td>
                    </tr>
                  ) : stats.reservations.map((res: any) => (
                    <tr key={res.id} className="group hover:bg-muted/50 transition-colors">
                      <td className="py-6 pl-2">
                        <span className="font-black text-primary text-lg">{format(new Date(res.reservation_time), 'HH:mm')}</span>
                      </td>
                      <td className="py-6">
                        <div className="font-black text-foreground">{res.customers.name}</div>
                        <div className="text-xs text-muted-foreground font-medium">{res.customers.phone}</div>
                      </td>
                      <td className="py-6 text-center">
                        <span className={`px-4 py-1.5 rounded-full text-xs font-black tracking-tight ${
                          res.status === '방문완료' ? 'bg-primary-container text-on-primary-container' :
                          res.status === '예약완료' ? 'bg-tertiary-container text-on-tertiary-container' :
                          res.status === '노쇼' ? 'bg-error-container/30 text-error' : 'bg-surface-container text-muted-foreground'
                        }`}>
                          {res.status}
                        </span>
                      </td>
                      <td className="py-6">
                        <p className="text-sm text-muted-foreground line-clamp-1 max-w-[200px]">{res.memo || '-'}</p>
                      </td>
                      <td className="py-6 text-right pr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="text-muted-foreground hover:text-foreground transition-colors"><DotsThreeVertical size={24} weight="bold" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Recent Records */}
          <section className="bg-card rounded-xl border border-border p-5 md:p-10card-shadow">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-black text-foreground flex items-center gap-3">
                <CheckCircle size={28} weight="fill" className="text-primary" />
                최근 시술 기록
              </h2>
              <button className="text-primary font-bold text-sm flex items-center gap-1 hover:underline">
                실시간 기록 보기 <CaretRight weight="bold" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stats.recentTreatments.length === 0 ? (
                <div className="col-span-2 py-10 text-center text-muted-foreground">최근 시술 데이터가 없습니다.</div>
              ) : stats.recentTreatments.map((rec: any) => (
                <div key={rec.id} className="p-6 rounded-xl border border-border hover:border-primary/30 transition-all flex justify-between items-center group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                      <ClockCounterClockwise size={20} weight="fill" />
                    </div>
                    <div>
                      <div className="font-black text-foreground">{rec.customers.name} <span className="text-[10px] text-muted-foreground ml-2 font-normal">{format(new Date(rec.treatment_date), 'HH:mm')}</span></div>
                      <div className="text-xs text-muted-foreground font-medium">{rec.treatment_types?.name || '헤나 시술'}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-error">{rec.payment_amount.toLocaleString()}원</div>
                    <div className="text-[10px] uppercase font-black text-muted-foreground tracking-tighter">{rec.payment_method}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-8">
          {/* Low Stock Alerts */}
          <section className="bg-card rounded-xl border border-border p-8 card-shadow">
            <div className="flex items-center gap-2 mb-6">
              <WarningCircle size={24} weight="fill" className="text-error" />
              <h2 className="text-lg font-black text-foreground">염색약 소진 임박</h2>
            </div>
            <div className="space-y-4">
              {stats.lowStockCustomers.map((low: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-5 bg-muted rounded-xl border border-transparent hover:border-error-container/30 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center text-xs font-black text-error">{low.customers.name[0]}</div>
                    <div>
                      <div className="text-sm font-black text-foreground">{low.customers.name}</div>
                      <div className="text-[10px] font-bold text-error uppercase">잔여: {low.remaining_quantity.toFixed(1)}회분</div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button className="p-2 rounded-xl bg-card text-primary hover:bg-primary hover:text-primary-foreground transition-all card-shadow border border-border"><ChatText size={18} weight="fill" /></button>
                    <button className="p-2 rounded-xl bg-card text-primary hover:bg-primary hover:text-primary-foreground transition-all card-shadow border border-border"><PhoneCall size={18} weight="fill" /></button>
                  </div>
                </div>
              ))}
              {stats.lowStockCustomers.length === 0 && <p className="text-center py-6 text-sm text-outline-variant">관리 대상 고객이 없습니다.</p>}
            </div>
          </section>

          {/* Retention Advice */}
          <section className="bg-card rounded-xl border border-border p-8 card-shadow">
            <div className="flex items-center gap-2 mb-6">
              <CalendarBlank size={24} weight="fill" className="text-tertiary" />
              <h2 className="text-lg font-black text-foreground">재방문 안내 권장</h2>
            </div>
            <div className="p-6 bg-tertiary-container/20 rounded-xl border border-tertiary-container/30">
               <p className="text-xs text-tertiary font-bold leading-relaxed">
                  마지막 방문으로부터 45일이 경과한 고객들입니다. 맞춤 서비스 안내를 권장합니다.
               </p>
            </div>
            <div className="mt-6 space-y-3">
               {[
                 { name: '박영선', days: 48 },
                 { name: '이정화', days: 52 },
                 { name: '장미란', days: 60 }
               ].map((c, i) => (
                 <div key={i} className="flex items-center justify-between px-2 py-1 border-b border-border/50 last:border-0 hover:bg-muted rounded-lg transition-colors cursor-pointer group">
                   <div className="text-sm font-bold text-foreground group-hover:translate-x-1 transition-transform">{c.name}</div>
                   <div className="text-xs font-medium text-outline-variant">{c.days}일 전 방문</div>
                 </div>
               ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
