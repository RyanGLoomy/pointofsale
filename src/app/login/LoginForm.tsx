"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { getLoginLockState } from "@/actions/auth"
import { ArrowRight, BarChart3, Settings2, ShoppingCart } from "lucide-react"
import type { FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Field, Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { TextGenerateEffect } from "@/components/aceternity/text-generate-effect"
import { AuroraBackground } from "@/components/aceternity/aurora-background"
import { ShineBorder } from "@/components/twentyfirst/shine-border"

const roles = [
  {
    icon: ShoppingCart,
    title: "Kasir",
    description: "Pilih menu, susun keranjang, cetak struk.",
  },
  {
    icon: Settings2,
    title: "Admin",
    description: "Kelola menu, stok, akun pengguna, unduh laporan PDF.",
  },
  {
    icon: BarChart3,
    title: "Owner",
    description: "Lihat omzet harian, menu terlaris, dan riwayat transaksi.",
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
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,rgba(31,93,72,0.10),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(232,220,195,0.55),transparent_60%)]"
      />

      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-3xl border border-line bg-surface shadow-[0_50px_120px_-50px_rgba(0,0,0,0.45)] lg:grid-cols-[1.05fr_1fr]">
        <ShineBorder />
        <section
          data-testid="login-brand-panel"
          className="relative hidden flex-col justify-between gap-8 overflow-hidden bg-ember p-10 lg:flex"
        >
          <div aria-hidden="true" className="login-panel-grid pointer-events-none absolute inset-0" />
          <div
            aria-hidden="true"
            data-testid="login-spotlight-desktop"
            className="pointer-events-none absolute -left-28 -top-28 h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,rgba(232,220,195,0.42)_0%,rgba(232,220,195,0)_68%)] animate-login-spotlight"
          />

          <div className="relative z-10 flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="" width={237} height={320} className="h-12 w-auto object-contain" />
            <span className="text-sm font-bold leading-tight tracking-tight text-[#f4f1e9]">
              RM Gerobak Hayam Taman Sari
            </span>
          </div>

          <div className="relative z-10">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#c9c0ae]">
              Sistem kasir internal
            </p>
            <h2 className="mt-4 font-serif text-[2.6rem] leading-[1.12] tracking-tight text-[#f4f1e9]">
              <TextGenerateEffect words="Setiap pesanan tercatat. Setiap stok terhitung." />
            </h2>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-[#d8d0bf]">
              Stok berkurang otomatis pada setiap transaksi, sehingga menu, stok, dan laporan harian
              berasal dari satu sumber data yang sama.
            </p>
          </div>

          <div className="relative z-10">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#c9c0ae]">Peran akses</p>
            <ul className="mt-3 divide-y divide-white/10 border-y border-white/10">
              {roles.map((role) => {
                const Icon = role.icon
                return (
                  <li key={role.title} className="flex items-start gap-3 py-3">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/10 text-[#f4f1e9]">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-[#f4f1e9]">{role.title}</p>
                      <p className="text-xs text-[#d8d0bf]">{role.description}</p>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        </section>

        <AuroraBackground className="flex flex-col justify-center p-6 sm:p-10">
          <div
            data-login-enter
            className="login-enter relative flex items-center gap-2.5 lg:hidden"
          >
            <div
              aria-hidden="true"
              data-testid="login-spotlight-mobile"
              className="pointer-events-none absolute -left-4 -top-6 h-28 w-28 rounded-full bg-[radial-gradient(circle,rgba(31,93,72,0.22)_0%,rgba(31,93,72,0)_70%)] animate-login-spotlight"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="" width={237} height={320} className="relative z-10 h-9 w-auto object-contain" />
            <span className="relative z-10 text-sm font-bold leading-tight tracking-tight text-ink">
              RM Gerobak Hayam Taman Sari
            </span>
          </div>

          <div data-login-enter className="login-enter login-enter--1 mt-8 lg:mt-0">
            <h1 className="text-2xl font-extrabold tracking-tight text-ink">Masuk</h1>
            <p className="mt-1.5 text-sm text-muted">
              Gunakan akun kasir, admin, atau owner dari pengelola gerobak.
            </p>
          </div>

          <form
            data-login-enter
            onSubmit={onSubmit}
            className="login-enter login-enter--2 mt-6 space-y-4"
            noValidate
          >
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

          <p data-login-enter className="login-enter login-enter--3 mt-6 text-xs text-muted">
            Lupa kata sandi? Hubungi pengelola gerobak.
          </p>
        </AuroraBackground>
      </div>
    </main>
  )
}
