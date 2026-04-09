import React from "react"
import { Badge } from "@/components/ui/Badge"
import { Drop, User } from "@phosphor-icons/react/dist/ssr"
import Link from "next/link"

interface InventoryItem {
  id: string
  customer_id: string
  customer: { name: string }
  dye_type: { name: string }
  purchased_amount: number
  current_amount: number
  recipe_amount: number
  remaining_uses: number
  status: string
  unit?: { name: string }
}

export default function InventoryTable({ inventory }: { inventory: InventoryItem[] }) {
  // 고객별 그룹핑
  const grouped = inventory.reduce((acc, item) => {
    const key = item.customer_id
    if (!acc[key]) acc[key] = { customer: item.customer, customerId: item.customer_id, items: [] }
    acc[key].items.push(item)
    return acc
  }, {} as Record<string, { customer: { name: string }; customerId: string; items: InventoryItem[] }>)

  const groups = Object.values(grouped)

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b-2 border-border text-left">
            <th className="p-4 text-sm font-semibold text-muted-foreground">염색약 종류</th>
            <th className="p-4 text-sm font-semibold text-muted-foreground">구매 총량</th>
            <th className="p-4 text-sm font-semibold text-muted-foreground">현재 잔량</th>
            <th className="p-4 text-sm font-semibold text-muted-foreground">1회 기준 사용량</th>
            <th className="p-4 text-sm font-semibold text-muted-foreground text-center">예상 남은 횟수</th>
            <th className="p-4 text-sm font-semibold text-muted-foreground text-right">상태</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((group) => (
            <React.Fragment key={group.customerId}>
              {/* 고객 헤더 행 */}
              <tr className="bg-muted/40 border-b border-border">
                <td colSpan={6} className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <User size={13} weight="bold" className="text-primary" />
                    </div>
                    <Link
                      href={`/customers/${group.customerId}`}
                      className="text-sm font-bold text-foreground hover:text-primary transition-colors"
                    >
                      {group.customer?.name}
                    </Link>
                    <span className="text-xs text-muted-foreground">
                      · {group.items.length}종
                    </span>
                  </div>
                </td>
              </tr>

              {/* 염색약 행들 */}
              {group.items.map((item) => {
                const isExhausted = item.current_amount <= 0
                const isAlert    = !isExhausted && item.recipe_amount > 0 && item.remaining_uses <= 1
                const isLow      = !isExhausted && !isAlert && item.recipe_amount > 0 && item.remaining_uses <= 2

                const statusVariant = isExhausted ? "danger" : isAlert ? "danger" : isLow ? "warning" : "success"
                const statusLabel   = isExhausted ? "소진" : isAlert ? "경고" : isLow ? "주의" : "정상"
                const amountColor   = isExhausted ? "text-danger" : isAlert ? "text-danger" : isLow ? "text-warning" : "text-foreground"

                return (
                  <tr key={item.id} className="border-b border-border hover:bg-background/50 transition-colors group">
                    <td className="pl-10 pr-4 py-3">
                      <div className="flex items-center gap-2">
                        <Drop size={14} className="text-primary/50 group-hover:text-primary transition-colors shrink-0" weight="fill" />
                        <span className="text-sm">{item.dye_type?.name}</span>
                      </div>
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">{item.purchased_amount}{item.unit?.name || 'g'}</td>
                    <td className="p-3 text-sm font-bold text-primary">
                      {item.current_amount}{item.unit?.name || 'g'}
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">{item.recipe_amount > 0 ? `${item.recipe_amount}${item.unit?.name || 'g'}` : '—'}</td>
                    <td className="p-3 text-center">
                      {item.recipe_amount > 0 ? (
                        <span className={`text-sm font-bold ${amountColor}`}>
                          {item.remaining_uses}회
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <Badge variant={statusVariant}>
                        {statusLabel}
                      </Badge>
                    </td>
                  </tr>
                )
              })}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  )
}
