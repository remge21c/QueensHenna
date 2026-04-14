import React from "react"
import { getInventory } from "@/lib/api/inventory"
import InventoryTabs from "@/components/inventory/InventoryTabs"
import { Drop, PlusCircle } from "@phosphor-icons/react/dist/ssr"

export const dynamic = "force-dynamic"

export default async function InventoryPage() {
  const inventory = await getInventory()

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500">
      {/* 헤더 */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 md:sticky md:top-0 md:z-20 md:bg-background md:-mx-8 md:px-8 md:pt-8 md:-mt-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-sm border border-primary/10">
            <Drop size={28} weight="fill" />
          </div>
          <div>
            <h1 className="text-xl md:text-3xl font-bold text-foreground tracking-tight">염색약 관리</h1>
            <p className="text-sm text-muted-foreground">고객별 잔여 현황 및 염색약 종류를 관리합니다.</p>
          </div>
        </div>
      </header>

      {/* 탭 + 콘텐츠 (클라이언트 컴포넌트) */}
      <InventoryTabs inventory={inventory} />

      {/* 안내 섹션 */}
      <div className="p-6 rounded-xl bg-primary/5 border border-primary/10 flex gap-4">
        <div className="text-primary mt-1">
          <PlusCircle size={20} weight="fill" />
        </div>
        <div className="text-sm leading-relaxed">
          <strong className="block mb-1 text-foreground">똑똑한 재고 알림</strong>
          시술 시 입력한 레시피 사용량을 기준으로 예상 남은 횟수를 계산합니다. 1.5회 미만으로 남은 경우 자동으로 &apos;주의&apos; 상태로 전환됩니다.
        </div>
      </div>
    </div>
  )
}
