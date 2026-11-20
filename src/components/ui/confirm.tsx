"use client"

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react"
import type { ReactNode } from "react"
import { Button } from "./button"
import { Modal } from "./modal"

export interface ConfirmOptions {
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  tone?: "danger" | "default"
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>

const ConfirmContext = createContext<ConfirmFn | null>(null)

/**
 * Promise-based confirmation dialog. Callers await the user's decision instead
 * of threading open/close state through every destructive action.
 */
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null)
  const resolver = useRef<((value: boolean) => void) | null>(null)

  const finish = useCallback((value: boolean) => {
    resolver.current?.(value)
    resolver.current = null
    setOptions(null)
  }, [])

  const confirm = useCallback<ConfirmFn>((nextOptions) => {
    resolver.current?.(false)
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve
      setOptions(nextOptions)
    })
  }, [])

  useEffect(() => {
    return () => {
      resolver.current?.(false)
      resolver.current = null
    }
  }, [])

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Modal
        open={options !== null}
        onClose={() => finish(false)}
        role="alertdialog"
        titleId="confirm-title"
        describedBy="confirm-description"
        className="max-w-sm"
      >
        {options ? (
          <>
            <div className="px-5 py-4">
              <h2 id="confirm-title" className="text-base font-bold tracking-tight text-ink">
                {options.title}
              </h2>
              {options.description ? (
                <p id="confirm-description" className="mt-1.5 text-sm leading-relaxed text-muted">
                  {options.description}
                </p>
              ) : null}
            </div>
            <div className="flex gap-2 border-t border-line p-4">
              <Button variant="secondary" className="flex-1" onClick={() => finish(false)}>
                {options.cancelLabel ?? "Batal"}
              </Button>
              <Button
                variant={options.tone === "danger" ? "danger" : "primary"}
                className="flex-1"
                onClick={() => finish(true)}
              >
                {options.confirmLabel ?? "Lanjutkan"}
              </Button>
            </div>
          </>
        ) : null}
      </Modal>
    </ConfirmContext.Provider>
  )
}

export function useConfirm(): ConfirmFn {
  const context = useContext(ConfirmContext)
  if (!context) throw new Error("useConfirm must be used within ConfirmProvider")
  return context
}
