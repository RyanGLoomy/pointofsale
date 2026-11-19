"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { getSession, signIn } from "next-auth/react"
import { ArrowRight, BarChart3, LockKeyhole, ShieldCheck, ShoppingCart, Store } from "lucide-react"
import type { FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Field, Input } from "@/components/ui/input"

const highlights = [
  {
    icon: ShoppingCart,
    title: "Pesanan cepat",
    description: "Alur kasir ringkas untuk jam sibuk.",
  },
  {
    icon: BarChart3,
    title: "Laporan jelas",
    description: "Pantau penjualan dan menu terlaris.",
  },
  {
    icon: ShieldCheck,
    title: "Akses teratur",
    description: "Peran kasir, admin, dan owner terpisah.",
  },
]

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const router = useRouter()

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError(null)

    const result = await signIn("credentials", { email, password, redirect: false })

    if (result?.error) {
      setPending(false)
      setError("Email atau password salah.")
      return
    }

    const session = await getSession()
    const role = session?.user?.role

    setPending(false)
    router.replace(role === "ADMIN" ? "/admin" : role === "OWNER" ? "/owner" : "/kasir")
    router.refresh()
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-line bg-surface shadow-[0_50px_120px_-50px_rgba(0,0,0,0.95)] lg:grid-cols-[1.05fr_1fr]">
        <section className="relative hidden flex-col justify-between overflow-hidden bg-[#0d1016] p-10 lg:flex">
          <div className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-ember/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-info/10 blur-3xl" />

          <div className="relative">
            <div className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ember text-[#180a02]">
                <Store className="h-5 w-5" />
              </span>
              <span className="text-sm font-bold tracking-tight text-ink">Point of Sale</span>
            </div>

            <h2 className="mt-10 max-w-sm text-4xl font-extrabold leading-[1.1] tracking-tight text-ink">
              Kasir yang rapi. <span className="text-ember">Laporan yang jelas.</span>
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
              Satu tempat untuk pesanan, stok, dan performa toko.
            </p>

            <ul className="mt-8 space-y-4">
              {highlights.map((item) => {
                const Icon = item.icon
                return (
                  <li key={item.title} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line bg-surface-2 text-ember">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-ink">{item.title}</p>
                      <p className="text-xs text-muted">{item.description}</p>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>

          <p className="relative text-[11px] text-muted">Sistem point of sale internal.</p>
        </section>

        <section className="p-6 sm:p-10">
          <div className="flex items-center gap-2.5 lg:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ember text-[#180a02]">
              <Store className="h-4 w-4" />
            </span>
            <span className="text-sm font-bold tracking-tight text-ink">Point of Sale</span>
          </div>

          <div className="mt-8 lg:mt-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-ember">Selamat datang</p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-ink">Masuk ke POS</h1>
            <p className="mt-1.5 text-sm text-muted">
              Gunakan akun kasir, admin, atau owner untuk melanjutkan.
            </p>
          </div>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <Field label="Email" htmlFor="email">
              <Input
                id="email"
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="kasir@pointofsale.id"
              />
            </Field>

            <Field label="Password" htmlFor="password">
              <Input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
              />
            </Field>

            {error ? (
              <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
                {error}
              </p>
            ) : null}

            <Button type="submit" size="lg" className="w-full" disabled={pending}>
              {pending ? "Memproses..." : "Masuk"}
              {!pending ? <ArrowRight className="h-4 w-4" /> : null}
            </Button>
          </form>

          <div className="mt-6 rounded-xl border border-line bg-surface-2 p-3">
            <p className="flex items-center gap-2 text-[11px] text-muted">
              <LockKeyhole className="h-3.5 w-3.5" />
              Akses dibatasi sesuai peran akun.
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}
