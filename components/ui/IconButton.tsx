import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const iconButtonVariants = cva(
  "inline-flex items-center justify-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "text-on-surface-variant hover:bg-surface-container-high",
        primary: "text-primary hover:bg-primary-container",
        error: "text-error hover:bg-error-container/30",
        filled: "bg-primary text-primary-foreground hover:bg-primary-dim",
        tonal: "bg-primary-container text-on-primary-container hover:bg-primary-container/80",
      },
      size: {
        sm: "p-1.5 [&_svg]:size-4",
        md: "p-2 [&_svg]:size-5",
        lg: "p-3 [&_svg]:size-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof iconButtonVariants> {}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(iconButtonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    )
  }
)
IconButton.displayName = "IconButton"

export { IconButton, iconButtonVariants }
