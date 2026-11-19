import type { ReactNode } from "react"
import { cn } from "@/lib/format"

export type BadgeTone = "neutral" | "ember" | "success" | "danger" | "warning" | "info"

const toneClasses: Record<BadgeTone, string> = {
  neutral: "border-line bg-white/5 text-muted",
  ember: "border-ember/30 bg-ember/10 text-ember",
  success: "border-success/30 bg-success/10 text-success",
  danger: "border-danger/30 bg-danger/10 text-danger",
  warning: "border-warning/30 bg-warning/10 text-warning",
  info: "border-info/30 bg-info/10 text-info",
}

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode
  tone?: BadgeTone
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold",
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
