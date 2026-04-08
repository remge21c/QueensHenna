import React from "react"
import CustomerRegisterForm from "@/components/customers/CustomerRegisterForm"
import { createCustomer } from "@/app/customers/actions"
import Link from "next/link"
import { CaretLeft, PlusCircle } from "@phosphor-icons/react/dist/ssr"

export default function RegisterCustomerPage() {
  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500">
      {/* 헤더 */}
      <header className="flex flex-col gap-4">
        <Link 
          href="/customers" 
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors w-fit"
        >
          <CaretLeft size={16} weight="bold" />
          고객 목록으로 돌아가기
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-sm">
            <PlusCircle size={28} weight="fill" />
          </div>
          <div>
            <h1 className="text-xl md:text-3xl font-bold text-foreground tracking-tight">신규 고객 등록</h1>
            <p className="text-sm text-muted-foreground">새로운 고객을 시스템에 등록하고 기본 정보를 관리합니다.</p>
          </div>
        </div>
      </header>

      {/* 메인 카드 */}
      <div className="bg-card rounded-xl border border-border card-shadow p-8">
        <CustomerRegisterForm onSubmit={createCustomer} />
      </div>

      {/* 안내 문구 */}
      <div className="bg-primary/5 p-6 rounded-xl border border-primary/10 flex gap-4 max-w-xl">
        <div className="text-primary mt-1">
          <PlusCircle size={20} weight="fill" />
        </div>
        <div className="text-sm text-muted-foreground leading-relaxed">
          <strong className="text-foreground block mb-1">고객 등록 팁</strong>
          고객명과 연락처는 필수 입력 사항입니다. 생년월일을 기록해두면 추후 이벤트 알림이나 축하 문자 발송에 활용할 수 있습니다.
        </div>
      </div>
    </div>
  )
}
