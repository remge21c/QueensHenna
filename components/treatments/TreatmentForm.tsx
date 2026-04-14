'use client'

import React, { useState, useEffect, useTransition } from 'react'
import {
  X,
  MagnifyingGlass,
  Plus,
  Trash,
  ClipboardText,
  User,
  CurrencyKrw,
  CheckCircle,
  WarningCircle,
  Faders,
  MagicWand,
  FloppyDisk
} from '@phosphor-icons/react'
import { searchCustomers } from '@/app/customers/actions'
import {
  getTreatmentTypes,
  getDyeTypes,
  getUnits,
  getCustomerDyeStocks,
  registerTreatmentAction,
  getLatestTreatmentUsage,
  saveDefaultRecipe,
  getDefaultRecipe
} from '@/app/treatments/actions'

interface TreatmentFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export default function TreatmentForm({ onSuccess, onCancel }: TreatmentFormProps) {
  const [isPending, startTransition] = useTransition()

  const [treatmentTypes, setTreatmentTypes] = useState<any[]>([])
  const [dyeTypes, setDyeTypes] = useState<any[]>([])
  const [units, setUnits] = useState<any[]>([])

  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
  const [customerSearch, setCustomerSearch] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [customerStocks, setCustomerStocks] = useState<any[]>([])

  const [selectedType, setSelectedType] = useState('')
  const [additionalPrice, setAdditionalPrice] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState('카드')
  const [memo, setMemo] = useState('')
  const [treatedAt, setTreatedAt] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}T${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`
  })

  const [usages, setUsages] = useState<any[]>([
    { dye_id: '', unit_id: '', amount: 0 }
  ])

  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [types, dyes, un] = await Promise.all([
          getTreatmentTypes(),
          getDyeTypes(),
          getUnits()
        ])
        setTreatmentTypes(types)
        setDyeTypes(dyes)
        setUnits(un)
        if (types.length > 0) setSelectedType(types[0].id)
        const gUnit = un.find((u: any) => u.name === 'g')
        if (gUnit) {
          setUsages([{ dye_id: dyes[0]?.id || '', unit_id: gUnit.id, amount: 0 }])
        }
      } catch (err) {
        console.error('Failed to fetch initial data', err)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    if (customerSearch.length >= 2) {
      const delaySearch = setTimeout(async () => {
        const results = await searchCustomers(customerSearch)
        setSearchResults(results)
      }, 300)
      return () => clearTimeout(delaySearch)
    } else {
      setSearchResults([])
    }
  }, [customerSearch])

  const handleCustomerSelect = async (customer: any) => {
    setSelectedCustomer(customer)
    setCustomerSearch('')
    setSearchResults([])
    try {
      const stocks = await getCustomerDyeStocks(customer.id)
      setCustomerStocks(stocks)
      const recipe = await getDefaultRecipe(customer.id)
      if (recipe && recipe.length > 0) {
        setUsages(recipe.map(r => ({
          dye_id: r.dye_id,
          unit_id: r.unit_id,
          amount: Number(r.amount)
        })))
      }
    } catch (err) {
      console.error('Failed to fetch stocks or recipe', err)
    }
  }

  const handleLoadLastRecipe = async () => {
    if (!selectedCustomer) return
    try {
      const lastUsage = await getLatestTreatmentUsage(selectedCustomer.id)
      if (lastUsage && lastUsage.length > 0) {
        setUsages(lastUsage.map(u => ({
          dye_id: u.dye_id,
          unit_id: u.unit_id,
          amount: Number(u.amount)
        })))
      } else {
        alert('이전 시술 기록이 없습니다.')
      }
    } catch (err) {
      alert('레시피를 불러오는 중 오류가 발생했습니다.')
    }
  }

  const handleSaveDefaultRecipe = async () => {
    if (!selectedCustomer) return
    if (usages.some(u => !u.dye_id || !u.unit_id || u.amount <= 0)) {
      alert('정확한 약재와 사용량을 입력해주세요.')
      return
    }
    const result = await saveDefaultRecipe(selectedCustomer.id, usages)
    if (result.success) {
      alert('기본 레시피로 저장되었습니다.')
    } else {
      alert('저장 실패: ' + result.error)
    }
  }

  const handleAddUsage = () => {
    setUsages([...usages, { dye_id: dyeTypes[0]?.id || '', unit_id: units[0]?.id || '', amount: 0 }])
  }

  const handleRemoveUsage = (index: number) => {
    if (usages.length > 1) {
      setUsages(usages.filter((_, i) => i !== index))
    }
  }

  const handleUsageChange = (index: number, field: string, value: any) => {
    const newUsages = [...usages]
    newUsages[index] = { ...newUsages[index], [field]: value }
    setUsages(newUsages)
  }

  const calculateTotalPrice = () => {
    const basePrice = treatmentTypes.find(t => t.id === selectedType)?.base_price || 0
    return basePrice + Number(additionalPrice)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCustomer) {
      setError('고객을 선택해주세요.')
      return
    }
    setError(null)
    startTransition(async () => {
      const result = await registerTreatmentAction(
        selectedCustomer.id,
        selectedType,
        calculateTotalPrice(),
        paymentMethod,
        memo,
        new Date(treatedAt).toISOString(),
        usages.filter(u => u.dye_id && u.amount > 0)
      )
      if (result.success) {
        onSuccess?.()
      } else {
        setError(result.error || '시술 등록에 실패했습니다.')
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-muted w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-xl shadow-2xl flex flex-col border border-border animate-in slide-in-from-bottom-8 duration-500">

        {/* Header */}
        <div className="px-8 py-6 bg-card border-b border-border flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
              <ClipboardText size={28} weight="bold" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">새 시술 기록 등록</h2>
              <p className="text-sm text-muted-foreground">시술 정보를 입력하고 재고를 차감합니다.</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-surface-container rounded-full transition-colors text-outline-variant"
          >
            <X size={24} weight="bold" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          <form id="treatment-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-5 gap-8">

            {/* Left Column */}
            <div className="lg:col-span-3 space-y-6">

              {/* Customer Selection */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-primary flex items-center gap-2">
                  <User size={18} weight="bold" />
                  고객 선택 <span className="text-error">*</span>
                </label>
                {selectedCustomer ? (
                  <div className="flex items-center justify-between p-4 bg-card border-2 border-primary rounded-xl card-shadow">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <User size={20} weight="bold" />
                      </div>
                      <div>
                        <div className="font-bold text-foreground">{selectedCustomer.name}</div>
                        <div className="text-sm text-muted-foreground">{selectedCustomer.phone}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setSelectedCustomer(null); setCustomerStocks([]) }}
                      className="text-xs text-outline-variant hover:text-error font-medium underline px-2 py-1"
                    >
                      변경하기
                    </button>
                  </div>
                ) : (
                  <div className="relative group">
                    <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant group-focus-within:text-primary transition-colors" size={20} />
                    <input
                      type="text"
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      placeholder="이름이나 전화번호로 고객 검색..."
                      className="w-full h-14 pl-12 pr-4 bg-card border border-border rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm card-shadow"
                    />
                    {searchResults.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-xl z-10 max-h-64 overflow-y-auto overflow-hidden animate-in fade-in slide-in-from-top-2">
                        {searchResults.map((customer) => (
                          <button
                            key={customer.id}
                            type="button"
                            onClick={() => handleCustomerSelect(customer)}
                            className="w-full p-4 flex items-center gap-3 hover:bg-muted transition-colors border-b border-border/50 last:border-0"
                          >
                            <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center text-muted-foreground">
                              <User size={20} />
                            </div>
                            <div className="text-left">
                              <div className="font-bold text-foreground">{customer.name}</div>
                              <div className="text-xs text-muted-foreground">{customer.phone}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Treatment Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <label className="text-sm font-bold text-primary">시술 종류 <span className="text-error">*</span></label>
                  <div className="relative">
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="w-full h-12 px-4 bg-card border border-border rounded-xl focus:outline-none focus:border-primary appearance-none"
                    >
                      {treatmentTypes.map(type => (
                        <option key={type.id} value={type.id}>{type.name}</option>
                      ))}
                    </select>
                    <Faders size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-bold text-primary">결제 수단</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full h-12 px-4 bg-card border border-border rounded-xl focus:outline-none focus:border-primary"
                  >
                    <option value="카드">카드</option>
                    <option value="현금">현금</option>
                    <option value="계좌이체">계좌이체</option>
                  </select>
                </div>
              </div>

              {/* 시술 일시 */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-primary">시술 일시</label>
                <input
                  type="datetime-local"
                  value={treatedAt}
                  onChange={(e) => setTreatedAt(e.target.value)}
                  className="w-full h-12 px-4 bg-card border border-border rounded-xl focus:outline-none focus:border-primary text-sm"
                />
              </div>

              {/* Pricing */}
              <div className="p-6 bg-card border border-border rounded-xl space-y-4">
                <div className="flex items-center gap-2 text-primary font-bold text-sm border-b border-border/50 pb-3 mb-4">
                  <CurrencyKrw size={18} weight="bold" />
                  결제 금액 설정
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs text-outline-variant font-medium">기본 금액</label>
                    <div className="text-xl font-bold text-foreground">
                      {(treatmentTypes.find(t => t.id === selectedType)?.base_price || 0).toLocaleString()}
                      <span className="text-xs ml-1 font-normal text-outline-variant">원</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-outline-variant font-medium">추가 금액</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={additionalPrice}
                        onChange={(e) => setAdditionalPrice(Number(e.target.value))}
                        className="w-full h-10 px-3 bg-muted border border-border rounded-lg text-right font-bold focus:outline-none focus:border-primary"
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-outline-variant">+</span>
                    </div>
                  </div>
                </div>
                <div className="pt-4 border-t border-dashed border-border flex justify-between items-center">
                  <span className="text-sm font-bold text-muted-foreground">총 결제 금액</span>
                  <div className="text-2xl font-black text-primary">
                    {calculateTotalPrice().toLocaleString()} <span className="text-base font-bold">원</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-primary">시술 메모</label>
                <textarea
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="색상 혼합 비율이나 두피 상태 등 특이사항을 기록하세요..."
                  className="w-full p-4 bg-card border border-border rounded-xl focus:outline-none focus:border-primary min-h-[100px] text-sm"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-card border border-border rounded-xl p-6 space-y-6 card-shadow">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-foreground flex items-center gap-2">
                    <Faders size={20} weight="bold" className="text-primary" />
                    사용량 입력
                  </h3>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleLoadLastRecipe}
                      disabled={!selectedCustomer}
                      className="text-[10px] font-bold text-primary flex items-center gap-1 px-2 py-1 bg-primary/10 rounded hover:bg-primary/20 transition-all disabled:opacity-50"
                    >
                      <MagicWand size={14} weight="fill" />
                      이전 기록
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveDefaultRecipe}
                      disabled={!selectedCustomer}
                      className="text-[10px] font-bold text-tertiary flex items-center gap-1 px-2 py-1 bg-tertiary/10 rounded hover:bg-tertiary/20 transition-all disabled:opacity-50"
                    >
                      <FloppyDisk size={14} weight="fill" />
                      레시피 저장
                    </button>
                  </div>
                </div>

                {selectedCustomer && (
                  <div className="p-4 bg-muted border border-dashed border-primary/30 rounded-xl">
                    <div className="text-[13px] font-bold text-primary mb-2">{selectedCustomer.name} 님의 현재 보유량</div>
                    <div className="space-y-1">
                      {customerStocks.length > 0 ? customerStocks.map(stock => (
                        <div key={stock.id} className="flex justify-between text-xs">
                          <span className="text-muted-foreground">{stock.dye?.name}</span>
                          <span className={`font-bold ${stock.current_amount < 50 ? 'text-warning' : 'text-foreground'}`}>
                            {stock.current_amount}{stock.unit?.name}
                          </span>
                        </div>
                      )) : (
                        <div className="text-xs text-outline-variant">보유 중인 염색약이 없습니다.</div>
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  {usages.map((usage, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <select
                        value={usage.dye_id}
                        onChange={(e) => handleUsageChange(index, 'dye_id', e.target.value)}
                        className="flex-1 min-w-0 h-10 px-2 bg-muted border border-border rounded-lg text-xs focus:outline-none focus:border-primary"
                      >
                        <option value="">염색약 선택</option>
                        {dyeTypes.map(d => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        value={usage.amount}
                        onChange={(e) => handleUsageChange(index, 'amount', Number(e.target.value))}
                        className="w-16 h-10 px-2 bg-muted border border-border rounded-lg text-xs text-right focus:outline-none focus:border-primary"
                      />
                      <select
                        value={usage.unit_id}
                        onChange={(e) => handleUsageChange(index, 'unit_id', e.target.value)}
                        className="w-16 h-10 px-1 bg-muted border border-border rounded-lg text-xs focus:outline-none focus:border-primary"
                      >
                        {units.map(u => (
                          <option key={u.id} value={u.id}>{u.name}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => handleRemoveUsage(index)}
                        className="p-1 text-outline-variant hover:text-error transition-colors shrink-0"
                      >
                        <Trash size={18} />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleAddUsage}
                  className="w-full h-10 border border-dashed border-border rounded-lg flex items-center justify-center gap-2 text-xs text-muted-foreground hover:bg-muted hover:border-primary transition-all"
                >
                  <Plus size={16} weight="bold" />
                  약재 추가하기
                </button>

                <div className="pt-6">
                  {error && (
                    <div className="mb-4 flex items-center gap-2 p-3 bg-error-container/20 border border-error-container/30 rounded-xl text-error text-xs">
                      <WarningCircle weight="fill" size={16} />
                      {error}
                    </div>
                  )}
                  <button
                    type="submit"
                    form="treatment-form"
                    disabled={isPending}
                    className="w-full h-14 bg-primary text-primary-foreground rounded-xl font-bold shadow-xl shadow-primary/20 hover:bg-primary-dim active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:bg-outline-variant"
                  >
                    {isPending ? (
                      <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    ) : (
                      <>
                        <CheckCircle size={20} weight="bold" />
                        시술 등록 완료하기
                      </>
                    )}
                  </button>
                  <p className="text-center text-[11px] text-outline-variant mt-3">
                    저장 시 고객님의 염색약 잔여량이 자동 차감됩니다.
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
