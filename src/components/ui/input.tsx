import type { InputHTMLAttributes, ReactNode } from "react"
import { cn } from "@/lib/format"

const inputClasses =
  "h-10 w-full rounded-xl border border-line bg-surface-2 px-3 text-sm text-ink outline-none transition placeholder:text-muted/60 focus:border-ember/60 focus:ring-2 focus:ring-ember/20 disabled:cursor-not-allowed disabled:opacity-50"

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(inputClasses, className)} {...props} />
}

export function Field({
  label,
  htmlFor,
  hint,
  children,
  className,
}: {
  label: string
  htmlFor?: string
  hint?: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={htmlFor} className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
        {label}
      </label>
      {children}
      {hint ? <p className="text-[11px] text-muted">{hint}</p> : null}
    </div>
  )
}
