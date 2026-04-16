"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { StaggerTbody, StaggerTr } from "@/components/ui/StaggerList";
import { format, formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { CaretRight } from "@phosphor-icons/react";

interface Customer {
  id: string;
  name: string;
  phone: string;
  last_visit: string | null;
  total_visits: number;
  customer_dye_stocks?: any[];
}

function getWorstStatus(stocks: any[]): string {
  if (!stocks || stocks.length === 0) return "정상"
  if (stocks.some(s => s.status === "소진")) return "소진"
  if (stocks.some(s => s.status === "경고")) return "경고"
  if (stocks.some(s => s.status === "주의")) return "주의"
  return "정상"
}

function statusVariant(status: string) {
  return status === "경고" || status === "소진" ? "danger" : status === "주의" ? "warning" : "success"
}

function CustomerCard({ customer, onClick }: { customer: Customer; onClick: () => void }) {
  const stocks = customer.customer_dye_stocks || []
  const overallStatus = getWorstStatus(stocks)

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left flex items-start gap-3 px-4 py-4 border-b border-border last:border-0 hover:bg-muted/40 active:bg-muted/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <Avatar name={customer.name} className="w-10 h-10 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        {/* 이름 + 전화번호 + 전체 상태 */}
        <div className="flex items-center gap-2">
          <span className="font-bold text-foreground truncate">{customer.name}</span>
          <Badge variant={statusVariant(overallStatus)}>{overallStatus}</Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 truncate">{customer.phone}</p>

        {/* 방문 정보 */}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-muted-foreground">
            {customer.last_visit
              ? formatDistanceToNow(new Date(customer.last_visit), { addSuffix: true, locale: ko })
              : "방문 기록 없음"}
          </span>
          <span className="text-xs text-muted-foreground">·</span>
          <span className="text-xs text-muted-foreground">{customer.total_visits}회 방문</span>
        </div>

        {/* 보유 염색약 전체 목록 */}
        {stocks.length === 0 ? (
          <span className="text-xs text-muted-foreground mt-1.5 block">보유 염색약 없음</span>
        ) : (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {stocks.map((s: any) => (
              <span
                key={s.id}
                className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border ${
                  s.status === "소진" || s.status === "경고"
                    ? "border-danger/30 bg-danger/5 text-danger"
                    : s.status === "주의"
                    ? "border-warning/30 bg-warning/5 text-warning"
                    : "border-border bg-muted text-muted-foreground"
                }`}
              >
                {s.dye_types?.name}
                <span className="opacity-70">{s.current_amount}{s.unit?.name || 'g'}</span>
              </span>
            ))}
          </div>
        )}
      </div>
      <CaretRight size={16} className="text-muted-foreground shrink-0 mt-1" aria-hidden="true" />
    </button>
  );
}

export default function CustomerTable({ customers }: { customers: Customer[] }) {
  const router = useRouter();

  if (customers.length === 0) {
    return (
      <p className="text-center py-10 text-muted-foreground">
        등록된 고객이 없습니다.
      </p>
    );
  }

  return (
    <>
      {/* 모바일: 카드 리스트 */}
      <div className="md:hidden -mx-6 -mb-6">
        {customers.map((customer) => (
          <CustomerCard
            key={customer.id}
            customer={customer}
            onClick={() => router.push(`/customers/${customer.id}`)}
          />
        ))}
      </div>

      {/* 데스크탑: 테이블 */}
      <div className="hidden md:block overflow-x-auto w-full">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-border text-muted-foreground text-[13px] font-medium uppercase tracking-wider">
              <th className="text-left py-3 px-4">고객명</th>
              <th className="text-left py-3 px-4">연락처</th>
              <th className="text-left py-3 px-4">최근 방문일</th>
              <th className="text-left py-3 px-4">누적 방문</th>
              <th className="text-left py-3 px-4">보유 염색약 (잔여)</th>
              <th className="text-left py-3 px-4">상태</th>
            </tr>
          </thead>
          <StaggerTbody fast className="text-sm">
            {customers.map((customer) => {
              const stocks = customer.customer_dye_stocks || []
              const overallStatus = getWorstStatus(stocks)

              return (
                <StaggerTr
                  key={customer.id}
                  className="border-b border-border hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => router.push(`/customers/${customer.id}`)}
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={customer.name} className="w-9 h-9 shrink-0" />
                      <span className="font-bold text-foreground">{customer.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-muted-foreground">{customer.phone}</td>
                  <td className="py-4 px-4">
                    {customer.last_visit ? (
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {formatDistanceToNow(new Date(customer.last_visit), {
                            addSuffix: true,
                            locale: ko,
                          })}
                        </span>
                        <span className="text-[12px] text-outline-variant">
                          ({format(new Date(customer.last_visit), "yyyy.MM.dd")})
                        </span>
                      </div>
                    ) : (
                      <span className="text-outline-variant">방문 기록 없음</span>
                    )}
                  </td>
                  <td className="py-4 px-4 font-medium">{customer.total_visits}회</td>
                  <td className="py-4 px-4">
                    {stocks.length === 0 ? (
                      <span className="text-muted-foreground">기록 없음</span>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {stocks.map((s: any) => (
                          <span
                            key={s.id}
                            className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${
                              s.status === "소진" || s.status === "경고"
                                ? "border-danger/30 bg-danger/5 text-danger"
                                : s.status === "주의"
                                ? "border-warning/30 bg-warning/5 text-warning"
                                : "border-border bg-muted text-muted-foreground"
                            }`}
                          >
                            {s.dye_types?.name}
                            <span className="opacity-70">{s.current_amount}{s.unit?.name || 'g'}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <Badge variant={statusVariant(overallStatus)}>{overallStatus}</Badge>
                  </td>
                </StaggerTr>
              );
            })}
          </StaggerTbody>
        </table>
      </div>
    </>
  );
}
