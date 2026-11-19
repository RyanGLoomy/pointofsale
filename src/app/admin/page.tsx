import Link from "next/link"
import {
  ArrowUpRight,
  BarChart3,
  CircleCheck,
  ReceiptText,
  ShoppingCart,
  Users,
  UtensilsCrossed,
  Wallet,
} from "lucide-react"
import { prisma } from "@/lib/prisma"
import { formatDateTime, formatRupiah } from "@/lib/format"
import { productGradient, productInitial } from "@/lib/product-visual"
import { requireUser } from "@/lib/session"
import { AppShell } from "@/components/shell/AppShell"
import { PageHeader } from "@/components/shell/PageHeader"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { StatCard } from "@/components/ui/stat-card"
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table"
import { PaymentMethodBadge } from "@/components/payment-method-badge"

const quickLinks = [
  {
    href: "/admin/menus",
    title: "Kelola Menu",
    description: "Tambah, ubah, dan atur ketersediaan menu.",
    icon: UtensilsCrossed,
  },
  {
    href: "/admin/transactions",
    title: "Riwayat Transaksi",
    description: "Telusuri pembayaran terbaru dari semua kasir.",
    icon: ReceiptText,
  },
  {
    href: "/admin/reports",
    title: "Laporan Penjualan",
    description: "Lihat tren penjualan dan menu terlaris.",
    icon: BarChart3,
  },
]

export default async function AdminDashboardPage() {
  const user = await requireUser(["ADMIN", "OWNER"])

  const [userCount, menuCount, orderCount, transactionCount, revenue, recentTransactions, lowStockMenus] =
    await Promise.all([
      prisma.user.count(),
      prisma.menu.count(),
      prisma.order.count(),
      prisma.transaction.count(),
      prisma.transaction.aggregate({ _sum: { total: true } }),
      prisma.transaction.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          user: { select: { name: true, email: true } },
        },
      }),
      prisma.menu.findMany({
        where: { active: true, stock: { lte: 5 } },
        orderBy: { stock: "asc" },
        take: 5,
      }),
    ])

  const totalRevenue = Number(revenue._sum.total ?? 0)

  return (
    <AppShell user={user}>
      <PageHeader
        eyebrow="Admin"
        title="Ringkasan"
        description="Pantau aktivitas toko dan masuk ke area kerja yang paling sering dipakai."
        actions={<Badge tone="ember">Panel admin</Badge>}
      />

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Pengguna" value={userCount} icon={Users} />
        <StatCard label="Menu" value={menuCount} icon={UtensilsCrossed} />
        <StatCard label="Pesanan" value={orderCount} icon={ShoppingCart} />
        <StatCard label="Transaksi" value={transactionCount} icon={ReceiptText} />
        <StatCard label="Total Penjualan" value={formatRupiah(totalRevenue)} icon={Wallet} accent />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Card className="overflow-hidden">
          <CardHeader>
            <div>
              <CardTitle>Transaksi Terbaru</CardTitle>
              <p className="mt-0.5 text-[11px] text-muted">5 pembayaran terakhir</p>
            </div>
            <Link
              href="/admin/transactions"
              className="text-[11px] font-semibold text-ember transition-colors hover:text-ember-strong"
            >
              Lihat semua
            </Link>
          </CardHeader>

          {recentTransactions.length === 0 ? (
            <EmptyState
              icon={ReceiptText}
              title="Belum ada transaksi"
              description="Transaksi dari terminal kasir akan muncul di sini."
            />
          ) : (
            <Table className="min-w-[520px]">
              <THead>
                <TR>
                  <TH>Waktu</TH>
                  <TH>Kasir</TH>
                  <TH>Metode</TH>
                  <TH className="text-right">Total</TH>
                </TR>
              </THead>
              <TBody>
                {recentTransactions.map((tx) => (
                  <TR key={tx.id}>
                    <TD className="whitespace-nowrap text-xs text-muted">
                      {formatDateTime(tx.createdAt)}
                    </TD>
                    <TD className="font-semibold text-ink">{tx.user?.name ?? tx.user?.email ?? "-"}</TD>
                    <TD>
                      <PaymentMethodBadge method={tx.paymentMethod} />
                    </TD>
                    <TD className="text-right font-bold tabular-nums">
                      {formatRupiah(Number(tx.total))}
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          )}
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Stok Menipis</CardTitle>
              <p className="mt-0.5 text-[11px] text-muted">Menu aktif dengan stok ≤ 5</p>
            </div>
            <Badge tone={lowStockMenus.length > 0 ? "warning" : "success"}>
              {lowStockMenus.length > 0 ? `${lowStockMenus.length} menu` : "Aman"}
            </Badge>
          </CardHeader>

          {lowStockMenus.length === 0 ? (
            <EmptyState
              icon={CircleCheck}
              title="Semua stok aman"
              description="Tidak ada menu aktif yang perlu segera diisi ulang."
            />
          ) : (
            <ul className="divide-y divide-line">
              {lowStockMenus.map((menu) => (
                <li key={menu.id} className="flex items-center gap-3 px-4 py-3">
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-extrabold text-white/90"
                    style={{ backgroundImage: productGradient(menu.name) }}
                  >
                    {productInitial(menu.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">{menu.name}</p>
                    <p className="text-[11px] text-muted">{menu.category ?? "Umum"}</p>
                  </div>
                  <Badge tone={menu.stock <= 0 ? "danger" : "warning"}>
                    {menu.stock <= 0 ? "Habis" : `${menu.stock} tersisa`}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {quickLinks.map((link) => {
          const Icon = link.icon
          return (
            <Link
              key={link.href}
              href={link.href}
              className="group rounded-2xl border border-line bg-surface p-4 transition-colors hover:border-ember/40 hover:bg-surface-2"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ember/10 text-ember">
                  <Icon className="h-5 w-5" />
                </span>
                <ArrowUpRight className="h-4 w-4 text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ember" />
              </div>
              <p className="mt-3 text-sm font-bold text-ink">{link.title}</p>
              <p className="mt-1 text-xs text-muted">{link.description}</p>
            </Link>
          )
        })}
      </div>
    </AppShell>
  )
}

export const dynamic = "force-dynamic"
