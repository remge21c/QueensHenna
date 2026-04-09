"use client"

import React, { useState } from "react"
import { Drop } from "@phosphor-icons/react"
import { useRouter } from "next/navigation"
import Sheet from "@/components/ui/Sheet"
import DyePurchaseForm from "@/components/inventory/DyePurchaseForm"
import { upsertDyeStocksFromSheet } from "@/app/inventory/actions"

interface DyeStockRegisterSheetProps {
  customerId: string
  customers: any[]
  dyeTypes: any[]
  units: any[]
  existingStocks: { dye_id: string; current_amount: number; unit_id: string }[]
}

export default function DyeStockRegisterSheet({
  customerId,
  customers,
  dyeTypes,
  units,
  existingStocks,
}: DyeStockRegisterSheetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const handleSubmit = async (data: {
    customer_id: string
    entries: { dye_id: string; unit_id: string; amount: number }[]
    memo: string
    mode: "add" | "set"
  }) => {
    await upsertDyeStocksFromSheet(data)
    setIsOpen(false)
    router.refresh()
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="btn-primary"
      >
        <Drop size={18} weight="fill" />
        염색약 재고 등록
      </button>

      <Sheet isOpen={isOpen} onClose={() => setIsOpen(false)} title="염색약 구매/보충 등록">
        <DyePurchaseForm
          customers={customers}
          dyeTypes={dyeTypes}
          units={units}
          defaultCustomerId={customerId}
          existingStocks={existingStocks}
          onSubmit={handleSubmit}
        />
      </Sheet>
    </>
  )
}
