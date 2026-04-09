"use client"

import React, { useState, useEffect } from "react"
import { Scales, CheckCircle, Warning, PencilSimple, Trash, X } from "@phosphor-icons/react"
import { getUnits, createUnit, updateUnit, deleteUnit } from "@/app/inventory/actions"

export default function DyeUnitPanel() {
  const [units, setUnits] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [editingUnitId, setEditingUnitId] = useState<string | null>(null)
  const [editingUnitName, setEditingUnitName] = useState("")
  const [newUnitName, setNewUnitName] = useState("")

  useEffect(() => {
    loadUnits()
  }, [])

  const loadUnits = async () => {
    setLoading(true)
    try {
      const data = await getUnits()
      setUnits(data)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUnit = async () => {
    if (!newUnitName.trim()) return
    setLoading(true)
    setStatus(null)
    const res = await createUnit(newUnitName.trim())
    if (res.success) {
      setNewUnitName("")
      await loadUnits()
      setStatus({ type: "success", message: `'${newUnitName}' 단위가 추가되었습니다.` })
    } else {
      setStatus({ type: "error", message: `저장 실패: ${res.error}` })
    }
    setLoading(false)
  }

  const handleUpdateUnit = async () => {
    if (!editingUnitId || !editingUnitName.trim()) return
    setLoading(true)
    setStatus(null)
    const res = await updateUnit(editingUnitId, editingUnitName.trim())
    if (res.success) {
      setEditingUnitId(null)
      await loadUnits()
      setStatus({ type: "success", message: "수정되었습니다." })
    } else {
      setStatus({ type: "error", message: `저장 실패: ${res.error}` })
    }
    setLoading(false)
  }

  const handleDeleteUnit = async (id: string, name: string) => {
    if (!confirm(`'${name}' 단위를 삭제하시겠습니까?\n이 단위가 사용된 레시피/재고에 영향을 줄 수 있습니다.`)) return
    setLoading(true)
    setStatus(null)
    const res = await deleteUnit(id)
    if (res.success) {
      setStatus({ type: "success", message: `'${name}' 단위가 삭제되었습니다.` })
    } else {
      setStatus({ type: "error", message: `삭제 실패: ${res.error}` })
    }
    await loadUnits()
    setLoading(false)
  }

  return (
    <div className="space-y-8">
      <div className="border-b border-border/50 pb-6">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Scales size={24} weight="fill" className="text-primary" />
          염색약 단위 관리
        </h2>
        <p className="text-sm text-muted-foreground mt-1">염색약 용량 측정에 사용할 단위를 관리합니다. (예: g, ml)</p>
      </div>

      {status && (
        <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${
          status.type === "success"
            ? "bg-green-50 text-green-700 border border-green-100"
            : "bg-error-container/20 text-error border border-error-container/30"
        }`}>
          {status.type === "success" ? <CheckCircle weight="fill" size={20} /> : <Warning weight="fill" size={20} />}
          {status.message}
        </div>
      )}

      {/* 새 단위 추가 */}
      <div className="p-6 bg-primary/5 rounded-xl border border-primary/10">
        <h3 className="text-sm font-bold text-foreground mb-4">새 단위 추가</h3>
        <div className="flex gap-3 items-end max-w-sm">
          <div className="flex flex-col gap-1.5 flex-1">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">단위명</label>
            <input
              type="text"
              value={newUnitName}
              onChange={(e) => setNewUnitName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateUnit()}
              placeholder="예: g, ml, cc"
              className="h-11 px-4 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm transition-all"
            />
          </div>
          <button
            onClick={handleCreateUnit}
            disabled={loading || !newUnitName.trim()}
            className="h-11 px-6 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:bg-primary/90 transition-all disabled:opacity-50"
          >
            추가
          </button>
        </div>
      </div>

      {/* 단위 목록 */}
      <div className="overflow-x-auto border border-border rounded-xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted text-muted-foreground font-bold uppercase tracking-wider text-xs border-b border-border">
              <th className="px-6 py-4 text-left">단위명</th>
              <th className="px-6 py-4 text-center">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {units.length === 0 ? (
              <tr>
                <td colSpan={2} className="text-center py-12 text-muted-foreground">
                  등록된 단위가 없습니다.
                </td>
              </tr>
            ) : (
              units.map((unit) => (
                <tr key={unit.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 font-bold text-foreground">
                    {editingUnitId === unit.id ? (
                      <input
                        type="text"
                        value={editingUnitName}
                        onChange={(e) => setEditingUnitName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleUpdateUnit()}
                        className="w-32 px-3 py-1.5 border border-primary rounded-lg text-sm outline-none"
                        autoFocus
                      />
                    ) : (
                      unit.name
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      {editingUnitId === unit.id ? (
                        <>
                          <button
                            onClick={handleUpdateUnit}
                            disabled={loading}
                            className="flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-bold hover:bg-primary/90 transition-all disabled:opacity-50"
                          >
                            <CheckCircle size={14} weight="fill" />
                            저장
                          </button>
                          <button
                            onClick={() => setEditingUnitId(null)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-muted border border-border rounded-lg text-xs font-bold text-muted-foreground hover:text-foreground transition-all"
                          >
                            <X size={14} weight="bold" />
                            취소
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => { setEditingUnitId(unit.id); setEditingUnitName(unit.name) }}
                            className="flex items-center gap-1 px-3 py-1.5 text-primary border border-primary/20 rounded-lg text-xs font-bold hover:bg-primary/5 transition-all"
                          >
                            <PencilSimple size={14} weight="bold" />
                            수정
                          </button>
                          <button
                            onClick={() => handleDeleteUnit(unit.id, unit.name)}
                            disabled={loading}
                            className="flex items-center gap-1 px-3 py-1.5 text-danger border border-danger/20 rounded-lg text-xs font-bold hover:bg-danger/5 transition-all disabled:opacity-50"
                          >
                            <Trash size={14} weight="bold" />
                            삭제
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
