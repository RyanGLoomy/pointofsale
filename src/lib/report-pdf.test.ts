import { describe, expect, it } from "vitest"
import { buildReportPdfModel, type ReportPdfInput } from "./report-pdf"

const input: ReportPdfInput = {
  generatedAt: new Date("2026-11-21T10:00:00Z"),
  windowDays: 30,
  totalRevenue: 285000,
  transactionCount: 18,
  itemCount: 19,
  average: 15833,
  daily: [{ day: "2026-11-20", total: 150000 }],
  topMenus: [{ name: "Kopi Suroko", quantity: 19 }],
}

describe("buildReportPdfModel", () => {
  it("builds a Jakarta-dated filename", () => {
    expect(buildReportPdfModel(input).fileName).toBe("laporan-penjualan-2026-11-21.pdf")
  })

  it("describes the reporting window", () => {
    expect(buildReportPdfModel(input).period).toContain("30 hari")
  })

  it("includes every KPI, daily row, and top menu", () => {
    const model = buildReportPdfModel(input)
    expect(model.kpi).toHaveLength(4)
    expect(model.dailyRows).toHaveLength(1)
    expect(model.topRows).toHaveLength(1)
    expect(model.dailyRows[0].some((cell) => cell.includes("150.000"))).toBe(true)
    expect(model.topRows[0]).toContain("Kopi Suroko")
  })

  it("renders empty data without throwing", () => {
    const model = buildReportPdfModel({ ...input, daily: [], topMenus: [] })
    expect(model.dailyRows).toEqual([])
    expect(model.topRows).toEqual([])
  })
})
