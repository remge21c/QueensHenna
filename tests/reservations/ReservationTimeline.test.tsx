import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ReservationTimeline from '@/components/reservations/ReservationTimeline'
import React from 'react'

const mockReservations = [
  {
    id: '1',
    reserved_at: '2026-04-07T10:00:00',
    status: '시술완료',
    customer: { name: '김미영' },
    memo: '기본 염색 예약'
  },
  {
    id: '2',
    reserved_at: '2026-04-07T11:30:00',
    status: '예약',
    customer: { name: '이현주' },
    memo: '오렌지 + 두피 예약'
  }
]

describe('ReservationTimeline', () => {
  it('should render reservation items correctly in the timeline', () => {
    // Render timeline for 2026-04-07
    render(<ReservationTimeline reservations={mockReservations} selectedDate="2026-04-07" />)

    // Check for customer names
    expect(screen.getByText('김미영')).toBeInTheDocument()
    expect(screen.getByText('이현주')).toBeInTheDocument()

    // Check for status badges
    expect(screen.getByText('시술완료')).toBeInTheDocument()
    expect(screen.getByText('예약')).toBeInTheDocument()

    // Check for times (checking if the hour slot labels are present)
    expect(screen.queryAllByText('10:00').length).toBeGreaterThanOrEqual(1)
    expect(screen.queryAllByText('11:30').length).toBeGreaterThanOrEqual(1)
    
    // Check for memos
    expect(screen.getByText('기본 염색 예약')).toBeInTheDocument()
    expect(screen.getByText('오렌지 + 두피 예약')).toBeInTheDocument()
  })

  it('should show a warning badge when 3 or more reservations are in the same slot', () => {
    const crowdedReservations = [
      { id: '1', reserved_at: '2026-04-07T10:00:00', status: '예약', customer: { name: 'A' }, memo: '' },
      { id: '2', reserved_at: '2026-04-07T10:15:00', status: '예약', customer: { name: 'B' }, memo: '' },
      { id: '3', reserved_at: '2026-04-07T10:30:00', status: '예약', customer: { name: 'C' }, memo: '' },
    ]

    render(<ReservationTimeline reservations={crowdedReservations} selectedDate="2026-04-07" />)

    expect(screen.getByText('겹침 주의')).toBeInTheDocument()
  })
})
