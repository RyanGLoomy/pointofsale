import { describe, expect, it } from "vitest"
import {
  calculateChange,
  digitsOnly,
  formatAmountInput,
  isCashEnough,
  parseAmountInput,
  quickCashOptions,
  roundUpTo,
} from "./money"

describe("digitsOnly", () => {
  it("keeps digits and drops separators", () => {
    expect(digitsOnly("1.500.000")).toBe("1500000")
  })

  it("drops currency prefixes and letters", () => {
    expect(digitsOnly("Rp 15.000")).toBe("15000")
  })

  it("returns an empty string when there are no digits", () => {
    expect(digitsOnly("abc")).toBe("")
  })
})

describe("parseAmountInput", () => {
  it("parses a masked amount", () => {
    expect(parseAmountInput("1.500.000")).toBe(1500000)
  })

  it("treats an empty input as zero", () => {
    expect(parseAmountInput("")).toBe(0)
  })

  it("treats a non-numeric input as zero", () => {
    expect(parseAmountInput("abc")).toBe(0)
  })

  it("drops leading zeros", () => {
    expect(parseAmountInput("000500")).toBe(500)
  })
})

describe("formatAmountInput", () => {
  it("groups thousands with dots", () => {
    expect(formatAmountInput(1500000)).toBe("1.500.000")
  })

  it("formats digit strings", () => {
    expect(formatAmountInput("1500000")).toBe("1.500.000")
  })

  it("keeps an empty input empty", () => {
    expect(formatAmountInput("")).toBe("")
  })

  it("formats zero", () => {
    expect(formatAmountInput(0)).toBe("0")
  })

  it("treats separators as grouping", () => {
    expect(formatAmountInput("Rp 15.000")).toBe("15.000")
  })

  it("returns an empty string when the input has no digits", () => {
    expect(formatAmountInput("abc")).toBe("")
  })
})

describe("roundUpTo", () => {
  it("rounds up to the next step", () => {
    expect(roundUpTo(15000, 50000)).toBe(50000)
  })

  it("keeps an exact multiple unchanged", () => {
    expect(roundUpTo(150000, 50000)).toBe(150000)
  })

  it("returns zero for zero", () => {
    expect(roundUpTo(0, 50000)).toBe(0)
  })
})

describe("quickCashOptions", () => {
  it("starts with the exact total and adds familiar banknote sizes", () => {
    expect(quickCashOptions(15000)).toEqual([15000, 50000, 100000])
  })

  it("never duplicates an option", () => {
    const options = quickCashOptions(50000)
    expect(options).toEqual([50000, 100000, 200000])
    expect(new Set(options).size).toBe(options.length)
  })

  it("always sorts ascending", () => {
    const options = quickCashOptions(120000)
    expect(options).toEqual([...options].sort((a, b) => a - b))
    expect(options[0]).toBe(120000)
  })

  it("returns no options for a non-positive total", () => {
    expect(quickCashOptions(0)).toEqual([])
  })
})

describe("calculateChange", () => {
  it("returns the difference when the cash is sufficient", () => {
    expect(calculateChange(100000, 15000)).toBe(85000)
  })

  it("returns a negative number when the cash is short", () => {
    expect(calculateChange(10000, 15000)).toBe(-5000)
  })

  it("returns zero for exact cash", () => {
    expect(calculateChange(15000, 15000)).toBe(0)
  })
})

describe("isCashEnough", () => {
  it("accepts exact cash", () => {
    expect(isCashEnough(15000, 15000)).toBe(true)
  })

  it("rejects short cash", () => {
    expect(isCashEnough(14999, 15000)).toBe(false)
  })

  it("rejects negative cash", () => {
    expect(isCashEnough(-1, 15000)).toBe(false)
  })
})
