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

function CustomerCard({ customer, onClick }: { customer: Customer; onClick: () => void }) {
  const primaryStock = customer.customer_dye_stocks?.[0];
  const dyeName = primaryStock?.dye_types?.name || "기록 없음";
  const currentAmount = primaryStock?.current_amount || 0;
  const status = primaryStock?.status || "정상";

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left flex items-center gap-3 px-4 py-4 border-b border-border last:border-0 hover:bg-muted/40 active:bg-muted/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <Avatar name={customer.name} className="w-10 h-10 shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-bold text-foreground truncate">{customer.name}</span>
          <Badge
            variant={
              status === "경고" || status === "소진" ? "danger" :
              status === "주의" ? "warning" : "success"
            }
          >
            {status}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-0.5 truncate">{customer.phone}</p>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-xs text-muted-foreground">
            {customer.last_visit
              ? formatDistanceToNow(new Date(customer.last_visit), { addSuffix: true, locale: ko })
              : "방문 기록 없음"}
          </span>
          <span className="text-xs text-muted-foreground">·</span>
          <span className="text-xs text-muted-foreground">{customer.total_visits}회 방문</span>
          <span className="text-xs text-muted-foreground">·</span>
          <span className={`text-xs ${status === "경고" || status === "소진" ? "text-danger font-semibold" : "text-muted-foreground"}`}>
            {dyeName} ({currentAmount}회)
          </span>
        </div>
      </div>
      <CaretRight size={16} className="text-muted-foreground shrink-0" aria-hidden="true" />
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
              const primaryStock = customer.customer_dye_stocks?.[0];
              const dyeName = primaryStock?.dye_types?.name || "기록 없음";
              const currentAmount = primaryStock?.current_amount || 0;
              const status = primaryStock?.status || "정상";

              return (
                <StaggerTr
                  key={customer.id}
                  className="border-b border-border hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => router.push(`/customers/${customer.id}`)}
                >
                  <td className="py-4 px-4 flex items-center gap-3">
                    <Avatar name={customer.name} className="w-9 h-9" />
                    <span className="font-bold text-foreground">{customer.name}</span>
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
                    <span className={status === "경고" || status === "소진" ? "text-danger font-semibold" : ""}>
                      {dyeName} ({currentAmount}회)
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <Badge
                      variant={
                        status === "경고" || status === "소진" ? "danger" :
                        status === "주의" ? "warning" : "success"
                      }
                    >
                      {status}
                    </Badge>
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
