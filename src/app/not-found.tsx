import Link from "next/link"
import { Compass } from "lucide-react"

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-line bg-surface p-8 text-center shadow-[0_50px_120px_-50px_rgba(0,0,0,0.95)]">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-line bg-surface-2 text-ember">
          <Compass className="h-5 w-5" aria-hidden="true" />
        </span>
        <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.22em] text-ember">404</p>
        <h1 className="mt-1 text-xl font-extrabold tracking-tight text-ink">Halaman tidak ditemukan</h1>
        <p className="mt-1.5 text-sm text-muted">
          Tautan ini tidak tersedia atau sudah dipindahkan.
        </p>
        <Link
          href="/kasir"
          className="mt-6 inline-flex h-10 w-full items-center justify-center rounded-xl bg-ember px-4 text-sm font-semibold text-[#f4f1e9] transition-colors hover:bg-ember-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember/60 focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
        >
          Kembali ke kasir
        </Link>
      </div>
    </main>
  )
}
