import { describe, it, expect, vi, beforeEach } from 'vitest'
import { signIn } from '@/app/(auth)/actions'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

// Mock Supabase server client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}))

describe('Authentication Actions', () => {
  const mockSupabase = {
    auth: {
      signInWithPassword: vi.fn(),
    },
  }

  beforeEach(() => {
    vi.clearAllMocks()
    ;(createClient as any).mockReturnValue(mockSupabase)
  })

  it('should call redirect on successful login', async () => {
    mockSupabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: { id: '123' } },
      error: null,
    })

    const formData = new FormData()
    formData.append('email', 'test@example.com')
    formData.append('password', 'password123')

    await signIn(formData)
    
    expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    })
    expect(redirect).toHaveBeenCalledWith('/')
  })

  it('should return error message on failed login', async () => {
    mockSupabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: null },
      error: { message: 'Invalid login credentials' },
    })

    const formData = new FormData()
    formData.append('email', 'wrong@example.com')
    formData.append('password', 'wrongpass')

    const result = await signIn(formData)
    expect(result).toBe('Invalid login credentials')
    expect(redirect).not.toHaveBeenCalled()
  })
})
