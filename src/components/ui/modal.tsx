"use client"

import { useEffect, useRef } from "react"
import type { ReactNode } from "react"
import { cn } from "@/lib/format"

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",")

/**
 * Accessible dialog shell: Escape to close, focus trapped inside, focus
 * restored to the trigger on close, and background scroll locked.
 */
export function Modal({
  open,
  onClose,
  titleId,
  describedBy,
  role = "dialog",
  dismissible = true,
  className,
  children,
}: {
  open: boolean
  onClose: () => void
  titleId?: string
  describedBy?: string
  role?: "dialog" | "alertdialog"
  dismissible?: boolean
  className?: string
  children: ReactNode
}) {
  const panelRef = useRef<HTMLDivElement>(null)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  })

  useEffect(() => {
    if (!open) return

    const panel = panelRef.current
    const previouslyFocused = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow

    const focusableElements = () =>
      Array.from(panel?.querySelectorAll<HTMLElement>(focusableSelector) ?? []).filter(
        (element) => element.offsetParent !== null,
      )

    const first = focusableElements()[0]
    ;(first ?? panel)?.focus()
    document.body.style.overflow = "hidden"

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && dismissible) {
        event.preventDefault()
        onCloseRef.current()
        return
      }

      if (event.key !== "Tab") return

      const elements = focusableElements()
      if (elements.length === 0) {
        event.preventDefault()
        return
      }

      const firstElement = elements[0]
      const lastElement = elements[elements.length - 1]

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }

    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = previousOverflow
      previouslyFocused?.focus?.()
    }
  }, [open, dismissible])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (dismissible && event.target === event.currentTarget) onClose()
      }}
    >
      <div
        ref={panelRef}
        role={role}
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={describedBy}
        tabIndex={-1}
        className={cn(
          "w-full max-w-md overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_40px_100px_-30px_rgba(0,0,0,0.9)] outline-none",
          className,
        )}
      >
        {children}
      </div>
    </div>
  )
}
