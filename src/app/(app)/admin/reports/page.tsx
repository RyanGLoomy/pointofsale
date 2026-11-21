import { PackageSearch } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { formatFullDate, formatRupiah } from "@/lib/format"
import { buildDailyTotals, buildItemQuantities, REPORT_WINDOW_DAYS } from "@/lib/reports"
import { requirePermission } from "@/lib/session"
import { hasPermission } from "@/lib/permissions"
import { PageHeader } from "@/components/shell/PageHeader"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table"
import { KpiGrid } from "@/components/reports/KpiGrid"
import { SalesChart } from "@/components/reports/SalesChart"
import { TopMenusCard } from "@/components/reports/TopMenusCard"
import { ReportPdfButton } from "@/components/reports/ReportPdfButton"

export const metadata = { title: "Laporan Penjualan" }

export default async function AdminReportsPage() {
  const user = await requirePermission("reports:read")

  const since = new Date(Date.now() - REPORT_WINDOW_DAYS * 86_400_000)
  const [transactions, revenue] = await Promise.all([
    prisma.transaction.findMany({
      where: { createdAt: { gte: since } },
      orderBy: { createdAt: "desc" },
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
        eyebrow="Analitik"
        title="Laporan Penjualan"
        description="Ringkasan performa penjualan berdasarkan transaksi yang tercatat."
        actions={
          <div className="flex items-center gap-2">
            <Badge tone="ember">{REPORT_WINDOW_DAYS} hari terakhir</Badge>
            {hasPermission(user.role, "reports:print") ? (
              <ReportPdfButton
                windowDays={REPORT_WINDOW_DAYS}
                totalRevenue={totalRevenue}
                transactionCount={transactions.length}
                itemCount={itemCount}
                average={average}
                daily={daily}
                topMenus={topRows.map((row) => ({ name: row.name, quantity: row.quantity }))}
              />
            ) : null}
          </div>
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
            <CardTitle>Rekap Harian</CardTitle>
            <Badge tone="neutral">{daily.length} hari</Badge>
          </CardHeader>
          {daily.length === 0 ? (
            <EmptyState icon={PackageSearch} title="Belum ada rekap" description="Rekap muncul setelah ada transaksi." />
          ) : (
            <Table className="min-w-[420px]">
              <THead>
                <TR>
                  <TH>Tanggal</TH>
                  <TH className="text-right">Total Penjualan</TH>
                </TR>
              </THead>
              <TBody>
                {daily.map((entry) => (
                  <TR key={entry.day}>
                    <TD className="text-muted">{formatFullDate(`${entry.day}T00:00:00Z`)}</TD>
                    <TD className="text-right font-semibold tabular-nums">{formatRupiah(entry.total)}</TD>
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
