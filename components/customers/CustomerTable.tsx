"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { format, formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

interface Customer {
  id: string;
  name: string;
  phone: string;
  last_visit: string | null;
  total_visits: number;
  customer_dye_stocks?: any[];
}

export default function CustomerTable({ customers }: { customers: Customer[] }) {
  const router = useRouter();

  return (
    <div className="overflow-x-auto w-full">
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
        <tbody className="text-sm">
          {customers.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center py-10 text-muted-foreground">
                등록된 고객이 없습니다.
              </td>
            </tr>
          ) : (
            customers.map((customer) => {
              const primaryStock = customer.customer_dye_stocks?.[0];
              const dyeName = primaryStock?.dye_types?.name || "기록 없음";
              const currentAmount = primaryStock?.current_amount || 0;
              const status = primaryStock?.status || "정상";

              return (
                <tr
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
                            locale: ko
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
                    <Badge variant={status === "경고" || status === "소진" ? "danger" :
                                    status === "주의" ? "warning" : "success"}>
                      {status}
                    </Badge>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
