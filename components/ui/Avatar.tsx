import * as React from "react"
import { cn } from "@/lib/utils"

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string
  src?: string
}

function Avatar({ name, src, className, ...props }: AvatarProps) {
  const initial = name.charAt(0)
  
  // Use a hash-based color if not provided
  const bgColors = ["bg-primary", "bg-secondary", "bg-primary-light", "bg-secondary/40"]
  const bgColor = bgColors[name.length % bgColors.length]

  return (
    <div
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow-sm overflow-hidden",
        bgColor,
        className
      )}
      {...props}
    >
      {src ? (
        <img src={src} alt={name} className="h-full w-full object-cover" />
      ) : (
        <span>{initial}</span>
      )}
    </div>
  )
}

export { Avatar }
