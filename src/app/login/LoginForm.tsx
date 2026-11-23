"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { getLoginLockState } from "@/actions/auth"
import { ArrowRight, BarChart3, LockKeyhole, ShieldCheck, ShoppingCart } from "lucide-react"
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

interface LoginFormProps {
  photos: string[]
}

/** Strip foto menu asli supaya halaman login terasa hidup, bukan kosong. */
function MenuShowcase({ photos }: { photos: string[] }) {
  if (photos.length === 0) return null

  return (
    <ul
      aria-hidden="true"
      data-testid="login-showcase"
      className="relative z-10 mt-5 grid grid-cols-4 gap-2 sm:gap-3 lg:mt-8"
    >
      {photos.map((src, index) => (
        <li
          key={src}
          className="aspect-square animate-login-float overflow-hidden rounded-xl shadow-[0_18px_40px_-24px_rgba(0,0,0,0.8)] ring-1 ring-white/25 lg:aspect-[4/3]"
          style={{ animationDelay: `${index * 0.7}s` }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="" className="h-full w-full object-cover" />
        </li>
      ))}
    </ul>
  )
}

export function LoginForm({ photos }: LoginFormProps) {
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
        <section className="relative flex flex-col overflow-hidden bg-ember p-6 sm:p-8 lg:p-10">
          <div
            aria-hidden="true"
            data-testid="login-spotlight-desktop"
            className="pointer-events-none absolute -left-28 -top-28 hidden h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,rgba(232,220,195,0.42)_0%,rgba(232,220,195,0)_68%)] lg:block animate-login-spotlight"
          />
          <div
            aria-hidden="true"
            data-testid="login-spotlight-mobile"
            className="pointer-events-none absolute -left-6 -top-8 h-36 w-36 rounded-full bg-[radial-gradient(circle,rgba(232,220,195,0.30)_0%,rgba(232,220,195,0)_70%)] lg:hidden animate-login-spotlight"
          />

          <div className="relative z-10 flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="" width={237} height={320} className="h-10 w-auto object-contain lg:h-12" />
            <span className="text-sm font-bold leading-tight tracking-tight text-[#f4f1e9]">
              RM Gerobak Hayam Taman Sari
            </span>
          </div>

          <h2 className="relative z-10 mt-6 max-w-sm font-serif leading-[1.1] tracking-tight text-[#f4f1e9] lg:mt-10 lg:text-4xl">
            Kasir yang rapi. <span className="text-[#e8dcc3]">Laporan yang jelas.</span>
          </h2>
          <p className="relative z-10 mt-3 max-w-sm text-sm leading-relaxed text-[#d8d0bf] lg:mt-4">
            Satu tempat untuk pesanan, stok, dan performa toko.
          </p>

          <ul className="relative z-10 mt-5 hidden space-y-3 lg:block">
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

          <MenuShowcase photos={photos} />

          <p className="relative z-10 mt-5 text-[11px] text-[#c9c0ae] lg:mt-6">Sistem kasir internal.</p>
        </section>

        <section className="p-6 sm:p-10">
          <div>
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
