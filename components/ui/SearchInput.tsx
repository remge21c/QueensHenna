import * as React from "react"
import { MagnifyingGlass } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

export interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, ...props }, ref) => {
    return (
      <div className={cn("relative", className)}>
        <MagnifyingGlass
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <input
          type="text"
          className={cn(
            "w-full pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-lg text-sm text-foreground",
            "placeholder:text-muted-foreground",
            "focus:outline-none focus:ring-1 focus:ring-primary",
            "transition-colors"
          )}
          ref={ref}
          {...props}
        />
      </div>
    )
  }
)
SearchInput.displayName = "SearchInput"

export { SearchInput }
