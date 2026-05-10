'use client'

import React, { useState, useEffect } from 'react'
import {
  Gear,
  Tag,
  ChatCircleText,
  Database,
  CloudArrowDown,
  CloudArrowUp,
  Warning,
  CheckCircle,
  SignOut,
} from '@phosphor-icons/react'
import {
  getBackupData,
  restoreData,
  getTreatmentTypes,
  updateTreatmentType,
  createTreatmentType,
  deleteTreatmentType,
} from './actions'
import { signOut } from '@/app/(auth)/actions'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('backup')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  const [treatmentTypes, setTreatmentTypes] = useState<any[]>([])
  const [editingType, setEditingType] = useState<any>(null)
  const [newTypeName, setNewTypeName] = useState('')
  const [newTypePrice, setNewTypePrice] = useState(0)

  useEffect(() => {
    if (activeTab === 'pricing') loadPricingData()
  }, [activeTab])

  const loadPricingData = async () => {
    setLoading(true)
    try {
      const data = await getTreatmentTypes()
      setTreatmentTypes(data)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateType = async () => {
    if (!newTypeName) return
    setLoading(true)
    setStatus(null)
    const res = await createTreatmentType(newTypeName, newTypePrice)
    if (res.success) {
      setNewTypeName('')
      setNewTypePrice(0)
      await loadPricingData()
      setStatus({ type: 'success', message: '시술 항목이 추가되었습니다.' })
    } else {
      console.error('createTreatmentType error:', res.error)
      setStatus({ type: 'error', message: `저장 실패: ${res.error}` })
    }
    setLoading(false)
  }

  const handleUpdateType = async () => {
    if (!editingType) return
    setLoading(true)
    setStatus(null)
    const res = await updateTreatmentType(editingType.id, editingType.name, editingType.base_price)
    if (res.success) {
      setEditingType(null)
      await loadPricingData()
      setStatus({ type: 'success', message: '수정되었습니다.' })
    } else {
      console.error('updateTreatmentType error:', res.error)
      setStatus({ type: 'error', message: `저장 실패: ${res.error}` })
    }
    setLoading(false)
  }

  const handleBackup = async () => {
    setLoading(true)
    setStatus(null)
    try {
      const data = await getBackupData()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `queens-henna-backup-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
      setStatus({ type: 'success', message: '데이터 백업이 완료되었습니다.' })
    } catch (err) {
      setStatus({ type: 'error', message: '백업 중 오류가 발생했습니다.' })
    }
    setLoading(false)
  }

  const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!confirm('기존 데이터와 충돌이 발생할 수 있습니다. 계속하시겠습니까?')) {
      e.target.value = ''
      return
    }

    setLoading(true)
    setStatus(null)
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      const result = await restoreData(data)

      if (result.success) {
        setStatus({ type: 'success', message: '데이터 복원이 완료되었습니다.' })
      } else {
        setStatus({ type: 'error', message: result.error || '복원 실패' })
      }
    } catch (err) {
      setStatus({ type: 'error', message: '파일 형식이 올바르지 않거나 복원에 실패했습니다.' })
    }
    setLoading(false)
    e.target.value = ''
  }

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 md:sticky md:top-0 md:z-20 md:bg-background md:-mx-8 md:px-8 md:pt-8 md:-mt-8">
        <div>
          <h1 className="text-xl md:text-3xl font-black text-foreground tracking-tight">환경 설정</h1>
          <p className="text-muted-foreground mt-1">시스템 운영에 필요한 데이터와 환경을 관리합니다.</p>
        </div>
        <button
          onClick={async () => { await signOut() }}
          className="flex items-center gap-2 px-6 py-3 bg-error-container/20 text-error rounded-xl font-bold hover:bg-error-container/40 transition-all active:scale-95"
        >
          <SignOut weight="bold" size={20} />
          <span>로그아웃</span>
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-border mb-8 overflow-x-auto">
        {[
          { id: 'system', name: '시스템 설정', icon: Gear },
          { id: 'pricing', name: '시술 단가 마스터', icon: Tag },
          { id: 'sms', name: '문자 템플릿', icon: ChatCircleText },
          { id: 'backup', name: '데이터 백업/복원', icon: Database },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex items-center gap-2 px-5 py-3 font-bold transition-all text-sm whitespace-nowrap border-b-2 -mb-px ${
              activeTab === item.id
                ? 'text-primary border-primary'
                : 'text-outline-variant border-transparent hover:text-primary hover:border-primary/30'
            }`}
          >
            <item.icon size={18} weight={activeTab === item.id ? 'fill' : 'bold'} />
            {item.name}
          </button>
        ))}
      </div>

      {/* Panel */}
      <div className="bg-card rounded-xl border border-border p-4 md:p-10 card-shadow min-h-[500px]">
          {activeTab === 'backup' && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
              <div className="border-b border-border/50 pb-6">
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <Database size={24} weight="fill" className="text-primary" />
                  데이터 백업 및 복원
                </h2>
              </div>

              {status && (
                <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${
                  status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-error-container/20 text-error border border-error-container/30'
                }`}>
                  {status.type === 'success' ? <CheckCircle weight="fill" size={20} /> : <Warning weight="fill" size={20} />}
                  {status.message}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                {/* Backup Card */}
                <div className="p-8 rounded-xl bg-muted border border-border flex flex-col justify-between hover:border-primary/30 transition-all group">
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-card flex items-center justify-center text-primary mb-4 card-shadow group-hover:scale-110 transition-transform">
                      <CloudArrowDown size={24} weight="bold" />
                    </div>
                    <h3 className="font-bold text-foreground text-lg mb-2">시스템 수동 백업</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      현재까지의 모든 고객 정보, 시술 기록, 재고 데이터를 JSON 파일로 내보냅니다.
                    </p>
                  </div>
                  <button
                    onClick={handleBackup}
                    disabled={loading}
                    className="mt-8 h-14 bg-card border-2 border-primary text-primary rounded-xl font-black hover:bg-primary hover:text-primary-foreground transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /> : '지금 백업하기'}
                  </button>
                </div>

                {/* Restore Card */}
                <div className="p-8 rounded-xl bg-card border border-border flex flex-col justify-between hover:border-error/30 transition-all group card-shadow">
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-error mb-4 group-hover:scale-110 transition-transform">
                      <CloudArrowUp size={24} weight="bold" />
                    </div>
                    <h3 className="font-bold text-foreground text-lg mb-2">데이터 복원</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      이전에 백업한 JSON 파일을 사용하여 전체 데이터를 복원합니다. <span className="text-error font-bold">기존 데이터가 덮어씌워질 수 있습니다.</span>
                    </p>
                  </div>
                  <div className="mt-8">
                    <label className="h-14 bg-error text-error-foreground rounded-xl font-black hover:bg-error/90 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-error/20">
                      <CloudArrowUp size={24} weight="bold" />
                      복원 파일 선택
                      <input
                        type="file"
                        accept=".json"
                        className="hidden"
                        onChange={handleRestore}
                        disabled={loading}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Warning Box */}
              <div className="p-6 bg-error-container/10 border border-error-container/30 rounded-xl flex gap-4">
                <div className="text-error pt-1">
                  <Warning size={24} weight="fill" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-error">주의사항</h4>
                  <p className="text-xs text-error/80 mt-1 leading-relaxed">
                    복원 기능을 실행하면 현재 DB의 내용과 백업 파일의 내용이 합쳐지거나 중복될 수 있습니다.
                    가급적이면 DB가 비어있거나 동일한 ID를 가진 레코드를 업데이트할 때만 사용하세요.
                    백업 파일은 안전한 곳(이메일, 외장 하드 등)에 별도로 보관하는 것이 좋습니다.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pricing' && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
              <div className="border-b border-border/50 pb-6 flex justify-between items-center">
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <Tag size={24} weight="fill" className="text-primary" />
                  시술 단가 마스터 관리
                </h2>
              </div>

              {status && (
                <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${
                  status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-error-container/20 text-error border border-error-container/30'
                }`}>
                  {status.type === 'success' ? <CheckCircle weight="fill" size={20} /> : <Warning weight="fill" size={20} />}
                  {status.message}
                </div>
              )}

              {/* Add New Type */}
              <div className="p-6 bg-muted rounded-xl border border-border grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="space-y-2">
                  <label className="text-xs font-black text-outline-variant uppercase tracking-widest ml-1">시술명</label>
                  <input
                    type="text"
                    value={newTypeName}
                    onChange={(e) => setNewTypeName(e.target.value)}
                    placeholder="예: 클리닉 추가"
                    className="w-full h-12 px-4 rounded-xl border-2 border-card focus:border-primary transition-all outline-none text-sm font-bold card-shadow"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-outline-variant uppercase tracking-widest ml-1">기본 단가 (원)</label>
                  <input
                    type="number"
                    value={newTypePrice}
                    onChange={(e) => setNewTypePrice(Number(e.target.value))}
                    className="w-full h-12 px-4 rounded-xl border-2 border-card focus:border-primary transition-all outline-none text-sm font-bold card-shadow"
                  />
                </div>
                <button
                  onClick={handleCreateType}
                  disabled={loading || !newTypeName}
                  className="h-12 bg-primary text-primary-foreground rounded-xl font-black hover:bg-primary-dim transition-all disabled:opacity-50"
                >
                  새 시술 추가
                </button>
              </div>

              {/* List */}
              <div className="overflow-x-auto border border-border rounded-xl">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted text-outline-variant font-black uppercase tracking-tighter border-b border-border">
                      <th className="px-6 py-4 text-left">시술 항목</th>
                      <th className="px-6 py-4 text-right">기본 단가</th>
                      <th className="px-6 py-4 text-center">관리</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {treatmentTypes.map((type) => (
                      <tr key={type.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4 font-bold text-foreground">
                          {editingType?.id === type.id ? (
                            <input
                              type="text"
                              value={editingType.name}
                              onChange={(e) => setEditingType({ ...editingType, name: e.target.value })}
                              className="w-full px-2 py-1 border border-primary rounded"
                            />
                          ) : type.name}
                        </td>
                        <td className="px-6 py-4 text-right font-black text-primary">
                          {editingType?.id === type.id ? (
                            <input
                              type="number"
                              value={editingType.base_price}
                              onChange={(e) => setEditingType({ ...editingType, base_price: Number(e.target.value) })}
                              className="w-24 px-2 py-1 border border-primary rounded text-right"
                            />
                          ) : `${(type.base_price ?? 0).toLocaleString()}원`}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center gap-2">
                            {editingType?.id === type.id ? (
                              <>
                                <button onClick={handleUpdateType} className="text-green-600 font-bold hover:underline">저장</button>
                                <button onClick={() => setEditingType(null)} className="text-outline-variant font-bold hover:underline">취소</button>
                              </>
                            ) : (
                              <>
                                <button onClick={() => setEditingType(type)} className="text-primary font-bold hover:underline">수정</button>
                                <button
                                  onClick={async () => {
                                    if (confirm('정말 삭제하시겠습니까?')) {
                                      await deleteTreatmentType(type.id)
                                      await loadPricingData()
                                    }
                                  }}
                                  className="text-error font-bold hover:underline"
                                >
                                  삭제
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab !== 'backup' && activeTab !== 'pricing' && (
            <div className="h-full flex flex-col items-center justify-center text-outline-variant opacity-50 space-y-4">
              <Gear size={64} weight="light" />
              <p className="font-bold">이 메뉴는 준비 중입니다.</p>
            </div>
          )}
        </div>
    </div>
  )
}
