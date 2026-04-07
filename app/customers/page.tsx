import React from "react";
import { getCustomers } from "@/lib/api/customers";
import CustomerTable from "@/components/customers/CustomerTable";
import { 
  Users, 
  UserPlus, 
  MagnifyingGlass,
  Funnel
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function CustomersPage() {
  const customers = await getCustomers();

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500">
      {/* 헤더 */}
      <header className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-sm">
            <Users size={28} weight="fill" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">고객 관리</h1>
            <p className="text-sm text-muted">고객 정보 및 시술 이력 통합 관리</p>
          </div>
        </div>
        <Link 
          href="/customers/register"
          className="btn-primary"
        >
          <UserPlus size={20} weight="bold" />
          신규 고객 등록
        </Link>
      </header>

      {/* 메인 카드 */}
      <div className="bg-surface rounded-2xl border border-border card-shadow p-6 flex flex-col gap-6">
        
        {/* 검색 및 필터 바 */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="w-full md:max-w-md relative group">
            <MagnifyingGlass 
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" 
              size={20} 
            />
            <input 
              type="text" 
              placeholder="이름, 전화번호 검색..."
              className="w-full h-11 pl-12 pr-4 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
            />
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            <button className="whitespace-nowrap px-4 py-2 rounded-full bg-primary text-white text-sm font-semibold shadow-md shadow-primary/10">
              전체조회
            </button>
            <button className="whitespace-nowrap px-4 py-2 rounded-full bg-background border border-border text-muted hover:text-primary hover:border-primary transition-all text-sm font-medium">
              재방문 필요
            </button>
            <button className="whitespace-nowrap px-4 py-2 rounded-full bg-background border border-border text-muted hover:text-primary hover:border-primary transition-all text-sm font-medium">
              염색약 부족
            </button>
            <div className="h-4 w-[1px] bg-border mx-1 hidden md:block" />
            <button className="p-2.5 rounded-xl border border-border text-muted hover:text-primary hover:bg-primary/5 transition-all">
              <Funnel size={18} />
            </button>
          </div>
        </div>

        {/* 테이블 레이어 */}
        <CustomerTable customers={customers} />
      </div>

      {/* 푸터 정보 */}
      <div className="flex justify-between items-center text-[13px] text-muted-light mt-4">
        <span>총 <strong>{customers.length}명</strong>의 고객이 등록되어 있습니다.</span>
        <div className="flex gap-4">
          <Link href="/help" className="hover:text-primary underline">도움말</Link>
          <Link href="/settings" className="hover:text-primary underline">시스템 설정</Link>
        </div>
      </div>
    </div>
  );
}
