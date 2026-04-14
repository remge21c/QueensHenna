import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import CustomerTable from '@/components/customers/CustomerTable'
import React from 'react'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

const mockCustomers = [
  {
    id: '1',
    name: '김미영',
    phone: '010-1234-5678',
    last_visit: '2026-04-07',
    total_visits: 12,
    customer_dye_stocks: [
      {
        dye_types: { name: '내츄럴 브라운' },
        current_amount: 3.5,
        status: '정상',
      }
    ]
  },
  {
    id: '2',
    name: '오영희',
    phone: '010-9876-5432',
    last_visit: '2026-03-13',
    total_visits: 8,
    customer_dye_stocks: [
      {
        dye_types: { name: '라이트 브라운' },
        current_amount: 0.5,
        status: '소진임박',
      }
    ]
  }
]

describe('CustomerTable', () => {
  it('should render customer list correctly', () => {
    render(<CustomerTable customers={mockCustomers} />)

    expect(screen.getByText('김미영')).toBeInTheDocument()
    expect(screen.getByText('010-1234-5678')).toBeInTheDocument()
    expect(screen.getByText('12회')).toBeInTheDocument()
    expect(screen.getByText('내츄럴 브라운 (3.5회)')).toBeInTheDocument()

    expect(screen.getByText('오영희')).toBeInTheDocument()
    expect(screen.getByText('소진임박')).toBeInTheDocument()
  })
})
