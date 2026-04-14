"use client"

import React, { useState, useEffect } from "react"
import { Plus, Trash, FloppyDisk, Drop, CheckCircle, Warning, Pencil } from "@phosphor-icons/react"
import {
  getDyeTypes,
  getUnits,
  getDefaultRecipe,
  saveDefaultRecipe,
} from "@/app/treatments/actions"

interface RecipeRow {
  dye_id: string
  unit_id: string
  amount: number
}

interface DyeType { id: string; name: string }
interface Unit { id: string; name: string }

export default function CustomerRecipePanel({ customerId }: { customerId: string }) {
  const [rows, setRows] = useState<RecipeRow[]>([])
  const [dyeTypes, setDyeTypes] = useState<DyeType[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null)

  useEffect(() => {
    load()
  }, [customerId])

  async function load() {
    setLoading(true)
    try {
      const [dt, u, recipe] = await Promise.all([
        getDyeTypes(),
        getUnits(),
        getDefaultRecipe(customerId),
      ])
      setDyeTypes(dt)
      setUnits(u)
      setRows(
        recipe.length > 0
          ? recipe.map((r: any) => ({
              dye_id: r.dye_id,
              unit_id: r.unit_id,
              amount: Number(r.amount),
            }))
          : []
      )
    } finally {
      setLoading(false)
    }
  }

  function addRow() {
    setRows((prev) => [
      ...prev,
      { dye_id: dyeTypes[0]?.id || "", unit_id: units[0]?.id || "", amount: 0 },
    ])
  }

  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index))
  }

  function updateRow(index: number, field: keyof RecipeRow, value: string | number) {
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    )
  }

  async function handleSave() {
    setSaving(true)
    setStatus(null)
    const res = await saveDefaultRecipe(customerId, rows)
    if (res.success) {
      setStatus({ type: "success", message: "기본 레시피가 저장되었습니다." })
    } else {
      setStatus({ type: "error", message: `저장 실패: ${res.error}` })
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10 text-muted-foreground text-sm">
        <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin mr-2" />
        불러오는 중...
      </div>
    )
  }

  const hasUnconfirmed = rows.some((r) => r.amount === 0)

  return (
    <div className="flex flex-col gap-4">
      {/* 미확정 안내 배너 */}
      {hasUnconfirmed && !status && (
        <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-warning/10 border border-warning/20 text-sm text-warning-foreground">
          <Pencil size={15} weight="bold" className="mt-0.5 shrink-0 text-warning" />
          <span className="text-xs text-foreground/80">
            수량이 <span className="font-bold">0</span>인 항목이 있습니다. 실제 사용량을 입력하고 저장해 레시피를 확정하세요.
          </span>
        </div>
      )}

      {/* 상태 메시지 */}
      {status && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${
          status.type === "success"
            ? "bg-green-50 text-green-700 border border-green-100"
            : "bg-red-50 text-red-700 border border-red-100"
        }`}>
          {status.type === "success"
            ? <CheckCircle size={16} weight="fill" />
            : <Warning size={16} weight="fill" />}
          {status.message}
        </div>
      )}

      {/* 레시피 행 목록 */}
      <div className="flex flex-col gap-2">
        {rows.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground border border-dashed border-border rounded-xl text-sm">
            <Drop size={24} weight="light" className="mx-auto mb-2 opacity-40" />
            등록된 기본 레시피가 없습니다.
          </div>
        ) : (
          rows.map((row, index) => (
            <div key={index} className={`grid grid-cols-[1fr_100px_80px_36px] gap-2 items-center rounded-lg px-1 py-0.5 ${
              row.amount === 0 ? "bg-warning/5 border border-warning/15" : ""
            }`}>
              {/* 염색약 선택 */}
              <select
                value={row.dye_id}
                onChange={(e) => updateRow(index, "dye_id", e.target.value)}
                className="h-10 px-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm appearance-none transition-all"
              >
                <option value="">염색약 선택</option>
                {dyeTypes.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>

              {/* 사용량 */}
              <input
                type="number"
                value={row.amount || ""}
                onChange={(e) => updateRow(index, "amount", Number(e.target.value))}
                placeholder="사용량 입력"
                min={0}
                step="any"
                className={`h-10 px-3 bg-background border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm transition-all ${
                  row.amount === 0 ? "border-warning/40 placeholder:text-warning/60" : "border-border"
                }`}
              />

              {/* 단위 선택 */}
              <select
                value={row.unit_id}
                onChange={(e) => updateRow(index, "unit_id", e.target.value)}
                className="h-10 px-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm appearance-none transition-all"
              >
                <option value="">단위</option>
                {units.map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>

              {/* 삭제 버튼 */}
              <button
                onClick={() => removeRow(index)}
                className="h-10 w-10 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-destructive hover:border-destructive/30 hover:bg-destructive/5 transition-all"
              >
                <Trash size={16} weight="bold" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* 하단 버튼 */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={addRow}
          disabled={dyeTypes.length === 0}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-dashed border-primary/40 text-primary text-sm font-medium hover:bg-primary/5 transition-all disabled:opacity-40"
        >
          <Plus size={16} weight="bold" />
          염색약 추가
        </button>

        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary ml-auto"
        >
          {saving ? (
            <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
          ) : (
            <FloppyDisk size={16} weight="fill" />
          )}
          저장
        </button>
      </div>
    </div>
  )
}
