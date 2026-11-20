import type { ComponentPropsWithRef, ReactNode } from "react"
import { cn } from "@/lib/format"

const inputClasses =
  "h-10 w-full rounded-xl border border-line bg-surface-2 px-3 text-sm text-ink outline-none transition placeholder:text-muted/60 focus:border-ember/60 focus:ring-2 focus:ring-ember/20 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-danger/60 aria-invalid:focus:border-danger/60 aria-invalid:focus:ring-danger/20"

export function Input({ className, ...props }: ComponentPropsWithRef<"input">) {
  return <input className={cn(inputClasses, className)} {...props} />
}

export function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
  className,
}: {
  label: string
  htmlFor?: string
  hint?: string
  error?: string
  children: ReactNode
  className?: string
}) {
  const errorId = htmlFor ? `${htmlFor}-error` : undefined
  const hintId = htmlFor ? `${htmlFor}-hint` : undefined

  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={htmlFor} className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
        {label}
      </label>
      {children}
      {error ? (
        <p id={errorId} role="alert" className="text-[11px] font-medium text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-[11px] text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
