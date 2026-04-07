import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import CustomerRegisterForm from '@/components/customers/CustomerRegisterForm'
import React from 'react'

describe('CustomerRegisterForm', () => {
  it('should render all input fields', () => {
    render(<CustomerRegisterForm />)

    expect(screen.getByLabelText(/고객명/)).toBeInTheDocument()
    expect(screen.getByLabelText(/연락처/)).toBeInTheDocument()
    expect(screen.getByLabelText(/생년월일/)).toBeInTheDocument()
    expect(screen.getByLabelText(/메모/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /등록하기/ })).toBeInTheDocument()
  })

  it('should show error when required fields are empty', async () => {
    render(<CustomerRegisterForm />)
    
    const submitButton = screen.getByRole('button', { name: /등록하기/ })
    fireEvent.click(submitButton)

    // Validation messages (assuming standard behavior)
    expect(await screen.findByText(/고객명을 입력해주세요/)).toBeInTheDocument()
  })
})
