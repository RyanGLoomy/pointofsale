"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { getLoginLockState } from "@/actions/auth"
import { ArrowRight, BarChart3, LockKeyhole, ShieldCheck, ShoppingCart, Store } from "lucide-react"
import type { FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Field, Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"

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

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface FieldErrors {
  email?: string
  password?: string
}

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  function validate(): FieldErrors {
    const next: FieldErrors = {}

    if (!email.trim()) {
      next.email = "Email wajib diisi."
    } else if (!emailPattern.test(email.trim())) {
      next.email = "Format email tidak valid."
    }

    if (!password) {
      next.password = "Password wajib diisi."
    }

    return next
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    const validation = validate()
    if (validation.email || validation.password) {
      setFieldErrors(validation)
      if (validation.email) emailRef.current?.focus()
      else passwordRef.current?.focus()
      return
    }

    setFieldErrors({})
    setPending(true)

    const result = await signIn("credentials", { email: email.trim(), password, redirect: false })

    if (result?.error) {
      setPending(false)
      const lock = await getLoginLockState(email.trim())
      if (lock.locked) {
        const minutes = Math.max(1, Math.ceil(lock.remainingSeconds / 60))
        setError(`Akun terkunci setelah 5 kali gagal. Coba lagi dalam ${minutes} menit.`)
      } else {
        setError("Email atau password salah.")
      }
      passwordRef.current?.focus()
      passwordRef.current?.select()
      return
    }

    setPending(false)
    // "/" already redirects by role from the JWT, so no extra getSession()
    // round trip and no duplicate router.refresh() are needed here.
    router.replace("/")
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-line bg-surface shadow-[0_50px_120px_-50px_rgba(0,0,0,0.45)] lg:grid-cols-[1.05fr_1fr]">
        <section className="hidden flex-col justify-between overflow-hidden bg-ember p-10 lg:flex">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f4f1e9] text-[#1f5d48]">
                <Store className="h-5 w-5" />
              </span>
              <span className="text-sm font-bold tracking-tight text-[#f4f1e9]">Point of Sale</span>
            </div>

            <h2 className="mt-10 max-w-sm text-4xl font-serif leading-[1.1] tracking-tight text-[#f4f1e9]">
              Kasir yang rapi. <span className="text-[#e8dcc3]">Laporan yang jelas.</span>
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-[#d8d0bf]">
              Satu tempat untuk pesanan, stok, dan performa toko.
            </p>

            <ul className="mt-6 space-y-3">
              {highlights.map((item) => {
                const Icon = item.icon
                return (
                  <li key={item.title} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-[#f4f1e9]">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-[#f4f1e9]">{item.title}</p>
                      <p className="text-xs text-[#d8d0bf]">{item.description}</p>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>

          <p className="mt-6 text-[11px] text-[#c9c0ae]">Sistem point of sale internal.</p>
        </section>

        <section className="p-6 sm:p-10">
          <div className="flex items-center gap-2.5 lg:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f4f1e9] text-[#1f5d48]">
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

          <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
            <Field label="Email" htmlFor="email" error={fieldErrors.email}>
              <Input
                ref={emailRef}
                id="email"
                type="email"
                required
                autoComplete="username"
                autoFocus
                value={email}
                disabled={pending}
                aria-invalid={Boolean(fieldErrors.email)}
                aria-describedby={fieldErrors.email ? "email-error" : undefined}
                onChange={(event) => {
                  setEmail(event.target.value)
                  setFieldErrors((current) => ({ ...current, email: undefined }))
                  setError(null)
                }}
                onBlur={() => {
                  if (email.length > 0 && !emailPattern.test(email.trim())) {
                    setFieldErrors((current) => ({ ...current, email: "Format email tidak valid." }))
                  }
                }}
                placeholder="kasir@pointofsale.id"
              />
            </Field>

            <Field label="Password" htmlFor="password" error={fieldErrors.password}>
              <PasswordInput
                ref={passwordRef}
                id="password"
                required
                autoComplete="current-password"
                value={password}
                disabled={pending}
                aria-invalid={Boolean(fieldErrors.password)}
                aria-describedby={fieldErrors.password ? "password-error" : undefined}
                onChange={(event) => {
                  setPassword(event.target.value)
                  setFieldErrors((current) => ({ ...current, password: undefined }))
                  setError(null)
                }}
                placeholder="••••••••"
              />
            </Field>

            {error ? (
              <p
                role="alert"
                className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger"
              >
                {error}
              </p>
            ) : null}

            <Button type="submit" size="lg" className="w-full" loading={pending}>
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
