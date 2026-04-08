import React from "react"
import { createClient } from "@/lib/supabase/server"
import DyePurchaseForm from "@/components/inventory/DyePurchaseForm"
import { createDyePurchase } from "@/app/inventory/actions"
import Link from "next/link"
import { CaretLeft, PlusCircle } from "@phosphor-icons/react/dist/ssr"

export default async function RegisterPurchasePage() {
  const supabase = await createClient()

  const { data: customers } = await supabase.from("customers").select("id, name, phone").order("name")
  const { data: dyeTypes } = await supabase.from("dye_types").select("*").order("name")
  const { data: units } = await supabase.from("units").select("*").order("name")

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500 pb-12">
      {/* 헤더 */}
      <header className="flex flex-col gap-4">
        <Link 
          href="/inventory" 
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors w-fit"
        >
          <CaretLeft size={16} weight="bold" />
          염색약 관리 목록으로 돌아가기
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-sm">
            <PlusCircle size={28} weight="fill" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">염색약 구매/보충 등록</h1>
            <p className="text-sm text-muted-foreground">고객이 구매하거나 보충한 염색약 내역을 시스템에 기록합니다.</p>
          </div>
        </div>
      </header>

      {/* 메인 폼 카드 */}
      <div className="bg-card rounded-xl border border-border card-shadow p-8 max-w-3xl">
        <DyePurchaseForm 
          customers={customers || []} 
          dyeTypes={dyeTypes || []}
          units={units || []}
          onSubmit={createDyePurchase}
        />
      </div>

      {/* 안내 섹션 */}
      <div className="flex flex-col gap-6 max-w-xl text-sm text-muted-foreground leading-relaxed">
        <div className="p-6 rounded-xl bg-primary/5 border border-primary/10 flex gap-4">
          <div className="text-primary mt-0.5">
            <PlusCircle size={20} weight="fill" />
          </div>
          <div>
            <strong className="text-foreground block mb-1">재량 합산 안내</strong>
            기존에 동일한 염색약을 보유하고 있는 고객이라면, 이번에 등록한 구매 수량이 기존 잔량에 자동으로 합산됩니다. 
            등록 완료 시 해당 고객의 상세 페이지에서도 현황 확인이 가능합니다.
          </div>
        </div>
      </div>
    </div>
  )
}
