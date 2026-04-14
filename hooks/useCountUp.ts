'use client'

import { useEffect } from 'react'
import { useMotionValue, useTransform, animate, MotionValue } from 'framer-motion'

/**
 * KPI 숫자를 0에서 target까지 카운팅 애니메이션.
 * 반환값은 framer-motion MotionValue<number> — <motion.span>에 바로 사용 가능.
 */
export function useCountUp(target: number, duration = 1.1): MotionValue<string> {
  const motionValue = useMotionValue(0)

  // 숫자 포맷: 정수면 toLocaleString, 소수면 소수점 1자리 유지
  const formatted = useTransform(motionValue, (v) => {
    if (Number.isInteger(target)) {
      return Math.round(v).toLocaleString('ko-KR')
    }
    return v.toFixed(1)
  })

  useEffect(() => {
    motionValue.set(0)
    const controls = animate(motionValue, target, {
      duration,
      ease: [0.25, 0.46, 0.45, 0.94], // easeOutQuart
    })
    return controls.stop
  }, [target, duration, motionValue])

  return formatted
}
