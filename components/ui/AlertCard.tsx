import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const alertCardVariants = cva(
  "rounded-xl p-6 flex items-start gap-4",
  {
    variants: {
      variant: {
        error: "bg-error/5 border border-error-container/30",
        info: "bg-tertiary-container/20 border border-tertiary-container/50",
        warning: "bg-warning/10 border border-warning/30",
        success: "bg-emerald-50 border border-emerald-200",
      },
    },
    defaultVariants: {
      variant: "info",
    },
  }
)

const alertIconVariants = cva(
  "p-3 bg-card rounded-xl shadow-sm",
  {
    variants: {
      variant: {
        error: "text-error",
        info: "text-tertiary",
        warning: "text-warning",
        success: "text-emerald-600",
      },
    },
    defaultVariants: {
      variant: "info",
    },
  }
)

export interface AlertCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertCardVariants> {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  badge?: React.ReactNode
}

function AlertCard({
  className,
  variant,
  icon,
  title,
  description,
  action,
  badge,
  ...props
}: AlertCardProps) {
  return (
    <div className={cn(alertCardVariants({ variant }), className)} {...props}>
      {icon && (
        <div className={cn(alertIconVariants({ variant }))}>
          {icon}
        </div>
      )}
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <h4 className="font-black text-foreground">{title}</h4>
          {badge}
        </div>
        {description && (
          <p className="text-sm text-on-surface-variant mt-1">{description}</p>
        )}
        {action && <div className="mt-4">{action}</div>}
      </div>
    </div>
  )
}

export { AlertCard, alertCardVariants }
