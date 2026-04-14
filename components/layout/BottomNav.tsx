'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  SquaresFour,
  Users,
  CalendarCheck,
  ClipboardText,
  Gear,
} from '@phosphor-icons/react'

const navItems = [
  { name: '홈', href: '/', icon: SquaresFour },
  { name: '고객', href: '/customers', icon: Users },
  { name: '예약', href: '/reservations', icon: CalendarCheck },
  { name: '시술', href: '/treatments', icon: ClipboardText },
  { name: '설정', href: '/settings', icon: Gear },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      aria-label="하단 네비게이션"
      className="fixed bottom-0 left-0 right-0 z-40 flex md:hidden glass border-t border-border/60 pb-safe"
    >
      {navItems.map((item) => {
        const isActive = pathname === item.href
        const Icon = item.icon

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? 'page' : undefined}
            className="relative flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 transition-colors"
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
    </nav>
  )
}
