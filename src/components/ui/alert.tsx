import * as React from "react"
import { cn } from "@/lib/utils"

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "destructive" | "warning"
}

const variantClasses: Record<NonNullable<AlertProps["variant"]>, string> = {
  default: "bg-gray-50 text-gray-900 ring-1 ring-gray-200",
  success: "bg-emerald-50 text-emerald-900 ring-1 ring-emerald-200",
  destructive: "bg-red-50 text-red-900 ring-1 ring-red-200",
  warning: "bg-yellow-50 text-yellow-900 ring-1 ring-yellow-200",
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = "default", ...props }, ref) => (
    <div
      ref={ref}
      role="status"
      className={cn(
        "w-full rounded-md p-4 flex gap-3 items-start", 
        variantClasses[variant],
        className
      )}
      {...props}
    />
  )
)
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("font-semibold leading-none", className)} {...props} />
  )
)
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-current/80", className)} {...props} />
  )
)
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }


