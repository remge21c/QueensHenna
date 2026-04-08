'use client'

import React, { useEffect, useState } from 'react'
import {
  ChartLineUp,
  TrendUp,
  CreditCard,
  UserCircleGear,
  DownloadSimple,
  Calendar,
  CurrencyKrw,
  CheckCircle,
  Selection
} from '@phosphor-icons/react'
import { getSalesStats } from './actions'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

export default function SalesPage() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [targetMonth, setTargetMonth] = useState(format(new Date(), 'yyyy-MM'))

  useEffect(() => {
    async function loadStats() {
      setLoading(true)
      const data = await getSalesStats(targetMonth)
      setStats(data)
      setLoading(false)
    }
    loadStats()
  }, [targetMonth])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-muted-foreground font-medium">매출 정보를 분석하는 중...</p>
      </div>
    )
  }

  const kpis = [
    { label: '총 매출금액', value: `${stats.totalRevenue.toLocaleString()}원`, icon: CurrencyKrw, color: 'text-primary' },
    { label: '총 시술건수', value: `${stats.totalCount}건`, icon: ChartLineUp, color: 'text-foreground' },
    { label: '카드 결제 비율', value: `${stats.cardRatio.toFixed(1)}%`, icon: CreditCard, color: 'text-foreground' },
    { label: '평균 객단가', value: `${Math.round(stats.avgTicket).toLocaleString()}원`, icon: UserCircleGear, color: 'text-foreground' }
  ]

  const maxTotal = Math.max(...stats.dailyBreakdown.map((d: any) => d.total), 1)

  return (
    <div className="animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 sticky top-0 z-20 bg-background -mx-4 px-4 pt-4 -mt-4 md:-mx-8 md:px-8 md:pt-8 md:-mt-8">
        <div>
          <h1 className="text-xl md:text-3xl font-black text-foreground tracking-tight flex items-center gap-2">
            매출 통계
            <span className="text-sm font-medium text-error bg-error-container/30 px-3 py-1 rounded-full uppercase tracking-tighter">Finance Analytics</span>
          </h1>
          <p className="text-muted-foreground mt-1">지점 운영 성과와 매출 추이를 한눈에 확인하세요.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <input
            type="month"
            value={targetMonth}
            onChange={(e) => setTargetMonth(e.target.value)}
            className="px-6 py-3 rounded-xl border-2 border-border font-bold text-foreground focus:border-primary focus:ring-0 transition-all outline-none bg-card card-shadow"
          />
          <button className="flex items-center gap-2 px-6 py-3 bg-card border-2 border-border text-muted-foreground rounded-xl font-bold hover:bg-muted transition-all card-shadow">
            <DownloadSimple weight="bold" size={20} />
            CSV 추출
          </button>
        </div>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-10">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="bg-card p-4 md:p-8 rounded-xl border border-border card-shadow relative overflow-hidden group hover:scale-[1.02] transition-transform">
             <div className="flex justify-between items-start">
               <div className="z-10">
                 <p className="text-sm font-bold text-muted-foreground mb-2">{kpi.label}</p>
                 <p className={`text-2xl font-black ${kpi.color}`}>{kpi.value}</p>
               </div>
               <div className="p-3 bg-muted rounded-xl text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                 <kpi.icon size={24} weight="bold" />
               </div>
             </div>
             <div className="mt-4 flex items-center gap-2">
                <TrendUp className="text-green-500" weight="bold" />
                <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Growth detected</span>
             </div>
          </div>
        ))}
      </div>

      {/* Mini Visual Chart (CSS-based) */}
      <section className="bg-card rounded-xl border border-border p-4 md:p-10card-shadow mb-10 overflow-hidden relative">
         <div className="flex justify-between items-center mb-10">
            <h2 className="text-xl font-black text-foreground flex items-center gap-3">
              <Selection size={28} weight="fill" className="text-primary" />
              일자별 매출 추이
            </h2>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded-full bg-primary" />
                 <span className="text-xs font-bold text-muted-foreground">카드 결제</span>
              </div>
              <div className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded-full bg-warning" />
                 <span className="text-xs font-bold text-muted-foreground">현금/기타</span>
              </div>
            </div>
         </div>

         <div className="flex items-end justify-between h-[200px] gap-2 px-4 relative">
            {/* Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              {[0, 1, 2, 3].map(i => <div key={i} className="border-t border-surface-variant w-full" />)}
            </div>

            {stats.dailyBreakdown.slice(0, 15).reverse().map((d: any, i: number) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 relative group z-10">
                 <div className="w-full flex flex-col-reverse h-[160px] relative">
                    <div
                      className="w-full bg-warning rounded-t-lg transition-all duration-1000 origin-bottom"
                      style={{ height: `${(d.cash / maxTotal) * 100}%` }}
                    />
                    <div
                      className="w-full bg-primary rounded-t-lg mb-[1px] transition-all duration-1000 origin-bottom"
                      style={{ height: `${(d.card / maxTotal) * 100}%` }}
                    />
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-inverse-surface text-inverse-on-surface text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                      {d.total.toLocaleString()}원
                    </div>
                 </div>
                 <span className="text-[10px] font-black text-outline-variant uppercase">{format(new Date(d.date), 'dd')}</span>
              </div>
            ))}
         </div>
      </section>

      {/* Detailed Table */}
      <section className="bg-card rounded-xl border border-border p-4 md:p-10card-shadow">
        <h2 className="text-xl font-black text-foreground mb-8">매출 상세 내역</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b-2 border-border/50">
                <th className="pb-6 font-black text-outline-variant text-xs uppercase tracking-widest pl-4">일자</th>
                <th className="pb-6 font-black text-outline-variant text-xs uppercase tracking-widest text-center">시술건수</th>
                <th className="pb-6 font-black text-outline-variant text-xs uppercase tracking-widest text-right">카드 결제</th>
                <th className="pb-6 font-black text-outline-variant text-xs uppercase tracking-widest text-right">현금/계좌</th>
                <th className="pb-6 font-black text-outline-variant text-xs uppercase tracking-widest text-right pr-4">합계</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {stats.dailyBreakdown.map((day: any) => (
                <tr key={day.date} className="hover:bg-muted/50 transition-colors">
                  <td className="py-6 pl-4">
                    <span className="font-black text-foreground">{format(new Date(day.date), 'yyyy.MM.dd')}</span>
                    <span className="text-xs text-outline-variant ml-2 font-bold">({format(new Date(day.date), 'E', { locale: ko })})</span>
                  </td>
                  <td className="py-6 text-center">
                    <span className="px-3 py-1 bg-surface-variant text-foreground rounded-full text-xs font-black">{day.count}건</span>
                  </td>
                  <td className="py-6 text-right font-bold text-primary">{day.card.toLocaleString()}원</td>
                  <td className="py-6 text-right font-bold text-warning">{day.cash.toLocaleString()}원</td>
                  <td className="py-6 text-right pr-4">
                    <span className="font-black text-foreground text-lg">{day.total.toLocaleString()}원</span>
                  </td>
                </tr>
              ))}
              {stats.dailyBreakdown.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-outline-variant">조회된 매출 기록이 없습니다.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
