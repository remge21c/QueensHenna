import { describe, it, expect, vi, beforeEach } from 'vitest'
import { registerTreatmentAction } from '@/app/treatments/actions'
import { createClient } from '@/lib/supabase/server'

// Mock Supabase
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn()
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn()
}))

describe('Treatment Registration Actions', () => {
  const mockSupabase = {
    rpc: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
    ;(createClient as any).mockResolvedValue(mockSupabase)
  })

  it('should register a treatment successfully via RPC', async () => {
    mockSupabase.rpc.mockResolvedValue({
      data: 'new-treatment-id',
      error: null
    })

    const result = await registerTreatmentAction(
      'customer-id',
      'treatment-type-id',
      80000,
      '카드',
      '메모내용',
      [{ dye_id: 'dye-id', unit_id: 'unit-id', amount: 50 }]
    )

    expect(mockSupabase.rpc).toHaveBeenCalledWith('register_treatment', expect.objectContaining({
      p_customer_id: 'customer-id',
      p_total_price: 80000,
      p_usages: [{ dye_id: 'dye-id', unit_id: 'unit-id', amount: 50 }]
    }))
    expect(result.success).toBe(true)
    expect(result.treatmentId).toBe('new-treatment-id')
  })

  it('should return error when RPC fails', async () => {
    mockSupabase.rpc.mockResolvedValue({
      data: null,
      error: { message: 'Deduction failed: insufficient stock' }
    })

    const result = await registerTreatmentAction(
      'customer-id',
      'treatment-type-id',
      80000,
      '카드',
      '',
      []
    )

    expect(result.success).toBe(false)
    expect(result.error).toBe('Deduction failed: insufficient stock')
  })
})
