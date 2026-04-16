'use client'

import React, { useState, useEffect, useTransition } from 'react'
import ReservationTimeline from '@/components/reservations/ReservationTimeline'
import WeeklyView from '@/components/reservations/WeeklyView'
import { format, addDays, subDays, startOfWeek, addWeeks, subWeeks } from 'date-fns'
import { ko } from 'date-fns/locale'
import { CaretLeft, CaretRight, Plus, CalendarBlank, Rows } from '@phosphor-icons/react'
import { getReservationsByDate, getReservationsByWeek } from './actions'
import ReservationForm from '@/components/reservations/ReservationForm'

export default function ReservationsPage() {
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [reservations, setReservations] = useState<any[]>([])
  const [weekData, setWeekData] = useState<Record<string, any[]>>({})
  const [isPending, startTransition] = useTransition()
  const [showForm, setShowForm] = useState(false)
  const [selectedTime, setSelectedTime] = useState<string | undefined>(undefined)
  const [formInitialDate, setFormInitialDate] = useState<Date>(new Date())

  // 모바일에서는 주간뷰 미지원 — 뷰 모드 강제 전환
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      if (e.matches && viewMode === 'week') setViewMode('day')
    }
    handleChange(mq)
    mq.addEventListener('change', handleChange)
    return () => mq.removeEventListener('change', handleChange)
  }, [viewMode])

  useEffect(() => {
    if (viewMode === 'day') fetchReservations()
    else fetchWeekReservations()
  }, [selectedDate, weekStart, viewMode])

  const fetchReservations = () => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd')
    startTransition(async () => {
      try {
        const data = await getReservationsByDate(dateStr)
        setReservations(data)
      } catch (error) {
        console.error('Failed to fetch reservations:', error)
      }
    })
  }

  const fetchWeekReservations = () => {
    const mondayStr = format(weekStart, 'yyyy-MM-dd')
    startTransition(async () => {
      try {
        const data = await getReservationsByWeek(mondayStr)
        setWeekData(data)
      } catch (error) {
        console.error('Failed to fetch week reservations:', error)
      }
    })
  }

  const goToPrev = () => {
    if (viewMode === 'day') setSelectedDate(subDays(selectedDate, 1))
    else setWeekStart(subWeeks(weekStart, 1))
  }
  const goToNext = () => {
    if (viewMode === 'day') setSelectedDate(addDays(selectedDate, 1))
    else setWeekStart(addWeeks(weekStart, 1))
  }
  const goToToday = () => {
    setSelectedDate(new Date())
    setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))
  }

  const navLabel = viewMode === 'day'
    ? format(selectedDate, 'yyyy년 MM월 dd일', { locale: ko })
    : `${format(weekStart, 'MM/dd', { locale: ko })} – ${format(addDays(weekStart, 6), 'MM/dd', { locale: ko })}`

  const navSub = viewMode === 'day'
    ? format(selectedDate, 'EEEE', { locale: ko })
    : format(weekStart, 'yyyy년 MM월', { locale: ko })

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-start pb-6 md:sticky md:top-0 md:z-20 md:bg-background md:-mx-8 md:px-8 md:pt-8 md:-mt-8">
        <div>
          <h1 className="text-xl md:text-3xl font-bold text-foreground mb-2 tracking-tight">예약 관리</h1>
          <p className="hidden sm:block text-muted-foreground">고객님의 예약 일정을 관리하고 새로운 예약을 등록하세요.</p>
        </div>
        <button onClick={() => { setFormInitialDate(selectedDate); setShowForm(true) }} className="btn-primary group shrink-0">
          <Plus weight="bold" className="group-hover:rotate-90 transition-transform duration-300" />
          <span className="hidden sm:inline">신규 예약 등록</span>
          <span className="sm:hidden">등록</span>
        </button>
      </div>

      {/* Navigation Bar */}
      <div className="bg-card rounded-xl p-3 md:p-6 card-shadow border border-border sticky top-4 z-10 backdrop-blur-sm bg-card/90">
        {/* 모바일: 2행 레이아웃 */}
        <div className="flex flex-col gap-2 md:hidden">
          {/* 1행: 날짜 네비게이션 */}
          <div className="flex items-center justify-between">
            <button
              onClick={goToPrev}
              aria-label={viewMode === 'day' ? '이전 날' : '이전 주'}
              className="p-2 hover:bg-surface-container rounded-xl transition-all active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <CaretLeft size={22} weight="bold" className="text-primary" aria-hidden="true" />
            </button>
            <div className="text-center flex-1 px-2">
              <h2 className="text-sm font-black text-foreground tracking-tight leading-tight">{navLabel}</h2>
              <span className="text-xs font-bold text-primary px-2 py-0.5 bg-primary-container rounded-md inline-block mt-0.5">{navSub}</span>
            </div>
            <button
              onClick={goToNext}
              aria-label={viewMode === 'day' ? '다음 날' : '다음 주'}
              className="p-2 hover:bg-surface-container rounded-xl transition-all active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <CaretRight size={22} weight="bold" className="text-primary" aria-hidden="true" />
            </button>
          </div>
          {/* 2행: 뷰 토글 + 오늘 */}
          <div className="flex items-center gap-2">
            <div role="group" aria-label="보기 방식 선택" className="flex flex-1 bg-muted rounded-xl p-1 border border-border">
              <button
                onClick={() => setViewMode('day')}
                aria-pressed={viewMode === 'day'}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  viewMode === 'day' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground'
                }`}
              >
                <Rows size={15} weight="bold" aria-hidden="true" />
                일별
              </button>
              <button
                onClick={() => setViewMode('week')}
                aria-pressed={viewMode === 'week'}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  viewMode === 'week' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground'
                }`}
              >
                <CalendarBlank size={15} weight="bold" aria-hidden="true" />
                주간
              </button>
            </div>
            <button
              onClick={goToToday}
              className="px-4 py-2 text-sm font-bold text-primary hover:bg-primary hover:text-primary-foreground rounded-xl transition-all border-2 border-primary/20 hover:border-primary min-h-[44px]"
            >
              오늘
            </button>
          </div>
        </div>

        {/* 데스크탑: 1행 레이아웃 */}
        <div className="hidden md:flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button
              onClick={goToPrev}
              aria-label={viewMode === 'day' ? '이전 날' : '이전 주'}
              className="p-3 hover:bg-surface-container rounded-xl transition-all hover:scale-110 active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <CaretLeft size={24} weight="bold" className="text-primary" aria-hidden="true" />
            </button>
            <div className="text-center min-w-[220px]">
              <h2 className="text-2xl font-black text-foreground tracking-tight">{navLabel}</h2>
              <div className="flex items-center justify-center gap-2 mt-1">
                <span className="text-sm font-bold text-primary px-2 py-0.5 bg-primary-container rounded-md">{navSub}</span>
              </div>
            </div>
            <button
              onClick={goToNext}
              aria-label={viewMode === 'day' ? '다음 날' : '다음 주'}
              className="p-3 hover:bg-surface-container rounded-xl transition-all hover:scale-110 active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <CaretRight size={24} weight="bold" className="text-primary" aria-hidden="true" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <div role="group" aria-label="보기 방식 선택" className="flex bg-muted rounded-xl p-1 border border-border">
              <button
                onClick={() => setViewMode('day')}
                aria-pressed={viewMode === 'day'}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  viewMode === 'day' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Rows size={16} weight="bold" aria-hidden="true" />
                일별
              </button>
              <button
                onClick={() => setViewMode('week')}
                aria-pressed={viewMode === 'week'}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  viewMode === 'week' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <CalendarBlank size={16} weight="bold" aria-hidden="true" />
                주간
              </button>
            </div>
            <button
              onClick={goToToday}
              className="px-4 py-2 text-sm font-bold text-primary hover:bg-primary hover:text-primary-foreground rounded-xl transition-all border-2 border-primary/20 hover:border-primary"
            >
              오늘
            </button>
          </div>
        </div>
      </div>

      {/* View */}
      {viewMode === 'day' ? (
        <ReservationTimeline
          reservations={reservations}
          selectedDate={format(selectedDate, 'yyyy-MM-dd')}
          onAdd={(time) => { setSelectedTime(time); setFormInitialDate(selectedDate); setShowForm(true) }}
          onRefresh={fetchReservations}
        />
      ) : (
        <WeeklyView
          weekData={weekData}
          weekStart={weekStart}
          onAdd={(date, time) => { setFormInitialDate(date); setSelectedTime(time); setShowForm(true) }}
          onDayClick={(date) => { setSelectedDate(date); setViewMode('day') }}
          onRefresh={fetchWeekReservations}
        />
      )}

      {showForm && (
        <ReservationForm
          initialDate={formInitialDate}
          initialTime={selectedTime}
          onClose={() => { setShowForm(false); setSelectedTime(undefined) }}
          onSuccess={() => {
            setShowForm(false)
            setSelectedTime(undefined)
            if (viewMode === 'day') fetchReservations()
            else fetchWeekReservations()
          }}
        />
      )}
    </div>
  )
}
