const amountFormatter = new Intl.NumberFormat("id-ID")

/**
 * Keeps only the digits of a user-typed amount, so "Rp 1.500.000" becomes
 * "1500000". Used by masked currency inputs.
 */
export function digitsOnly(value: string): string {
  return value.replace(/\D+/g, "")
}

/** Parses a masked or raw amount input into a whole rupiah integer. */
export function parseAmountInput(value: string): number {
  const digits = digitsOnly(value)
  return digits.length > 0 ? Number(digits) : 0
}

/** Formats an amount for a masked text input: 1500000 -> "1.500.000". */
export function formatAmountInput(value: string | number): string {
  if (value === "") return ""
  const digits = digitsOnly(String(value))
  if (digits.length === 0) return ""
  return amountFormatter.format(Number(digits))
}

/** Rounds a value up to the next multiple of `step`. */
export function roundUpTo(value: number, step: number): number {
  if (value <= 0 || step <= 0) return Math.max(0, value)
  return Math.ceil(value / step) * step
}

/**
 * Familiar cash amounts for quick-tender buttons: the exact total followed by
 * rounded banknote sizes, ascending, without duplicates.
 */
export function quickCashOptions(total: number): number[] {
  if (total <= 0) return []

  const candidates = [total, roundUpTo(total, 50_000), roundUpTo(total, 100_000), roundUpTo(total, 200_000)]
  const unique = Array.from(new Set(candidates.filter((value) => value >= total)))
  return unique.sort((a, b) => a - b).slice(0, 3)
}

/** Change owed to the customer. Negative means the cash is still short. */
export function calculateChange(received: number, total: number): number {
  return Math.round(received) - Math.round(total)
}

/** True when the received cash covers the total. */
export function isCashEnough(received: number, total: number): boolean {
  return received >= total && received > 0
}
