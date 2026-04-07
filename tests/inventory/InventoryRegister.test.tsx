import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import DyePurchaseForm from '@/components/inventory/DyePurchaseForm'
import React from 'react'

describe('DyePurchaseForm', () => {
  it('should render all input fields', () => {
    // 고객 목록과 염색약 종류 목록을 mock 데이터로 전달한다고 가정
    render(
      <DyePurchaseForm 
        customers={[{ id: '1', name: '김미영' }]} 
        dyeTypes={[{ id: '1', name: '내츄럴 브라운' }]}
        units={[{ id: '1', name: 'g' }]}
      />
    )

    expect(screen.getByText(/고객 선택/)).toBeInTheDocument()
    expect(screen.getByText(/염색약 종류/)).toBeInTheDocument()
    expect(screen.getByLabelText(/구매 수량/)).toBeInTheDocument()
  })
})
