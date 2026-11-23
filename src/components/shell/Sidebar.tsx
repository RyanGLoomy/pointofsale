"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { CART_STORAGE_KEY } from "@/lib/cart"
import { hasPermission, type Permission } from "@/lib/permissions"
import type { LucideIcon } from "lucide-react"
import {
  BarChart3,
  Crown,
  LayoutDashboard,
  LogOut,
  ReceiptText,
  ShoppingCart,
  Users,
  UtensilsCrossed,
} from "lucide-react"
import { cn } from "@/lib/format"
import { useConfirm } from "@/components/ui/confirm"

interface NavItem {
  href: string
  label: string
  shortLabel: string
  icon: LucideIcon
  permission?: Permission
  roles?: string[]
  exact?: boolean
  prefetch?: boolean
}

const navItems: NavItem[] = [
  {
    href: "/kasir",
    label: "Kasir",
    shortLabel: "Kasir",
    icon: ShoppingCart,
    permission: "transactions:create",
    prefetch: true,
  },
  {
    href: "/admin",
    label: "Admin",
    shortLabel: "Admin",
    icon: LayoutDashboard,
    permission: "users:manage",
    exact: true,
  },
  {
    href: "/admin/accounts",
    label: "Kelola Akun",
    shortLabel: "Akun",
    icon: Users,
    permission: "users:manage",
  },
  {
    href: "/admin/menus",
    label: "Kelola Menu",
    shortLabel: "Menu",
    icon: UtensilsCrossed,
    permission: "menu:manage",
  },
  {
    href: "/admin/transactions",
    label: "Transaksi",
    shortLabel: "Riwayat",
    icon: ReceiptText,
    permission: "transactions:read",
    prefetch: true,
  },
  {
    href: "/admin/reports",
    label: "Laporan",
    shortLabel: "Laporan",
    icon: BarChart3,
    permission: "reports:read",
    prefetch: true,
  },
  { href: "/owner", label: "Owner", shortLabel: "Owner", icon: Crown, roles: ["OWNER"] },
]

const roleLabels: Record<string, string> = {
  KASIR: "Kasir",
  ADMIN: "Admin",
  OWNER: "Owner",
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2)
  const value = parts.map((part) => part[0]?.toUpperCase() ?? "").join("")
  return value || "P"
}

export function Sidebar({ role, name, email }: { role: string; name: string; email: string }) {
  const pathname = usePathname()
  const confirm = useConfirm()
  const visibleItems = navItems.filter((item) => {
    const allowedByPermission = item.permission ? hasPermission(role, item.permission) : true
    const allowedByRole = item.roles ? item.roles.includes(role) : true
    return allowedByPermission && allowedByRole
  })

  async function handleSignOut() {
    const confirmed = await confirm({
      title: "Keluar dari akun?",
      description: "Anda perlu masuk kembali sebelum melayani transaksi berikutnya.",
      confirmLabel: "Keluar",
      tone: "danger",
    })

    if (confirmed) {
      // Never carry one cashier's in-progress cart into the next session.
      window.localStorage.removeItem(CART_STORAGE_KEY)
      await signOut({ redirectTo: "/login" })
    }
  }

  return (
    <nav
      aria-label="Navigasi utama"
      className="fixed inset-x-0 bottom-0 z-40 flex items-stretch border-t border-line bg-surface/95 backdrop-blur md:inset-x-auto md:inset-y-0 md:left-0 md:w-[212px] md:flex-col md:border-r md:border-t-0"
    >
      <div className="hidden items-center gap-2.5 px-4 pb-1 pt-5 md:flex">
        <Link
          href="/kasir"
          aria-label="Point of Sale"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ember text-[#f4f1e9] shadow-[0_18px_38px_-18px_rgba(31,93,72,0.55)]"
        >
          <ShoppingCart className="h-5 w-5" />
        </Link>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold tracking-tight text-ink">Point of Sale</p>
          <p className="truncate text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
            Terminal kasir
          </p>
        </div>
      </div>

      <ul className="flex flex-1 items-stretch justify-between gap-1 px-2 py-2 md:flex-none md:flex-col md:items-stretch md:justify-start md:gap-1 md:px-3 md:py-3">
        {visibleItems.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`)
          const Icon = item.icon
          return (
            <li key={item.href} className="min-w-0 flex-1 md:flex-none">
              <Link
                href={item.href}
                prefetch={item.prefetch}
                aria-label={item.label}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex h-14 w-full flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-semibold transition-colors md:h-10 md:flex-row md:justify-start md:gap-2.5 md:px-3 md:text-sm",
                  active
                    ? "bg-ember-soft text-ember"
                    : "text-muted hover:bg-ink/5 hover:text-ink",
                )}
              >
                {active ? (
                  <span
                    aria-hidden="true"
                    className="absolute left-0 hidden h-5 w-0.5 rounded-full bg-ember md:block"
                  />
                ) : null}
                <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                <span className="max-w-full truncate md:hidden">{item.shortLabel}</span>
                <span className="hidden min-w-0 truncate md:inline">{item.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>

      <div className="hidden flex-col gap-2 border-t border-line p-3 md:flex">
        <div className="flex items-center gap-2.5 rounded-xl bg-surface-2 p-2">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-xs font-bold text-ink"
            aria-hidden="true"
          >
            {initials(name)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-ink">{name}</p>
            <p className="truncate text-[10px] text-muted" title={email}>
              {roleLabels[role] ?? role} · {email}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          className="flex h-9 w-full items-center gap-2.5 rounded-xl px-3 text-sm font-semibold text-muted transition-colors hover:bg-danger/10 hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember/60"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Keluar
        </button>
      </div>

      <button
        type="button"
        aria-label="Keluar"
        title="Keluar"
        onClick={handleSignOut}
        className="flex w-11 items-center justify-center self-center text-muted transition-colors hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember/60 md:hidden"
      >
        <LogOut className="h-5 w-5" aria-hidden="true" />
      </button>
    </nav>
  )
}
