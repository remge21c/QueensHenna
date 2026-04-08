import React from "react"
import { Badge } from "@/components/ui/Badge"
import { Drop } from "@phosphor-icons/react/dist/ssr"

interface InventoryItem {
  id: string
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
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b-2 border-border text-left">
            <th className="p-4 text-sm font-semibold text-muted-foreground">고객명</th>
            <th className="p-4 text-sm font-semibold text-muted-foreground">염색약 종류</th>
            <th className="p-4 text-sm font-semibold text-muted-foreground">구매 총량</th>
            <th className="p-4 text-sm font-semibold text-muted-foreground">현재 잔량</th>
            <th className="p-4 text-sm font-semibold text-muted-foreground">1회 기준 사용량</th>
            <th className="p-4 text-sm font-semibold text-muted-foreground text-center">예상 남은 횟수</th>
            <th className="p-4 text-sm font-semibold text-muted-foreground text-right">상태</th>
          </tr>
        </thead>
        <tbody>
          {inventory.map((item) => {
            const isLow = item.remaining_uses <= 1.5 && item.remaining_uses > 0
            const isExhausted = item.remaining_uses <= 0

            return (
              <tr key={item.id} className="border-b border-border hover:bg-background/50 transition-colors group">
                <td className="p-4 font-bold text-foreground">{item.customer?.name}</td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
                    {item.dye_type?.name}
                  </div>
                </td>
                <td className="p-4 text-outline-variant">{item.purchased_amount}{item.unit?.name || 'g'}</td>
                <td className="p-4 font-medium text-primary">
                  {item.current_amount}{item.unit?.name || 'g'}
                </td>
                <td className="p-4 text-muted-foreground">{item.recipe_amount}{item.unit?.name || 'g'}</td>
                <td className="p-4 text-center">
                  <span className={`font-bold ${isExhausted ? 'text-danger' : isLow ? 'text-warning' : 'text-foreground'}`}>
                    {item.remaining_uses}회
                  </span>
                </td>
                <td className="p-4 text-right">
                  <Badge 
                    variant={isExhausted ? "danger" : isLow ? "warning" : "success"}
                  >
                    {isExhausted ? "소진 (연락요망)" : isLow ? "주의" : "정상"}
                  </Badge>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
