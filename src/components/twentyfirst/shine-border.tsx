import { cn } from "@/lib/format"

/** Adaptasi 21st.dev — "Shine Border": garis kilau di tepi kartu, non-interaktif. */
export function ShineBorder({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      data-testid="login-shine"
      className={cn("login-shine pointer-events-none absolute inset-0 z-20", className)}
    />
  )
}
