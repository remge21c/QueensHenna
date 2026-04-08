"use client"

import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { User, Phone, Calendar, Notepad, Warning } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

const formSchema = z.object({
  name: z.string().min(2, { message: "고객명을 입력해주세요 (최소 2자)" }),
  phone: z.string().min(10, { message: "올바른 연락처를 입력해주세요" }),
  birth_date: z.string().optional(),
  memo: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

export default function CustomerRegisterForm({ 
  onSubmit,
  initialData
}: { 
  onSubmit?: (data: FormValues) => void,
  initialData?: Partial<FormValues>
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
      name: initialData.name || "",
      phone: initialData.phone || "",
      birth_date: initialData.birth_date || "",
      memo: initialData.memo || "",
    } : {
      name: "",
      phone: "",
      birth_date: "",
      memo: "",
    },
  })

  const formSubmit = (data: FormValues) => {
    if (onSubmit) {
      onSubmit(data)
    } else {
      console.log("Form submitted locally:", data)
    }
  }

  return (
    <form onSubmit={handleSubmit(formSubmit)} className="flex flex-col gap-6 max-w-xl">
      {/* 고객명 */}
      <div className="flex flex-col gap-2">
        <label htmlFor="name" className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
          <User size={16} />
          고객명
          <span className="text-danger">*</span>
        </label>
        <div className="relative">
          <input
            id="name"
            {...register("name")}
            className={cn(
              "w-full h-11 px-4 bg-background border rounded-xl focus:outline-none focus:ring-2 transition-all transition-duration-300",
              errors.name ? "border-danger focus:ring-danger/10" : "border-border focus:ring-primary/10 focus:border-primary"
            )}
            placeholder="예: 김미영"
          />
          {errors.name && (
            <div className="flex items-center gap-1 mt-1.5 text-xs text-danger animate-in fade-in slide-in-from-top-1">
              <Warning size={14} weight="fill" />
              <span>{errors.name.message}</span>
            </div>
          )}
        </div>
      </div>

      {/* 연락처 */}
      <div className="flex flex-col gap-2">
        <label htmlFor="phone" className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
          <Phone size={16} />
          연락처
          <span className="text-danger">*</span>
        </label>
        <div className="relative">
          <input
            id="phone"
            {...register("phone")}
            className={cn(
              "w-full h-11 px-4 bg-background border rounded-xl focus:outline-none focus:ring-2 transition-all",
              errors.phone ? "border-danger focus:ring-danger/10" : "border-border focus:ring-primary/10 focus:border-primary"
            )}
            placeholder="010-0000-0000"
          />
          {errors.phone && (
            <div className="flex items-center gap-1 mt-1.5 text-xs text-danger animate-in fade-in slide-in-from-top-1">
              <Warning size={14} weight="fill" />
              <span>{errors.phone.message}</span>
            </div>
          )}
        </div>
      </div>

      {/* 생년월일 */}
      <div className="flex flex-col gap-2">
        <label htmlFor="birth_date" className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
          <Calendar size={16} />
          생년월일
        </label>
        <input
          id="birth_date"
          type="date"
          {...register("birth_date")}
          className="w-full h-11 px-4 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
        />
      </div>

      {/* 메모 */}
      <div className="flex flex-col gap-2">
        <label htmlFor="memo" className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
          <Notepad size={16} />
          참이(메모)
        </label>
        <textarea
          id="memo"
          {...register("memo")}
          rows={3}
          className="w-full p-4 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all resize-none"
          placeholder="특이사항이나 기본 정보를 기록하세요..."
        />
      </div>

      {/* 버튼 영역 */}
      <div className="mt-4 flex gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full h-12 text-base shadow-lg shadow-primary/20"
        >
          {isSubmitting ? "처리 중..." : "등록하기"}
        </button>
      </div>
    </form>
  )
}
