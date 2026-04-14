"use client"

import React, { useState, useEffect } from "react"
import { Drop, PencilSimple, Trash, PlusCircle, CheckCircle, X } from "@phosphor-icons/react"
import { getDyeTypes, getUnits, createDyeType, updateDyeType, deleteDyeType } from "@/app/inventory/actions"

interface DyeType {
  id: string
  name: string
  total_capacity: number
  default_unit_id: string | null
  memo: string | null
  is_active: boolean
  units?: { name: string } | null
}

interface Unit {
  id: string
  name: string
}

const EMPTY_FORM = { name: "", total_capacity: 0, default_unit_id: "", memo: "" }

export default function DyeMasterPanel() {
  const [dyeTypes, setDyeTypes] = useState<DyeType[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [newForm, setNewForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState(EMPTY_FORM)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    try {
      const [dt, u] = await Promise.all([getDyeTypes(), getUnits()])
      setDyeTypes(dt as unknown as DyeType[])
      setUnits(u)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate() {
    if (!newForm.name) return
    setSaving(true)
    const res = await createDyeType(newForm)
    if (res.success) {
      setNewForm(EMPTY_FORM)
      await load()
    }
    setSaving(false)
  }

  async function handleUpdate() {
    if (!editingId) return
    setSaving(true)
    const res = await updateDyeType(editingId, editForm)
    if (res.success) {
      setEditingId(null)
      await load()
    }
    setSaving(false)
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`'${name}' 염색약을 삭제하시겠습니까?\n이 염색약이 사용된 재고 기록에 영향을 줄 수 있습니다.`)) return
    setSaving(true)
    await deleteDyeType(id)
    await load()
    setSaving(false)
  }

  function startEdit(dye: DyeType) {
    setEditingId(dye.id)
    setEditForm({
      name: dye.name,
      total_capacity: dye.total_capacity,
      default_unit_id: dye.default_unit_id || "",
      memo: dye.memo || "",
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground text-sm">
        <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin mr-3" />
        불러오는 중...
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      {/* 새 염색약 추가 폼 */}
      <div className="p-6 bg-primary/5 rounded-xl border border-primary/10">
        <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
          <PlusCircle size={18} weight="fill" className="text-primary" />
          새 염색약 종류 추가
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">염색약명 *</label>
            <input
              type="text"
              value={newForm.name}
              onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
              placeholder="예: 헤나 브라운"
              className="h-11 px-4 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm transition-all"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">전체 용량 *</label>
            <input
              type="number"
              value={newForm.total_capacity || ""}
              onChange={(e) => setNewForm({ ...newForm, total_capacity: Number(e.target.value) })}
              placeholder="예: 500"
              className="h-11 px-4 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm transition-all"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">기본 단위</label>
            <select
              value={newForm.default_unit_id}
              onChange={(e) => setNewForm({ ...newForm, default_unit_id: e.target.value })}
              className="h-11 px-4 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm appearance-none transition-all"
            >
              <option value="">단위 선택</option>
              {units.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">메모</label>
            <input
              type="text"
              value={newForm.memo}
              onChange={(e) => setNewForm({ ...newForm, memo: e.target.value })}
              placeholder="선택 사항"
              className="h-11 px-4 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm transition-all"
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleCreate}
            disabled={saving || !newForm.name || !newForm.total_capacity}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <CheckCircle size={18} weight="fill" />
            )}
            추가 완료
          </button>
        </div>
      </div>

      {/* 염색약 목록 */}
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-muted text-muted-foreground text-xs font-bold uppercase tracking-wider border-b border-border">
              <th className="px-6 py-4 text-left">염색약명</th>
              <th className="px-6 py-4 text-right">전체 용량</th>
              <th className="px-6 py-4 text-center">기본 단위</th>
              <th className="px-6 py-4 text-left">메모</th>
              <th className="px-6 py-4 text-center">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {dyeTypes.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-16 text-muted-foreground">
                  <Drop size={32} weight="thin" className="mx-auto mb-3 opacity-40" />
                  등록된 염색약이 없습니다.
                </td>
              </tr>
            ) : (
              dyeTypes.map((dye) => (
                <tr key={dye.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 font-bold text-foreground">
                    {editingId === dye.id ? (
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full px-3 py-1.5 border border-primary rounded-lg text-sm outline-none"
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary/50" />
                        {dye.name}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-primary">
                    {editingId === dye.id ? (
                      <input
                        type="number"
                        value={editForm.total_capacity || ""}
                        onChange={(e) => setEditForm({ ...editForm, total_capacity: Number(e.target.value) })}
                        className="w-28 px-3 py-1.5 border border-primary rounded-lg text-sm text-right outline-none"
                      />
                    ) : (
                      `${dye.total_capacity.toLocaleString()}`
                    )}
                  </td>
                  <td className="px-6 py-4 text-center text-muted-foreground">
                    {editingId === dye.id ? (
                      <select
                        value={editForm.default_unit_id}
                        onChange={(e) => setEditForm({ ...editForm, default_unit_id: e.target.value })}
                        className="px-3 py-1.5 border border-primary rounded-lg text-sm outline-none appearance-none"
                      >
                        <option value="">-</option>
                        {units.map((u) => (
                          <option key={u.id} value={u.id}>{u.name}</option>
                        ))}
                      </select>
                    ) : (
                      dye.units?.name || "-"
                    )}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground max-w-[200px] truncate">
                    {editingId === dye.id ? (
                      <input
                        type="text"
                        value={editForm.memo}
                        onChange={(e) => setEditForm({ ...editForm, memo: e.target.value })}
                        className="w-full px-3 py-1.5 border border-primary rounded-lg text-sm outline-none"
                        placeholder="메모"
                      />
                    ) : (
                      dye.memo || "-"
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      {editingId === dye.id ? (
                        <>
                          <button
                            onClick={handleUpdate}
                            disabled={saving}
                            className="flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-bold hover:bg-primary/90 transition-all disabled:opacity-50"
                          >
                            <CheckCircle size={14} weight="fill" />
                            저장
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-muted border border-border rounded-lg text-xs font-bold text-muted-foreground hover:text-foreground transition-all"
                          >
                            <X size={14} weight="bold" />
                            취소
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEdit(dye)}
                            className="flex items-center gap-1 px-3 py-1.5 text-primary border border-primary/20 rounded-lg text-xs font-bold hover:bg-primary/5 transition-all"
                          >
                            <PencilSimple size={14} weight="bold" />
                            수정
                          </button>
                          <button
                            onClick={() => handleDelete(dye.id, dye.name)}
                            disabled={saving}
                            className="flex items-center gap-1 px-3 py-1.5 text-destructive border border-destructive/20 rounded-lg text-xs font-bold hover:bg-destructive/5 transition-all disabled:opacity-50"
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
