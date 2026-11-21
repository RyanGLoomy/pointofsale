import { Loader2 } from "lucide-react"
import type { ButtonHTMLAttributes } from "react"
import { cn } from "@/lib/format"

type Variant = "primary" | "secondary" | "ghost" | "danger"
type Size = "sm" | "md" | "lg"

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-ember text-[#f4f1e9] shadow-[0_16px_38px_-18px_rgba(31,93,72,0.55)] hover:bg-ember-strong",
  secondary:
    "border border-line bg-surface-2 text-ink hover:border-ink/25 hover:bg-ink/5",
  ghost: "text-muted hover:bg-ink/5 hover:text-ink",
  danger: "border border-danger/30 bg-danger/10 text-danger hover:bg-danger/20",
}

const sizeClasses: Record<Size, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  type = "button",
  loading = false,
  disabled,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
  loading?: boolean
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember/60 focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:pointer-events-none disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden="true" /> : null}
      {children}
    </button>
  )
}
