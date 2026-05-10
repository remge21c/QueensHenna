'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { useState } from 'react'
import {
  SquaresFour,
  Users,
  CalendarCheck,
  ClipboardText,
  DotsThreeOutline,
  Drop,
  ChatCircleText,
  ChartLineUp,
  Gear,
  X,
} from '@phosphor-icons/react'

const mainNavItems = [
  { name: '홈', href: '/', icon: SquaresFour },
  { name: '고객', href: '/customers', icon: Users },
  { name: '예약', href: '/reservations', icon: CalendarCheck },
  { name: '시술', href: '/treatments', icon: ClipboardText },
]

const moreItems = [
  { name: '염색약관리', href: '/inventory', icon: Drop },
  { name: '문자발송', href: '/sms', icon: ChatCircleText },
  { name: '매출통계', href: '/sales', icon: ChartLineUp },
  { name: '설정', href: '/settings', icon: Gear },
]

export default function BottomNav() {
  const pathname = usePathname()
  const [moreOpen, setMoreOpen] = useState(false)
  const sheetRef = useRef<HTMLDivElement>(null)

  const isMoreActive = moreItems.some((item) => pathname === item.href)


  // ESC 키 및 바깥 클릭으로 닫기
  useEffect(() => {
    if (!moreOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMoreOpen(false)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [moreOpen])

  return (
    <>
      {/* Bottom Sheet Overlay */}
      <AnimatePresence>
        {moreOpen && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
            aria-hidden="true"
            onClick={() => setMoreOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Bottom Sheet */}
      <AnimatePresence>
        {moreOpen && (
          <motion.div
            ref={sheetRef}
            key="sheet"
            role="dialog"
            aria-modal="true"
            aria-label="더 많은 메뉴"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 38 }}
            className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-surface rounded-t-2xl border-t border-border pb-safe shadow-xl"
          >
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border">
              <span className="text-base font-black text-foreground">더 보기</span>
              <button
                onClick={() => setMoreOpen(false)}
                aria-label="더 보기 닫기"
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-container transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <X size={20} weight="bold" aria-hidden="true" />
              </button>
            </div>

            <nav aria-label="추가 메뉴" className="grid grid-cols-4 gap-1 px-4 py-5">
              {moreItems.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMoreOpen(false)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl transition-colors ${
                      isActive
                        ? 'bg-primary-container text-primary'
                        : 'text-muted-foreground hover:bg-surface-container hover:text-foreground'
                    }`}
                  >
                    <Icon
                      size={24}
                      weight={isActive ? 'fill' : 'regular'}
                      aria-hidden="true"
                    />
                    <span className="text-[11px] font-bold">{item.name}</span>
                  </Link>
                )
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation Bar */}
      <nav
        aria-label="하단 네비게이션"
        className="fixed bottom-0 left-0 right-0 z-40 flex md:hidden glass border-t border-border/60 pb-safe"
      >
        {mainNavItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className="relative flex-1 flex flex-col items-center justify-center gap-0.5 py-3 min-h-[56px] transition-colors"
            >
              {isActive && (
                <motion.div
                  layoutId="bottomNavActive"
                  className="absolute inset-x-2 inset-y-1 rounded-2xl bg-primary-container"
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                />
              )}
              <span className="relative z-10">
                <Icon
                  size={22}
                  weight={isActive ? 'fill' : 'regular'}
                  className={isActive ? 'text-primary' : 'text-muted-foreground'}
                  aria-hidden="true"
                />
              </span>
              <span
                className={`relative z-10 text-[10px] font-bold tracking-tight ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {item.name}
              </span>
            </Link>
          )
        })}

        {/* 더보기 탭 */}
        <button
          onClick={() => setMoreOpen(true)}
          aria-label="더 많은 메뉴 열기"
          aria-expanded={moreOpen}
          className="relative flex-1 flex flex-col items-center justify-center gap-0.5 py-3 min-h-[56px] transition-colors"
        >
          {isMoreActive && (
            <motion.div
              layoutId="bottomNavActive"
              className="absolute inset-x-2 inset-y-1 rounded-2xl bg-primary-container"
              transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            />
          )}
          <span className="relative z-10">
            <DotsThreeOutline
              size={22}
              weight={isMoreActive ? 'fill' : 'regular'}
              className={isMoreActive ? 'text-primary' : 'text-muted-foreground'}
              aria-hidden="true"
            />
          </span>
          <span
            className={`relative z-10 text-[10px] font-bold tracking-tight ${
              isMoreActive ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            더보기
          </span>
        </button>
      </nav>
    </>
  )
}
