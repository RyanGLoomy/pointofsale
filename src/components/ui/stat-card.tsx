import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/format"

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  accent = false,
}: {
  label: string
  value: string | number
  icon: LucideIcon
  hint?: string
  accent?: boolean
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-4",
        accent ? "border-ember/30 bg-ember-soft" : "border-line bg-surface",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">{label}</span>
        <span
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
            accent ? "bg-ember text-[#180a02]" : "bg-white/5 text-muted",
          )}
        >
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p
        className={cn(
          "mt-3 text-2xl font-extrabold tracking-tight tabular-nums",
          accent ? "text-ember" : "text-ink",
        )}
      >
        {value}
      </p>
      {hint ? <p className="mt-1 text-[11px] text-muted">{hint}</p> : null}
    </div>
  )
}
