'use client'

import { useEffect, useState } from 'react'

/**
 * 스크롤이 threshold px 이상 내려가면 isScrolled: true 반환.
 * sticky 헤더에 glassmorphism 효과를 조건부로 적용할 때 사용.
 */
export function useScrollGlass(threshold = 20) {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const el = document.querySelector('main') as HTMLElement | null
    if (!el) return

    const onScroll = () => {
      setIsScrolled(el.scrollTop > threshold)
    }

    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [threshold])

  return isScrolled
}
