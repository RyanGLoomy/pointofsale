import Link from "next/link"
import { ReceiptText } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { formatDateTime, formatRupiah } from "@/lib/format"
import { buildDailyTotals, buildItemQuantities, REPORT_WINDOW_DAYS } from "@/lib/reports"
import { requireUser } from "@/lib/session"
import { PageHeader } from "@/components/shell/PageHeader"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table"
import { KpiGrid } from "@/components/reports/KpiGrid"
import { SalesChart } from "@/components/reports/SalesChart"
import { TopMenusCard } from "@/components/reports/TopMenusCard"

export const metadata = { title: "Owner" }

export default async function OwnerPage() {
  await requireUser(["OWNER"])

  const since = new Date(Date.now() - REPORT_WINDOW_DAYS * 86_400_000)
  const [transactions, revenue] = await Promise.all([
    prisma.transaction.findMany({
      where: { createdAt: { gte: since } },
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { id: true, email: true, name: true, role: true },
        },
      },
    }),
    prisma.transaction.aggregate({ where: { createdAt: { gte: since } }, _sum: { total: true } }),
  ])

  const totalRevenue = Number(revenue._sum.total ?? 0)
  const daily = buildDailyTotals(transactions)
  const quantities = buildItemQuantities(transactions)
  const itemCount = Array.from(quantities.values()).reduce((sum, quantity) => sum + quantity, 0)
  const average = transactions.length > 0 ? totalRevenue / transactions.length : 0

  const topEntries = Array.from(quantities.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  const topMenus = await prisma.menu.findMany({
    where: { id: { in: topEntries.map(([menuId]) => menuId) } },
    select: { id: true, name: true },
  })

  const topRows = topEntries.map(([menuId, quantity]) => ({
    menuId,
    name: topMenus.find((menu) => menu.id === menuId)?.name ?? "Menu dihapus",
    quantity,
  }))

  return (
    <>
      <PageHeader
        eyebrow="Owner"
        title="Laporan Penjualan"
        description="Ringkasan omzet, transaksi, dan menu terlaris milik toko."
        actions={
          <Link
            href="/admin/reports"
            className="inline-flex h-9 items-center rounded-xl border border-line bg-surface-2 px-3 text-xs font-semibold text-muted transition-colors hover:text-ink"
          >
            Laporan lengkap
          </Link>
        }
      />

      <div className="mt-6 space-y-4">
        <KpiGrid
          totalRevenue={totalRevenue}
          transactionCount={transactions.length}
          itemCount={itemCount}
          average={average}
        />

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <SalesChart data={daily} />

          <TopMenusCard rows={topRows} />
        </div>

        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Transaksi Terbaru</CardTitle>
            <Badge tone="neutral">{transactions.length} transaksi</Badge>
          </CardHeader>
          {transactions.length === 0 ? (
            <EmptyState
              icon={ReceiptText}
              title="Belum ada transaksi"
              description="Transaksi dari terminal kasir akan muncul di sini."
            />
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>Waktu</TH>
                  <TH>Kasir</TH>
                  <TH className="text-right">Total</TH>
                </TR>
              </THead>
              <TBody>
                {transactions.slice(0, 10).map((tx) => (
                  <TR key={tx.id}>
                    <TD className="whitespace-nowrap text-xs text-muted">{formatDateTime(tx.createdAt)}</TD>
                    <TD className="font-semibold text-ink">{tx.user?.name ?? tx.user?.email ?? "-"}</TD>
                    <TD className="text-right font-bold tabular-nums">{formatRupiah(Number(tx.total))}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          )}
        </Card>
      </div>
    </>
  )
}

export const dynamic = "force-dynamic"
