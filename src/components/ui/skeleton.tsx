import type { ReactNode } from "react"
import { cn } from "@/lib/format"

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn("animate-pulse rounded-lg bg-ink/10", className)} />
}

export function PageSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true">
      <span className="sr-only">Memuat halaman…</span>
      <div className="space-y-2.5">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-8 w-64 max-w-full" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {[0, 1, 2].map((key) => (
          <Skeleton key={key} className="h-24 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-72 rounded-2xl" />
    </div>
  )
}

export function ShellSkeleton({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <div className="fixed inset-y-0 left-0 hidden w-[212px] border-r border-line bg-surface/70 md:block" />
      <div className="pb-24 md:pb-0 md:pl-[212px]">
        <div className="mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </div>
      </div>
    </div>
  )
}
