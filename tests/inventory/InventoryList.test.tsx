import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import InventoryTable from '@/components/inventory/InventoryTable'
import React from 'react'

const mockInventory = [
  {
    id: '1',
    customer: { name: '김미영' },
    dye_type: { name: '내츄럴 브라운' },
    purchased_amount: 500,
    current_amount: 175,
    recipe_amount: 50,
    remaining_uses: 3.5,
    status: '정상',
    unit: { name: 'g' }
  },
  {
    id: '2',
    customer: { name: '이현주' },
    dye_type: { name: '레드' },
    purchased_amount: 300,
    current_amount: 0,
    recipe_amount: 30,
    remaining_uses: 0,
    status: '소진',
    unit: { name: 'g' }
  }
]

describe('InventoryTable', () => {
  it('should render inventory data correctly', () => {
    render(<InventoryTable inventory={mockInventory} />)

    expect(screen.getByText('김미영')).toBeInTheDocument()
    expect(screen.getByText('내츄럴 브라운')).toBeInTheDocument()
    expect(screen.getByText('175g')).toBeInTheDocument()
    expect(screen.getByText('3.5회')).toBeInTheDocument()
    expect(screen.getByText('정상')).toBeInTheDocument()

    expect(screen.getByText('이현주')).toBeInTheDocument()
    expect(screen.getByText(/소진/)).toBeInTheDocument()
  })
})
