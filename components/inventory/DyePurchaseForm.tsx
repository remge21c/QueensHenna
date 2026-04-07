"use client"

import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Drop, User, PlusCircle, CheckCircle } from "@phosphor-icons/react"
import { Badge } from "@/components/ui/Badge"

const formSchema = z.object({
  customer_id: z.string().min(1, "고객을 선택해주세요."),
  dye_id: z.string().min(1, "염색약 종류를 선택해주세요."),
  unit_id: z.string().min(1, "단위를 선택해주세요."),
  amount: z.coerce.number().min(0.1, "최소 0.1 이상의 수량을 입력해주세요."),
  memo: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface DyePurchaseFormProps {
  customers: any[]
  dyeTypes: any[]
  units: any[]
  onSubmit?: (data: FormValues) => void
}

export default function DyePurchaseForm({ 
  customers, 
  dyeTypes, 
  units,
  onSubmit 
}: DyePurchaseFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customer_id: "",
      dye_id: "",
      unit_id: units[0]?.id || "",
      amount: 0,
      memo: "",
    },
  })

  const onFormSubmit = (data: any) => {
    if (onSubmit) {
      onSubmit(data as FormValues)
    }
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit as any)} className="flex flex-col gap-8 max-w-2xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* 고객 선택 */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-foreground flex items-center gap-2">
            <User size={18} className="text-primary" />
            고객 선택 <span className="text-danger">*</span>
          </label>
          <select 
            {...register("customer_id")}
            className="w-full h-11 px-4 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm appearance-none"
          >
            <option value="">고객을 선택하세요</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
            ))}
          </select>
          {errors.customer_id && (
            <p className="text-xs text-danger font-medium mt-1">{errors.customer_id.message}</p>
          )}
        </div>

        {/* 염색약 종류 */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-foreground flex items-center gap-2">
            <Drop size={18} className="text-primary" />
            염색약 종류 <span className="text-danger">*</span>
          </label>
          <select 
            {...register("dye_id")}
            className="w-full h-11 px-4 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm appearance-none"
          >
            <option value="">종류 선택</option>
            {dyeTypes.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          {errors.dye_id && (
            <p className="text-xs text-danger font-medium mt-1">{errors.dye_id.message}</p>
          )}
        </div>

        {/* 구매 수량 */}
        <div className="flex flex-col gap-2">
          <label htmlFor="amount" className="text-sm font-bold text-foreground flex items-center gap-2">
            <PlusCircle size={18} className="text-primary" />
            구매 수량 <span className="text-danger">*</span>
          </label>
          <div className="flex gap-2">
            <input 
              id="amount"
              type="number"
              step="any"
              {...register("amount")}
              placeholder="예: 500"
              className="flex-1 h-11 px-4 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm"
            />
            <select 
              {...register("unit_id")}
              className="w-24 h-11 px-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm appearance-none"
            >
              {units.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>
          {errors.amount && (
            <p className="text-xs text-danger font-medium mt-1">{errors.amount.message}</p>
          )}
        </div>

        {/* 메모 */}
        <div className="md:col-span-2 flex flex-col gap-2">
          <label className="text-sm font-bold text-foreground flex items-center gap-2">
            <Badge variant="secondary" className="px-1 py-0.5">Note</Badge>
            추가 메모
          </label>
          <textarea 
            {...register("memo")}
            placeholder="구매 관련 메모를 입력하세요 (선택 사항)"
            className="w-full h-24 p-4 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm resize-none"
          />
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="btn-primary flex-1 h-12 text-base font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-transform"
        >
          {isSubmitting ? (
            "등록 중..."
          ) : (
            <div className="flex items-center gap-2 justify-center">
              <CheckCircle size={20} weight="fill" />
              구매 내역 등록 완료
            </div>
          )}
        </button>
      </div>
    </form>
  )
}
