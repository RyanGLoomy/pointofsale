import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import { formatFullDate, formatRupiah } from "@/lib/format"
import { jakartaDayKey } from "@/lib/reports"
import { STORE_PROFILE } from "@/lib/receipt"

export interface ReportPdfInput {
  generatedAt: Date
  windowDays: number
  totalRevenue: number
  transactionCount: number
  itemCount: number
  average: number
  daily: { day: string; total: number }[]
  topMenus: { name: string; quantity: number }[]
}

export interface ReportPdfModel {
  fileName: string
  period: string
  kpi: string[][]
  dailyRows: string[][]
  topRows: string[][]
}

/** Pure transformation so the PDF content can be unit-tested without jsPDF. */
export function buildReportPdfModel(input: ReportPdfInput): ReportPdfModel {
  return {
    fileName: `laporan-penjualan-${jakartaDayKey(input.generatedAt)}.pdf`,
    period: `${input.windowDays} hari terakhir s/d ${formatFullDate(input.generatedAt)}`,
    kpi: [
      ["Total Penjualan", formatRupiah(input.totalRevenue)],
      ["Jumlah Transaksi", String(input.transactionCount)],
      ["Item Terjual", String(input.itemCount)],
      ["Rata-rata Transaksi", formatRupiah(input.average)],
    ],
    dailyRows: input.daily.map((entry) => [
      formatFullDate(`${entry.day}T00:00:00Z`),
      formatRupiah(entry.total),
    ]),
    topRows: input.topMenus.map((entry, index) => [
      String(index + 1),
      entry.name,
      `${entry.quantity} terjual`,
    ]),
  }
}

const HEAD_STYLES = { fillColor: [31, 93, 72] as [number, number, number], textColor: 255 }
const ALTERNATE_ROW_STYLES = { fillColor: [244, 241, 233] as [number, number, number] }

/** Generates and downloads the sales report as an A4 PDF in the browser. */
export function downloadReportPdf(input: ReportPdfInput): void {
  const model = buildReportPdfModel(input)
  const doc = new jsPDF({ unit: "mm", format: "a4" })

  doc.setFont("helvetica", "bold")
  doc.setFontSize(16)
  doc.text("Laporan Penjualan", 14, 18)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)
  doc.text(STORE_PROFILE.name, 14, 26)
  doc.text(`Periode: ${model.period}`, 14, 32)

  autoTable(doc, {
    startY: 38,
    head: [["Metrik", "Nilai"]],
    body: model.kpi,
    theme: "grid",
    headStyles: HEAD_STYLES,
    alternateRowStyles: ALTERNATE_ROW_STYLES,
  })

  const afterKpi = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10

  autoTable(doc, {
    startY: afterKpi,
    head: [["Tanggal", "Total Penjualan"]],
    body: model.dailyRows,
    theme: "grid",
    headStyles: HEAD_STYLES,
    alternateRowStyles: ALTERNATE_ROW_STYLES,
  })

  const afterDaily = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10

  autoTable(doc, {
    startY: afterDaily,
    head: [["#", "Menu", "Terjual"]],
    body: model.topRows,
    theme: "grid",
    headStyles: HEAD_STYLES,
    alternateRowStyles: ALTERNATE_ROW_STYLES,
  })

  doc.save(model.fileName)
}
