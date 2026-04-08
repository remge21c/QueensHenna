'use client'

import React, { useState, useEffect, useTransition } from 'react'
import ReservationTimeline from '@/components/reservations/ReservationTimeline'
import { format, addDays, subDays } from 'date-fns'
import { ko } from 'date-fns/locale'
import { CaretLeft, CaretRight, Plus } from '@phosphor-icons/react'
import { getReservationsByDate } from './actions'
import ReservationForm from '@/components/reservations/ReservationForm'

export default function ReservationsPage() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [reservations, setReservations] = useState<any[]>([])
  const [isPending, startTransition] = useTransition()
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    fetchReservations()
  }, [selectedDate])

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

  const goToPrevDay = () => setSelectedDate(subDays(selectedDate, 1))
  const goToNextDay = () => setSelectedDate(addDays(selectedDate, 1))
  const goToToday = () => setSelectedDate(new Date())

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2 tracking-tight">예약 관리</h1>
          <p className="text-muted-foreground">고객님의 예약 일정을 관리하고 새로운 예약을 등록하세요.</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary group"
        >
          <Plus weight="bold" className="group-hover:rotate-90 transition-transform duration-300" />
          <span>신규 예약 등록</span>
        </button>
      </div>

      {/* Date Navigation Bar */}
      <div className="bg-card rounded-xl p-6 card-shadow border border-border flex items-center justify-between sticky top-4 z-10 backdrop-blur-sm bg-card/90">
        <div className="flex items-center gap-6">
          <button
            onClick={goToPrevDay}
            className="p-3 hover:bg-surface-container rounded-xl transition-all hover:scale-110 active:scale-90"
            title="이전 날짜"
          >
            <CaretLeft size={24} weight="bold" className="text-primary" />
          </button>

          <div className="text-center min-w-[220px]">
            <h2 className="text-2xl font-black text-foreground tracking-tight">
              {format(selectedDate, 'yyyy년 MM월 dd일', { locale: ko })}
            </h2>
            <div className="flex items-center justify-center gap-2 mt-1">
              <span className="text-sm font-bold text-primary px-2 py-0.5 bg-primary-container rounded-md">
                {format(selectedDate, 'EEEE', { locale: ko })}
              </span>
            </div>
          </div>

          <button
            onClick={goToNextDay}
            className="p-3 hover:bg-surface-container rounded-xl transition-all hover:scale-110 active:scale-90"
            title="다음 날짜"
          >
            <CaretRight size={24} weight="bold" className="text-primary" />
          </button>
        </div>

        <button
          onClick={goToToday}
          className="px-5 py-2.5 text-sm font-bold text-primary hover:bg-primary hover:text-primary-foreground rounded-xl transition-all border-2 border-primary/20 hover:border-primary card-shadow"
        >
          오늘
        </button>
      </div>

      {/* Timeline View */}
      <ReservationTimeline
        reservations={reservations}
        selectedDate={format(selectedDate, 'yyyy-MM-dd')}
      />

      {showForm && (
        <ReservationForm
          initialDate={selectedDate}
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false)
            fetchReservations()
          }}
        />
      )}
    </div>
  )
}
