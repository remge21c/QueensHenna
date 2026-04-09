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
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* 오버레이 */}
      <div
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
            <h2 className="text-lg font-bold text-foreground">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              <X size={20} weight="bold" />
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
