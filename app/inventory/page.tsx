import React from "react"
import { getInventory } from "@/lib/api/inventory"
import InventoryTable from "@/components/inventory/InventoryTable"
import { Drop, PlusCircle, MagnifyingGlass } from "@phosphor-icons/react/dist/ssr"

export default async function InventoryPage() {
  const inventory = await getInventory()

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500">
      {/* 헤더 */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 sticky top-0 z-20 bg-background -mx-4 px-4 pt-4 -mt-4 md:-mx-8 md:px-8 md:pt-8 md:-mt-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-sm border border-primary/10">
            <Drop size={28} weight="fill" />
          </div>
          <div>
            <h1 className="text-xl md:text-3xl font-bold text-foreground tracking-tight">염색약 관리 (고객 할당 현황)</h1>
            <p className="text-sm text-muted-foreground">고객별 잔여 현황 및 예상 남은 시술 횟수를 확인합니다.</p>
          </div>
        </div>
        <button className="btn-primary group">
          <PlusCircle size={20} weight="bold" />
          구매 등록
        </button>
      </header>

      {/* 탭 (UI 모사) */}
      <div className="flex gap-6 border-b border-border text-sm font-bold">
        <button className="pb-4 border-b-2 border-primary text-primary px-2 transition-all">고객별 잔여 현황</button>
        <button className="pb-4 text-muted-foreground border-b-2 border-transparent hover:text-foreground px-2 transition-all">염색약 마스터 관리</button>
      </div>

      {/* 필터 및 데이터 카드 */}
      <div className="bg-card rounded-xl border border-border card-shadow p-6 flex flex-col gap-6">
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
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-background px-3 py-1.5 rounded-lg border border-border">
            <div className="w-2 h-2 rounded-full bg-success" />
            정상
            <div className="w-2 h-2 rounded-full bg-warning ml-2" />
            주의
            <div className="w-2 h-2 rounded-full bg-danger ml-2" />
            소진
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
      </div>

      {/* 안내 섹션 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl bg-primary/5 border border-primary/10 flex gap-4">
          <div className="text-primary mt-1">
            <PlusCircle size={20} weight="fill" />
          </div>
          <div className="text-sm leading-relaxed">
            <strong className="block mb-1 text-foreground">똑똑한 재고 알림</strong>
            시술 시 입력한 레시피 사용량을 기준으로 예상 남은 횟수를 계산합니다. 1.5회 미만으로 남은 경우 자동으로 '주의' 상태로 전환됩니다.
          </div>
        </div>
      </div>
    </div>
  )
}
