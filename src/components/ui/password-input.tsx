"use client"

import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import type { ComponentPropsWithRef, KeyboardEvent } from "react"
import { Input } from "./input"

/**
 * Password field with the reveal toggle and Caps Lock hint that users expect
 * from modern sign-in screens. The typed value is never touched by the toggle.
 */
export function PasswordInput({
  id,
  ref,
  className,
  onKeyDown,
  onKeyUp,
  onBlur,
  ...props
}: Omit<ComponentPropsWithRef<"input">, "type">) {
  const [visible, setVisible] = useState(false)
  const [capsLock, setCapsLock] = useState(false)

  const hintId = id ? `${id}-caps` : undefined

  function syncCapsLock(event: KeyboardEvent<HTMLInputElement>) {
    setCapsLock(event.getModifierState?.("CapsLock") ?? false)
  }

  return (
    <div>
      <div className="relative">
        <Input
          {...props}
          ref={ref}
          id={id}
          type={visible ? "text" : "password"}
          className={className ? `pr-11 ${className}` : "pr-11"}
          aria-describedby={capsLock ? hintId : props["aria-describedby"]}
          onKeyDown={(event) => {
            syncCapsLock(event)
            onKeyDown?.(event)
          }}
          onKeyUp={(event) => {
            syncCapsLock(event)
            onKeyUp?.(event)
          }}
          onBlur={(event) => {
            setCapsLock(false)
            onBlur?.(event)
          }}
        />
        <button
          type="button"
          onClick={() => setVisible((value) => !value)}
          aria-label={visible ? "Sembunyikan password" : "Tampilkan password"}
          aria-pressed={visible}
          aria-controls={id}
          title={visible ? "Sembunyikan password" : "Tampilkan password"}
          className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-xl text-muted transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ember/60"
        >
          {visible ? (
            <EyeOff className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Eye className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </div>
      {capsLock ? (
        <p id={hintId} role="status" className="mt-1.5 text-[11px] font-medium text-warning">
          Caps Lock aktif.
        </p>
      ) : null}
    </div>
  )
}
