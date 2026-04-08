import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const statusBadgeVariants = cva(
  "inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold",
  {
    variants: {
      status: {
        completed: "bg-emerald-50 text-emerald-600",
        waiting: "bg-amber-50 text-amber-600",
        scheduled: "bg-surface-container text-on-surface-variant",
        cancelled: "bg-surface-container text-muted-foreground line-through opacity-60",
        confirmed: "bg-blue-50 text-blue-600",
        noshow: "bg-red-50 text-red-600",
        urgent: "bg-error text-error-foreground",
        info: "bg-tertiary text-tertiary-foreground",
      },
    },
    defaultVariants: {
      status: "scheduled",
    },
  }
)

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusBadgeVariants> {}

function StatusBadge({ className, status, ...props }: StatusBadgeProps) {
  return (
    <span
      className={cn(statusBadgeVariants({ status }), className)}
      {...props}
    />
  )
}

export { StatusBadge, statusBadgeVariants }
