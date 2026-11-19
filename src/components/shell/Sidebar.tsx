"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import type { LucideIcon } from "lucide-react"
import {
  BarChart3,
  Crown,
  LayoutDashboard,
  LogOut,
  ReceiptText,
  ShoppingCart,
  Store,
  UtensilsCrossed,
} from "lucide-react"
import { cn } from "@/lib/format"

interface NavItem {
  href: string
  label: string
  icon: LucideIcon
  roles: string[]
  exact?: boolean
}

const navItems: NavItem[] = [
  { href: "/kasir", label: "Kasir", icon: ShoppingCart, roles: ["KASIR", "ADMIN", "OWNER"] },
  { href: "/admin", label: "Admin", icon: LayoutDashboard, roles: ["ADMIN", "OWNER"], exact: true },
  { href: "/admin/menus", label: "Kelola Menu", icon: UtensilsCrossed, roles: ["ADMIN", "OWNER"] },
  { href: "/admin/transactions", label: "Transaksi", icon: ReceiptText, roles: ["ADMIN", "OWNER"] },
  { href: "/admin/reports", label: "Laporan", icon: BarChart3, roles: ["ADMIN", "OWNER"] },
  { href: "/owner", label: "Owner", icon: Crown, roles: ["OWNER"] },
]

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2)
  const value = parts.map((part) => part[0]?.toUpperCase() ?? "").join("")
  return value || "P"
}

export function Sidebar({ role, name, email }: { role: string; name: string; email: string }) {
  const pathname = usePathname()
  const visibleItems = navItems.filter((item) => item.roles.includes(role))

  async function handleSignOut() {
    await signOut({ redirectTo: "/login" })
  }

  return (
    <nav
      aria-label="Navigasi utama"
      className="fixed inset-x-0 bottom-0 z-40 flex items-stretch border-t border-line bg-surface/95 backdrop-blur md:inset-x-auto md:inset-y-0 md:left-0 md:w-[86px] md:flex-col md:border-r md:border-t-0"
    >
      <div className="hidden h-[88px] items-center justify-center md:flex">
        <Link
          href="/kasir"
          aria-label="Point of Sale"
          className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ember text-[#180a02] shadow-[0_18px_38px_-18px_rgba(255,122,26,1)]"
        >
          <Store className="h-5 w-5" />
        </Link>
      </div>

      <ul className="flex flex-1 items-stretch justify-between gap-1 px-2 py-2 md:flex-none md:flex-col md:items-center md:justify-start md:gap-2 md:px-0 md:py-3">
        {visibleItems.map((item) => {
          const active = item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`)
          const Icon = item.icon
          return (
            <li key={item.href} className="flex-1 md:flex-none">
              <Link
                href={item.href}
                aria-label={item.label}
                aria-current={active ? "page" : undefined}
                title={item.label}
                className={cn(
                  "flex h-11 w-full items-center justify-center rounded-xl transition-colors md:w-11",
                  active ? "bg-ember-soft text-ember" : "text-muted hover:bg-white/5 hover:text-ink",
                )}
              >
                <Icon className="h-5 w-5" />
              </Link>
            </li>
          )
        })}
      </ul>

      <div className="hidden flex-col items-center gap-3 pb-5 md:flex">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface-2 text-xs font-bold text-ink"
          title={`${name} · ${email} · ${role}`}
          aria-label={`${name}, ${role}`}
        >
          {initials(name)}
        </div>
        <button
          type="button"
          aria-label="Keluar"
          title="Keluar"
          onClick={handleSignOut}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-muted transition-colors hover:bg-danger/10 hover:text-danger"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>

      <button
        type="button"
        aria-label="Keluar"
        title="Keluar"
        onClick={handleSignOut}
        className="flex w-11 items-center justify-center self-center text-muted transition-colors hover:text-danger md:hidden"
      >
        <LogOut className="h-5 w-5" />
      </button>
    </nav>
  )
}
