import { describe, expect, it } from "vitest"
import { cn, formatDateTime, formatDay, formatFullDate, formatRupiah } from "./format"

describe("formatRupiah", () => {
  it("formats whole rupiah with thousand separators", () => {
    expect(formatRupiah(15000)).toBe("Rp 15.000")
  })

  it("formats zero without decimals", () => {
    expect(formatRupiah(0)).toBe("Rp 0")
  })

  it("rounds fractional amounts to the nearest rupiah", () => {
    expect(formatRupiah(15000.6)).toBe("Rp 15.001")
  })

  it("formats millions", () => {
    expect(formatRupiah(1234567)).toBe("Rp 1.234.567")
  })

  it("places the minus sign before the currency prefix", () => {
    expect(formatRupiah(-5000)).toBe("-Rp 5.000")
  })
})

describe("formatDateTime", () => {
  it("returns an Indonesian date and time string", () => {
    const formatted = formatDateTime(new Date("2026-11-19T10:30:00Z"))
    expect(formatted).toContain("2026")
  })

  it("accepts ISO strings", () => {
    const formatted = formatDateTime("2026-01-02T03:04:05Z")
    expect(formatted).toContain("2026")
  })
})

describe("formatDay", () => {
  it("formats a day key as day and short month", () => {
    const formatted = formatDay("2026-11-19")
    expect(formatted).toContain("19")
    expect(formatted).toContain("Nov")
  })
})

describe("cn", () => {
  it("joins truthy class names", () => {
    expect(cn("a", "b")).toBe("a b")
  })

  it("drops falsy values", () => {
    expect(cn("a", null, undefined, false, "c")).toBe("a c")
  })

  it("returns an empty string when nothing is provided", () => {
    expect(cn()).toBe("")
  })
})

describe("formatFullDate", () => {
  it("formats a full Indonesian date with month and year", () => {
    const formatted = formatFullDate("2026-11-19T12:00:00Z")
    expect(formatted).toContain("19")
    expect(formatted).toContain("Nov")
    expect(formatted).toContain("2026")
  })
})
