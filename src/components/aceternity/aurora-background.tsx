import type { ReactNode } from "react"
import { cn } from "@/lib/format"

/**
 * Adaptasi Aceternity UI — "Aurora Background"
 * (https://ui.aceternity.com/components/aurora-background).
 * Versi ini memakai radial gradient + transform/opacity, tanpa blur beranimasi.
 */
export function AuroraBackground({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn("relative isolate overflow-hidden", className)}>
      <div
        aria-hidden="true"
        data-testid="login-aurora"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <span className="aurora-blob aurora-blob--one" />
        <span className="aurora-blob aurora-blob--two" />
        <span className="aurora-blob aurora-blob--three" />
      </div>
      {children}
    </div>
  )
}
