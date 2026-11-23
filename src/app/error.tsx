"use client"

import { useEffect } from "react"
import Link from "next/link"
import { CircleAlert, RotateCcw } from "lucide-react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Halaman gagal dimuat:", error.digest ?? error.message)
  }, [error])

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-line bg-surface p-8 text-center shadow-[0_50px_120px_-50px_rgba(0,0,0,0.95)]">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-danger/30 bg-danger/10 text-danger">
          <CircleAlert className="h-5 w-5" aria-hidden="true" />
        </span>
        <h1 className="mt-4 text-xl font-extrabold tracking-tight text-ink">Terjadi kesalahan</h1>
        <p className="mt-1.5 text-sm text-muted">
          Halaman ini gagal dimuat. Coba muat ulang; jika masih gagal, kembali ke terminal kasir.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-ember px-4 text-sm font-semibold text-[#f4f1e9] transition-colors hover:bg-ember-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember/60 focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Coba lagi
          </button>
          <Link
            href="/"
            className="inline-flex h-10 flex-1 items-center justify-center rounded-xl border border-line bg-surface-2 px-4 text-sm font-semibold text-ink transition-colors hover:border-ink/25 hover:bg-ink/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember/60"
          >
            Ke kasir
          </Link>
        </div>
      </div>
    </main>
  )
}
