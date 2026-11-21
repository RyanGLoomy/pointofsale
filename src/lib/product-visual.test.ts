import { describe, expect, it } from "vitest"
import { productGradient, productInitial } from "./product-visual"

// The Pasar design language uses muted earth tones, not saturated neon.
const EARTH_TONES = new Set([
  "#A6533A", "#74392A",
  "#5C7049", "#3C4B30",
  "#9C6B48", "#6E482F",
  "#2F6B53", "#1D4736",
  "#A38342", "#755C28",
  "#7A4F5A", "#54343D",
  "#3E6A6A", "#274646",
  "#5B4A6B", "#3B2F49",
])

describe("productGradient", () => {
  it("returns a deterministic gradient for the same seed", () => {
    expect(productGradient("Kopi Suroko")).toBe(productGradient("Kopi Suroko"))
  })

  it("only uses muted earth tones from the Pasar palette", () => {
    const seeds = ["Kopi Suroko", "Teh Tarik", "Nasi Goreng", "", "Ayam Bakar", "Es Teh", "Roti Bakar", "Soto Ayam"]

    for (const seed of seeds) {
      const colors = productGradient(seed).match(/#[0-9a-fA-F]{6}/g) ?? []
      expect(colors).toHaveLength(2)
      for (const color of colors) {
        expect(EARTH_TONES.has(color.toUpperCase()), `${seed} -> ${color}`).toBe(true)
      }
    }
  })

  it("returns a linear gradient", () => {
    expect(productGradient("Teh Tarik")).toMatch(/^linear-gradient\(135deg, #[0-9a-f]{6} 0%, #[0-9a-f]{6} 100%\)$/)
  })

  it("handles an empty seed", () => {
    expect(productGradient("")).toMatch(/^linear-gradient\(135deg/)
  })
})

describe("productInitial", () => {
  it("uses the first letter of the name", () => {
    expect(productInitial("Kopi Suroko")).toBe("K")
  })

  it("trims leading whitespace", () => {
    expect(productInitial("  teh tarik")).toBe("T")
  })

  it("falls back to a question mark when the name is empty", () => {
    expect(productInitial("   ")).toBe("?")
  })
})
