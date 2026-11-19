const rupiahFormatter = new Intl.NumberFormat("id-ID")

const dateTimeFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
})

const fullDateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "short",
  year: "numeric",
})

export function formatRupiah(value: number): string {
  const rounded = Math.round(value)
  const sign = rounded < 0 ? "-" : ""
  return `${sign}Rp ${rupiahFormatter.format(Math.abs(rounded))}`
}

export function formatDateTime(value: Date | string): string {
  return dateTimeFormatter.format(new Date(value))
}

export function formatFullDate(value: Date | string): string {
  return fullDateFormatter.format(new Date(value))
}

export function formatDay(value: string): string {
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short" }).format(
    new Date(`${value}T00:00:00`),
  )
}

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ")
}
