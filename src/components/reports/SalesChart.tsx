import { BarChart3 } from "lucide-react"
import { formatDay, formatRupiah } from "@/lib/format"
import { fillDailySeries, type DailyTotal } from "@/lib/reports"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"

const CHART_HEIGHT = 168

export function SalesChart({ data }: { data: DailyTotal[] }) {
  const series = fillDailySeries(data)
  const max = Math.max(1, ...series.map((entry) => entry.total))
  const total = series.reduce((sum, entry) => sum + entry.total, 0)
  const lastIndex = series.length - 1

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Penjualan Harian</CardTitle>
          <p className="mt-0.5 text-[11px] text-muted">14 hari terakhir</p>
        </div>
        <span className="text-sm font-bold tabular-nums text-ember">{formatRupiah(total)}</span>
      </CardHeader>

      {total === 0 ? (
        <EmptyState
          icon={BarChart3}
          title="Belum ada penjualan"
          description="Grafik akan muncul setelah transaksi pertama tercatat."
        />
      ) : (
        <div className="p-4">
          <div className="flex items-end gap-1 sm:gap-2" style={{ height: CHART_HEIGHT }}>
            {series.map((entry) => {
              const hasSales = entry.total > 0
              const height = hasSales
                ? Math.max(10, Math.round((entry.total / max) * CHART_HEIGHT))
                : 4
              return (
                <div
                  key={entry.day}
                  className="flex h-full flex-1 items-end"
                  title={`${formatDay(entry.day)}: ${formatRupiah(entry.total)}`}
                >
                  <div
                    className={
                      hasSales
                        ? "w-full rounded-t-md bg-gradient-to-t from-ember/30 to-ember transition-opacity hover:opacity-80"
                        : "w-full rounded-t bg-white/10"
                    }
                    style={{ height }}
                  />
                </div>
              )
            })}
          </div>

          <div className="mt-2 flex items-center justify-between gap-1 border-t border-line pt-2">
            {series.map((entry, index) => {
              const visible = index % 3 === 0 || index === lastIndex
              return (
                <span
                  key={entry.day}
                  className="flex-1 whitespace-nowrap text-center text-[10px] text-muted"
                >
                  {visible ? formatDay(entry.day) : "\u00a0"}
                </span>
              )
            })}
          </div>
        </div>
      )}
    </Card>
  )
}
