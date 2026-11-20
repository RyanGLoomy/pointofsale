"use client"

import { useMemo, useState } from "react"
import { Printer, ReceiptText } from "lucide-react"
import { formatDateTime, formatRupiah } from "@/lib/format"
import {
  buildReceiptNumber,
  PAYMENT_LABELS,
  type PaymentMethod,
  type ReceiptData,
} from "@/lib/receipt"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { Modal } from "@/components/ui/modal"
import { Segmented, type SegmentedOption } from "@/components/ui/segmented"
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table"
import { ReceiptView } from "@/components/receipt/ReceiptView"

export interface TransactionRow {
  id: string
  orderId: string | null
  createdAt: string
  total: number
  paymentMethod: PaymentMethod
  cashierName: string
  cashierRole: string
  lines: { name: string; quantity: number; price: number }[]
}

type Filter = "ALL" | PaymentMethod

const filterOptions: SegmentedOption<Filter>[] = [
  { value: "ALL", label: "Semua" },
  { value: "CASH", label: PAYMENT_LABELS.CASH },
  { value: "CARD", label: PAYMENT_LABELS.CARD },
  { value: "QRIS", label: PAYMENT_LABELS.QRIS },
]

export function TransactionHistory({ rows }: { rows: TransactionRow[] }) {
  const [filter, setFilter] = useState<Filter>("ALL")
  const [selected, setSelected] = useState<TransactionRow | null>(null)

  const visibleRows = useMemo(
    () => (filter === "ALL" ? rows : rows.filter((row) => row.paymentMethod === filter)),
    [rows, filter],
  )

  const selectedReceipt: ReceiptData | null = selected
    ? {
        orderId: selected.orderId ?? selected.id,
        total: selected.total,
        method: selected.paymentMethod,
        createdAt: selected.createdAt,
        lines: selected.lines,
        cashierName: selected.cashierName,
      }
    : null

  return (
    <>
      <Card className="mt-4 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
          <div>
            <h2 className="text-sm font-bold tracking-tight text-ink">Daftar Transaksi</h2>
            <p className="mt-0.5 text-[11px] text-muted">
              {visibleRows.length} dari {rows.length} transaksi
            </p>
          </div>
          <Segmented
            options={filterOptions}
            value={filter}
            onChange={setFilter}
            ariaLabel="Filter metode pembayaran"
            className="w-full sm:w-auto"
          />
        </div>

        {visibleRows.length === 0 ? (
          <EmptyState
            icon={ReceiptText}
            title={rows.length === 0 ? "Belum ada transaksi" : "Tidak ada transaksi untuk filter ini"}
            description={
              rows.length === 0
                ? "Transaksi dari terminal kasir akan muncul di sini."
                : "Pilih metode pembayaran lain untuk melihat transaksi lainnya."
            }
          />
        ) : (
          <Table>
            <THead>
              <TR>
                <TH>Waktu</TH>
                <TH>Kasir</TH>
                <TH>No. Struk</TH>
                <TH>Metode</TH>
                <TH className="text-right">Total</TH>
                <TH className="text-right">Aksi</TH>
              </TR>
            </THead>
            <TBody>
              {visibleRows.map((row) => {
                const receiptNumber = buildReceiptNumber(row.orderId ?? row.id, row.createdAt)
                return (
                  <TR key={row.id}>
                    <TD className="whitespace-nowrap text-xs text-muted">
                      {formatDateTime(row.createdAt)}
                    </TD>
                    <TD>
                      <div className="font-semibold text-ink">{row.cashierName}</div>
                      <div className="text-[11px] capitalize text-muted">{row.cashierRole.toLowerCase()}</div>
                    </TD>
                    <TD className="font-mono text-[11px] text-muted">{receiptNumber}</TD>
                    <TD>
                      <Badge tone={row.paymentMethod === "CASH" ? "success" : row.paymentMethod === "CARD" ? "info" : "warning"}>
                        {PAYMENT_LABELS[row.paymentMethod]}
                      </Badge>
                    </TD>
                    <TD className="text-right font-bold tabular-nums">{formatRupiah(row.total)}</TD>
                    <TD>
                      <div className="flex justify-end">
                        <Button
                          variant="secondary"
                          size="sm"
                          aria-label={`Lihat detail transaksi ${receiptNumber}`}
                          onClick={() => setSelected(row)}
                        >
                          Detail
                        </Button>
                      </div>
                    </TD>
                  </TR>
                )
              })}
            </TBody>
          </Table>
        )}
      </Card>

      <Modal
        open={selectedReceipt !== null}
        onClose={() => setSelected(null)}
        titleId="transaction-title"
        className="max-w-md"
      >
        {selectedReceipt ? (
          <>
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <div>
                <h2 id="transaction-title" className="text-sm font-bold text-ink">
                  Detail Transaksi
                </h2>
                <p className="font-mono text-[11px] text-muted">
                  {buildReceiptNumber(selectedReceipt.orderId, selectedReceipt.createdAt)}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelected(null)}>
                Tutup
              </Button>
            </div>

            <div className="max-h-[68vh] overflow-y-auto p-4">
              <ReceiptView data={selectedReceipt} />
            </div>

            <div className="flex gap-2 border-t border-line p-4">
              <Button variant="secondary" className="flex-1" onClick={() => window.print()}>
                <Printer className="h-4 w-4" aria-hidden="true" />
                Cetak Ulang
              </Button>
              <Button className="flex-1" onClick={() => setSelected(null)}>
                Selesai
              </Button>
            </div>
          </>
        ) : null}
      </Modal>
    </>
  )
}
