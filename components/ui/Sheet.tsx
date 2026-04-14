"use client"

import React, { useEffect } from "react"
import { X } from "@phosphor-icons/react"

interface SheetProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  width?: string
}

export default function Sheet({ isOpen, onClose, title, children, width = "max-w-2xl" }: SheetProps) {
  const titleId = React.useId()

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
      className="fixed inset-0 z-50 flex justify-end"
    >
      {/* 오버레이 */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* 패널 */}
      <div
        className={`relative w-full ${width} h-full bg-background border-l border-border shadow-2xl flex flex-col animate-in slide-in-from-right duration-300`}
      >
        {/* 헤더 */}
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
            <h2 id={titleId} className="text-lg font-bold text-foreground">{title}</h2>
            <button
              onClick={onClose}
              aria-label="닫기"
              className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <X size={20} weight="bold" aria-hidden="true" />
            </button>
          </div>
        )}

        {/* 콘텐츠 (스크롤 가능) */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </div>
  )
}
