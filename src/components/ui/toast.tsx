"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import type { ReactNode } from "react"
import { CircleAlert, CircleCheck, Info, X } from "lucide-react"
import { cn } from "@/lib/format"

export type ToastTone = "success" | "error" | "info"

export interface ToastAction {
  label: string
  onClick: () => void
}

export interface ToastOptions {
  title: string
  description?: string
  tone?: ToastTone
  duration?: number
  action?: ToastAction
}

interface ToastRecord extends ToastOptions {
  id: number
}

interface ToastApi {
  push: (options: ToastOptions) => void
  dismiss: (id: number) => void
  success: (title: string, description?: string, action?: ToastAction) => void
  error: (title: string, description?: string, action?: ToastAction) => void
  info: (title: string, description?: string, action?: ToastAction) => void
}

const ToastContext = createContext<ToastApi | null>(null)

const toneStyles: Record<ToastTone, string> = {
  success: "border-success/30 bg-success/10 text-success",
  error: "border-danger/30 bg-danger/10 text-danger",
  info: "border-info/30 bg-info/10 text-info",
}

const toneIcons = {
  success: CircleCheck,
  error: CircleAlert,
  info: Info,
}

const DEFAULT_DURATION = 4000
const ACTION_DURATION = 8000
const ERROR_DURATION = 6000

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastRecord[]>([])
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>())
  const nextId = useRef(0)

  const dismiss = useCallback((id: number) => {
    const timer = timers.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timers.current.delete(id)
    }
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const push = useCallback(
    (options: ToastOptions) => {
      nextId.current += 1
      const id = nextId.current
      const toast: ToastRecord = { ...options, id }

      setToasts((current) => [...current.slice(-3), toast])

      const duration =
        options.duration ??
        (options.action ? ACTION_DURATION : options.tone === "error" ? ERROR_DURATION : DEFAULT_DURATION)

      timers.current.set(
        id,
        setTimeout(() => dismiss(id), duration),
      )
    },
    [dismiss],
  )

  useEffect(() => {
    const activeTimers = timers.current
    return () => {
      activeTimers.forEach((timer) => clearTimeout(timer))
      activeTimers.clear()
    }
  }, [])

  const api = useMemo<ToastApi>(
    () => ({
      push,
      dismiss,
      success: (title, description, action) =>
        push({ title, description, action, tone: "success" }),
      error: (title, description, action) => push({ title, description, action, tone: "error" }),
      info: (title, description, action) => push({ title, description, action, tone: "info" }),
    }),
    [push, dismiss],
  )

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-24 z-[70] flex flex-col items-center gap-2 px-4 md:bottom-6 md:items-end md:pr-6"
      >
        {toasts.map((toast) => {
          const tone = toast.tone ?? "info"
          const Icon = toneIcons[tone]
          return (
            <div
              key={toast.id}
              role={tone === "error" ? "alert" : "status"}
              className="toast-enter pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border border-line bg-surface p-3 shadow-[0_30px_70px_-30px_rgba(0,0,0,0.95)]"
            >
              <span
                className={cn(
                  "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border",
                  toneStyles[tone],
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink">{toast.title}</p>
                {toast.description ? (
                  <p className="mt-0.5 text-[11px] text-muted">{toast.description}</p>
                ) : null}
                {toast.action ? (
                  <button
                    type="button"
                    onClick={() => {
                      toast.action?.onClick()
                      dismiss(toast.id)
                    }}
                    className="mt-1.5 rounded text-[11px] font-bold text-ember underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember/60"
                  >
                    {toast.action.label}
                  </button>
                ) : null}
              </div>
              <button
                type="button"
                aria-label="Tutup notifikasi"
                onClick={() => dismiss(toast.id)}
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted transition-colors hover:bg-ink/5 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember/60"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastApi {
  const context = useContext(ToastContext)
  if (!context) throw new Error("useToast must be used within ToastProvider")
  return context
}
