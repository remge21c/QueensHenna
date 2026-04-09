"use client"

import React, { useState } from "react"
import { Drop, MagnifyingGlass, Scales } from "@phosphor-icons/react"
import InventoryTable from "@/components/inventory/InventoryTable"
import DyeMasterPanel from "@/components/inventory/DyeMasterPanel"
import DyeUnitPanel from "@/components/inventory/DyeUnitPanel"

interface InventoryTabsProps {
  inventory: any[]
}

type Tab = "stocks" | "master" | "units"

const TABS: { id: Tab; label: string }[] = [
  { id: "stocks", label: "고객별 잔여 현황" },
  { id: "master", label: "염색약 마스터 관리" },
  { id: "units", label: "단위 관리" },
]

export default function InventoryTabs({ inventory }: InventoryTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>("stocks")

  return (
    <>
      {/* 탭 */}
      <div className="flex gap-6 border-b border-border text-sm font-bold overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-4 px-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? "border-primary text-primary"
                : "text-muted-foreground border-transparent hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 탭 콘텐츠 */}
      <div className="bg-card rounded-xl border border-border card-shadow p-6 flex flex-col gap-6">
        {activeTab === "stocks" && (
          <>
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="relative group max-w-sm w-full">
                <MagnifyingGlass
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors"
                />
                <input
                  type="text"
                  placeholder="고객명 혹은 염색약 종류 검색..."
                  className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm"
                />
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground bg-background px-3 py-1.5 rounded-lg border border-border flex-wrap">
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-success" />정상</div>
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-warning" />주의 (2회↓)</div>
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-danger" />경고 (1회↓)</div>
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-danger/40" />소진</div>
              </div>
            </div>
            {inventory.length > 0 ? (
              <InventoryTable inventory={inventory} />
            ) : (
              <div className="flex flex-col items-center justify-center py-24 gap-4 bg-background/30 rounded-xl border border-dashed border-border">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                  <Drop size={32} weight="thin" />
                </div>
                <div className="text-center">
                  <h3 className="font-bold text-foreground">데이터가 없습니다.</h3>
                  <p className="text-sm text-muted-foreground mt-1">등록된 고객의 염색약 현황이 없습니다.</p>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === "master" && <DyeMasterPanel />}

        {activeTab === "units" && <DyeUnitPanel />}
      </div>
    </>
  )
}
