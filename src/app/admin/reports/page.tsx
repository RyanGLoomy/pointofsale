import { PackageSearch } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { formatFullDate, formatRupiah } from "@/lib/format"
import { buildDailyTotals, buildItemQuantities, toAmount } from "@/lib/reports"
import { requireUser } from "@/lib/session"
import { AppShell } from "@/components/shell/AppShell"
import { PageHeader } from "@/components/shell/PageHeader"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table"
import { KpiGrid } from "@/components/reports/KpiGrid"
import { SalesChart } from "@/components/reports/SalesChart"
import { TopMenusCard } from "@/components/reports/TopMenusCard"

export default async function AdminReportsPage() {
  const user = await requireUser(["ADMIN", "OWNER"])

  const transactions = await prisma.transaction.findMany({
    orderBy: { createdAt: "desc" },
  })

  const totalRevenue = transactions.reduce((sum, tx) => sum + toAmount(tx.total), 0)
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
    <AppShell user={user}>
      <PageHeader
        eyebrow="Analitik"
        title="Laporan Penjualan"
        description="Ringkasan performa penjualan berdasarkan transaksi yang tercatat."
        actions={<Badge tone="ember">Semua waktu</Badge>}
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
    </AppShell>
  )
}

export const dynamic = "force-dynamic"
