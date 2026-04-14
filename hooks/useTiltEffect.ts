'use client'

import { useRef, useCallback } from 'react'

/**
 * 카드에 3D 틸트 + 스포트라이트 효과를 주는 훅.
 * React state 대신 CSS custom property를 직접 DOM 조작 → 리렌더링 없음.
 * 터치 기기에서는 CSS @media (pointer: coarse) 로 자동 비활성화.
 */
export function useTiltEffect(intensity = 8) {
  const ref = useRef<HTMLDivElement>(null)
  const rafId = useRef<number | undefined>(undefined)

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (rafId.current !== undefined) cancelAnimationFrame(rafId.current)
      rafId.current = requestAnimationFrame(() => {
        const el = ref.current
        if (!el) return
        const rect = el.getBoundingClientRect()
        const x = (e.clientX - rect.left) / rect.width
        const y = (e.clientY - rect.top) / rect.height
        const rotateX = (y - 0.5) * -intensity
        const rotateY = (x - 0.5) * intensity

        el.style.setProperty('--tilt-x', `${rotateX}deg`)
        el.style.setProperty('--tilt-y', `${rotateY}deg`)
        el.style.setProperty('--spotlight-x', `${x * 100}%`)
        el.style.setProperty('--spotlight-y', `${y * 100}%`)
      })
    },
    [intensity]
  )

  const handleMouseLeave = useCallback(() => {
    if (rafId.current !== undefined) cancelAnimationFrame(rafId.current)
    const el = ref.current
    if (!el) return
    el.style.setProperty('--tilt-x', '0deg')
    el.style.setProperty('--tilt-y', '0deg')
  }, [])

  return {
    ref,
    handlers: {
      onMouseMove: handleMouseMove,
      onMouseLeave: handleMouseLeave,
    },
  }
}
