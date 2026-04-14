'use client'

import { motion } from 'framer-motion'

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.04,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
}

/** 아이템 수가 많을 때(10+) 사용: stagger 간격을 0.02로 줄임 */
const containerVariantsFast = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.02,
    },
  },
}

interface StaggerListProps {
  children: React.ReactNode
  className?: string
  fast?: boolean
}

export function StaggerList({ children, className, fast = false }: StaggerListProps) {
  return (
    <motion.div
      variants={fast ? containerVariantsFast : containerVariants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  )
}
