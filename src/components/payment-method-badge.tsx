import { Badge, type BadgeTone } from "@/components/ui/badge"

const labels = {
  CASH: "Tunai",
  CARD: "Kartu",
  QRIS: "QRIS",
} as const

const tones: Record<keyof typeof labels, BadgeTone> = {
  CASH: "success",
  CARD: "info",
  QRIS: "warning",
}

export function PaymentMethodBadge({ method }: { method: string }) {
  const key = method as keyof typeof labels
  return <Badge tone={tones[key] ?? "neutral"}>{labels[key] ?? method}</Badge>
}
