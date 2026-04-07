import React from "react"
import { getCustomerDetail } from "@/lib/api/customers"
import CustomerRegisterForm from "@/components/customers/CustomerRegisterForm"
import { updateCustomer } from "@/app/customers/actions"
import { Avatar } from "@/components/ui/Avatar"
import { Badge } from "@/components/ui/Badge"
import Link from "next/link"
import { 
  CaretLeft, 
  UserCircle, 
  ClockCounterClockwise, 
  Drop,
  ClipboardText
} from "@phosphor-icons/react/dist/ssr"
import { format } from "date-fns"
import { ko } from "date-fns/locale"

export default async function CustomerPage({ params }: { params: { id: string } }) {
  const customer = await getCustomerDetail(params.id)

  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
        <h1 className="text-2xl font-bold text-muted">고객을 찾을 수 없습니다.</h1>
        <Link href="/customers" className="btn-primary">목록으로 돌아가기</Link>
      </div>
    )
  }

  // Update action pre-bound with ID
  const updateWithId = updateCustomer.bind(null, params.id)

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500 pb-12">
      {/* 헤더 및 프로필 요약 */}
      <header className="flex flex-col gap-4">
        <Link 
          href="/customers" 
          className="flex items-center gap-2 text-sm text-muted hover:text-primary transition-colors w-fit"
        >
          <CaretLeft size={16} weight="bold" />
          고객 목록으로 돌아가기
        </Link>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-5">
            <Avatar name={customer.name} className="w-16 h-16 text-xl" />
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-foreground tracking-tight">{customer.name}</h1>
                <Badge variant="secondary" className="font-medium">
                  {customer.treatments?.length || 0}회 방문
                </Badge>
              </div>
              <p className="text-muted font-medium mt-1">{customer.phone}</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button className="btn-secondary">
              <ClipboardText size={18} />
              시술 기록 작성
            </button>
            <button className="btn-primary">
              <Drop size={18} weight="fill" />
              염색약 구매/보충
            </button>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 그리드 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 왼쪽: 기본 정보 수정 및 메모 */}
        <div className="lg:col-span-1 flex flex-col gap-8">
          <section className="bg-surface rounded-2xl border border-border card-shadow p-6 flex flex-col gap-6">
            <div className="flex items-center gap-2 text-primary font-bold">
              <UserCircle size={20} weight="fill" />
              기본 정보 수정
            </div>
            <CustomerRegisterForm 
              initialData={{
                name: customer.name,
                phone: customer.phone,
                birth_date: customer.birth_date || "",
                memo: customer.memo || ""
              }} 
              onSubmit={updateWithId} 
            />
          </section>
        </div>

        {/* 오른쪽: 시술 이력 및 염색약 현황 */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          {/* 보유 염색약 섹션 */}
          <section className="bg-surface rounded-2xl border border-border card-shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 text-primary font-bold">
                <Drop size={20} weight="fill" />
                보유 염색약 (잔여)
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {customer.customer_dye_stocks?.length > 0 ? (
                customer.customer_dye_stocks.map((stock: any) => (
                  <div key={stock.id} className="p-4 rounded-xl border border-border bg-background flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold">{stock.dye_types?.name}</span>
                      <Badge variant={stock.status === "정상" ? "success" : "danger"}>
                        {stock.status}
                      </Badge>
                    </div>
                    <div className="text-2xl font-bold text-primary">
                      {stock.current_amount} <span className="text-sm font-normal text-muted">잔여</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 py-8 text-center text-muted border border-dashed border-border rounded-xl">
                  보유한 염색약 정보가 없습니다.
                </div>
              )}
            </div>
          </section>

          {/* 최근 시술 이력 섹션 */}
          <section className="bg-surface rounded-2xl border border-border card-shadow p-6">
            <div className="flex items-center gap-2 text-primary font-bold mb-6">
              <ClockCounterClockwise size={20} weight="bold" />
              최근 시술 이력
            </div>
            <div className="flex flex-col gap-4">
              {customer.treatments?.length > 0 ? (
                customer.treatments.sort((a: any, b: any) => new Date(b.treated_at).getTime() - new Date(a.treated_at).getTime())
                  .slice(0, 5)
                  .map((t: any) => (
                    <div key={t.id} className="flex justify-between items-center p-4 border-b border-border last:border-0 hover:bg-background/50 rounded-lg transition-colors">
                      <div>
                        <div className="font-bold">{t.treatment_types?.name || "일반 시술"}</div>
                        <div className="text-xs text-muted-light mt-1">
                          {format(new Date(t.treated_at), "yyyy년 MM월 dd일 HH:mm", { locale: ko })}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-foreground">
                          {t.total_price.toLocaleString()}원
                        </div>
                        <div className="text-xs text-muted mt-1">{t.payment_method}</div>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="py-8 text-center text-muted">시술 내역이 없습니다.</div>
              )}
            </div>
          </section>

        </div>
      </div>
    </div>
  )
}
