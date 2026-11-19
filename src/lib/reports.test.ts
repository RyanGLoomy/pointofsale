import { describe, expect, it } from "vitest"
import {
  buildDailyTotals,
  buildItemQuantities,
  extractItemQuantities,
  fillDailySeries,
  toAmount,
} from "./reports"

describe("toAmount", () => {
  it("keeps finite numbers", () => {
    expect(toAmount(15000)).toBe(15000)
  })

  it("parses numeric strings", () => {
    expect(toAmount("25000.5")).toBe(25000.5)
  })

  it("handles decimal-like objects", () => {
    expect(toAmount({ toString: () => "9000" })).toBe(9000)
  })

  it("falls back to zero for invalid values", () => {
    expect(toAmount(undefined)).toBe(0)
    expect(toAmount("abc")).toBe(0)
  })
})

describe("extractItemQuantities", () => {
  it("returns an empty list for missing payloads", () => {
    expect(extractItemQuantities(null)).toEqual([])
    expect(extractItemQuantities({})).toEqual([])
  })

  it("returns well-formed items", () => {
    expect(extractItemQuantities({ items: [{ menuId: "a", quantity: 2 }] })).toEqual([
      { menuId: "a", quantity: 2 },
    ])
  })

  it("drops malformed entries", () => {
    const payload = {
      items: [
        { menuId: "a", quantity: 1 },
        { menuId: 42, quantity: 1 },
        { menuId: "b", quantity: 0 },
        { menuId: "c", quantity: "3" },
        null,
      ],
    }
    expect(extractItemQuantities(payload)).toEqual([{ menuId: "a", quantity: 1 }])
  })
})

describe("buildDailyTotals", () => {
  it("groups totals by UTC day and sorts ascending", () => {
    const result = buildDailyTotals([
      { total: 10000, createdAt: "2026-11-19T10:00:00Z", items: null },
      { total: 5000, createdAt: "2026-11-18T22:00:00Z", items: null },
      { total: "2500", createdAt: "2026-11-19T01:00:00Z", items: null },
    ])

    expect(result).toEqual([
      { day: "2026-11-18", total: 5000 },
      { day: "2026-11-19", total: 12500 },
    ])
  })

  it("returns an empty list when there are no transactions", () => {
    expect(buildDailyTotals([])).toEqual([])
  })
})

describe("buildItemQuantities", () => {
  it("aggregates quantities across transactions", () => {
    const result = buildItemQuantities([
      { total: 0, createdAt: "2026-11-19T10:00:00Z", items: { items: [{ menuId: "kopi", quantity: 2 }] } },
      { total: 0, createdAt: "2026-11-19T11:00:00Z", items: { items: [{ menuId: "kopi", quantity: 1 }, { menuId: "teh", quantity: 3 }] } },
    ])

    expect(result.get("kopi")).toBe(3)
    expect(result.get("teh")).toBe(3)
  })

  it("ignores transactions without item data", () => {
    expect(buildItemQuantities([{ total: 0, createdAt: "2026-11-19T10:00:00Z", items: null }]).size).toBe(0)
  })
})

describe("fillDailySeries", () => {
  it("returns a zero-filled window ending on the reference day", () => {
    const result = fillDailySeries([{ day: "2026-11-19", total: 45000 }], {
      days: 3,
      reference: new Date("2026-11-19T12:00:00Z"),
    })

    expect(result).toEqual([
      { day: "2026-11-17", total: 0 },
      { day: "2026-11-18", total: 0 },
      { day: "2026-11-19", total: 45000 },
    ])
  })

  it("handles month boundaries", () => {
    const result = fillDailySeries([{ day: "2026-10-31", total: 1000 }], {
      days: 2,
      reference: new Date("2026-11-01T05:00:00Z"),
    })

    expect(result.map((entry) => entry.day)).toEqual(["2026-10-31", "2026-11-01"])
    expect(result[0].total).toBe(1000)
  })

  it("defaults to a 14 day window", () => {
    expect(fillDailySeries([], { reference: new Date("2026-11-19T12:00:00Z") })).toHaveLength(14)
  })

  it("ignores totals outside the window", () => {
    const result = fillDailySeries([{ day: "2026-01-01", total: 999 }], {
      days: 2,
      reference: new Date("2026-11-19T12:00:00Z"),
    })

    expect(result.every((entry) => entry.total === 0)).toBe(true)
  })
})
