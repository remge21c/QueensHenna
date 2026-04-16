'use client'

import React, { useTransition } from 'react'
import {
  ChartLineUp,
  CreditCard,
  UserCircleGear,
  DownloadSimple,
  CurrencyKrw,
  ChartBar,
} from '@phosphor-icons/react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { SkeletonSales } from '@/components/ui/Skeleton'

interface Props {
  stats: any
  targetMonth: string
}

export default function SalesContent({ stats, targetMonth }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleMonthChange = (month: string) => {
    startTransition(() => {
      router.push(`/sales?month=${month}`)
    })
  }

  if (isPending) return <SkeletonSales />

  const kpis = [
    { label: '총 매출금액', value: `${stats.totalRevenue.toLocaleString()}원`, icon: CurrencyKrw, color: 'text-primary' },
    { label: '총 시술건수', value: `${stats.totalCount}건`, icon: ChartLineUp, color: 'text-foreground' },
    { label: '카드 결제 비율', value: `${stats.cardRatio.toFixed(1)}%`, icon: CreditCard, color: 'text-foreground' },
    { label: '평균 객단가', value: `${Math.round(stats.avgTicket).toLocaleString()}원`, icon: UserCircleGear, color: 'text-foreground' }
  ]

  const maxTotal = Math.max(...stats.dailyBreakdown.map((d: any) => d.total), 1)

  return (
    <div className="animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 md:sticky md:top-0 md:z-20 md:bg-background md:-mx-8 md:px-8 md:pt-8 md:-mt-8">
        <div>
          <h1 className="text-xl md:text-3xl font-black text-foreground tracking-tight">
            매출 통계
          </h1>
          <p className="text-muted-foreground mt-1">지점 운영 성과와 매출 추이를 한눈에 확인하세요.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <input
            type="month"
            value={targetMonth}
            onChange={(e) => handleMonthChange(e.target.value)}
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
            <div className="flex justify-between items-start gap-2">
              <div className="z-10 min-w-0 flex-1">
                <p className="text-xs md:text-sm font-bold text-muted-foreground mb-1 md:mb-2 truncate">{kpi.label}</p>
                <p className={`text-lg md:text-2xl font-black font-[family-name:var(--font-numeric)] tabular-nums truncate ${kpi.color}`}>{kpi.value}</p>
              </div>
              <div className="p-2 md:p-3 bg-muted rounded-xl text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all shrink-0">
                <kpi.icon size={20} weight="bold" className="md:hidden" />
                <kpi.icon size={24} weight="bold" className="hidden md:block" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 일자별 매출 추이 — 수평 바 차트 */}
      <section className="bg-card rounded-xl border border-border p-4 md:p-10 card-shadow mb-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg md:text-xl font-black text-foreground flex items-center gap-3">
            <ChartBar size={24} weight="fill" className="text-primary" />
            일자별 매출 추이
          </h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-primary" />
              <span className="text-xs font-bold text-muted-foreground">카드</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-warning" />
              <span className="text-xs font-bold text-muted-foreground">현금/기타</span>
            </div>
          </div>
        </div>

        {stats.dailyBreakdown.length === 0 ? (
          <p className="py-12 text-center text-muted-foreground">해당 월의 매출 데이터가 없습니다.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {stats.dailyBreakdown.map((d: any) => {
              const cardPct = maxTotal > 0 ? (d.card / maxTotal) * 100 : 0
              const cashPct = maxTotal > 0 ? (d.cash / maxTotal) * 100 : 0
              return (
                <div key={d.date} className="flex items-center gap-3">
                  {/* 날짜 레이블 */}
                  <div className="w-10 shrink-0 text-right">
                    <span className="text-xs font-black text-muted-foreground">
                      {format(new Date(d.date), 'dd')}
                    </span>
                    <span className="block text-[9px] text-outline-variant font-bold">
                      {format(new Date(d.date), 'E', { locale: ko })}
                    </span>
                  </div>
                  {/* 바 영역 */}
                  <div className="flex-1 h-7 bg-muted rounded-lg overflow-hidden flex">
                    {cardPct > 0 && (
                      <div
                        className="h-full bg-primary transition-all duration-700 flex items-center justify-end pr-1"
                        style={{ width: `${cardPct}%` }}
                      />
                    )}
                    {cashPct > 0 && (
                      <div
                        className="h-full bg-warning transition-all duration-700"
                        style={{ width: `${cashPct}%` }}
                      />
                    )}
                    {d.total === 0 && (
                      <div className="h-full w-full flex items-center pl-3">
                        <span className="text-[10px] text-muted-foreground">-</span>
                      </div>
                    )}
                  </div>
                  {/* 금액 */}
                  <div className="w-20 shrink-0 text-right">
                    <span className="text-xs font-black text-foreground font-[family-name:var(--font-numeric)] tabular-nums">
                      {d.total > 0 ? `${(d.total / 1000).toFixed(0)}K` : '-'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Detailed Table */}
      <section className="bg-card rounded-xl border border-border p-4 md:p-10 card-shadow">
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
