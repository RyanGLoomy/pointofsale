import { headers } from "next/headers"
import { BarChart3 } from "lucide-react"
import { formatDay, formatRupiah } from "@/lib/format"
import { fillDailySeries, REPORT_WINDOW_DAYS, type DailyTotal } from "@/lib/reports"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"

const CHART_HEIGHT = 168

export async function SalesChart({ data }: { data: DailyTotal[] }) {
  const series = fillDailySeries(data, { days: REPORT_WINDOW_DAYS })
  const max = Math.max(1, ...series.map((entry) => entry.total))
  const total = series.reduce((sum, entry) => sum + entry.total, 0)
  const lastIndex = series.length - 1

  const heights = series.map((entry) =>
    entry.total > 0 ? Math.max(10, Math.round((entry.total / max) * CHART_HEIGHT)) : 4,
  )
  const nonce = (await headers()).get("x-nonce") ?? ""
  // Dynamic sizes go through nonced CSS classes instead of inline styles so
  // style-src never needs 'unsafe-inline'.
  const css = [
    `.sales-chart-track{height:${CHART_HEIGHT}px}`,
    ...Array.from(new Set(heights), (height) => `.sales-bar-h-${height}{height:${height}px}`),
  ].join("")

  return (
    <Card>
      <style nonce={nonce} dangerouslySetInnerHTML={{ __html: css }} />
      <CardHeader>
        <div>
          <CardTitle>Penjualan Harian</CardTitle>
          <p className="mt-0.5 text-[11px] text-muted">{REPORT_WINDOW_DAYS} hari terakhir</p>
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
          <div className="sales-chart-track flex items-end gap-1 sm:gap-2">
            {series.map((entry, index) => {
              const hasSales = entry.total > 0
              const height = heights[index]
              return (
                <div
                  key={entry.day}
                  className="flex h-full flex-1 items-end"
                  title={`${formatDay(entry.day)}: ${formatRupiah(entry.total)}`}
                >
                  <div
                    className={
                      hasSales
                        ? `sales-bar-h-${height} w-full rounded-t-md bg-gradient-to-t from-ember/30 to-ember transition-opacity hover:opacity-80`
                        : `sales-bar-h-${height} w-full rounded-t bg-ink/10`
                    }
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
