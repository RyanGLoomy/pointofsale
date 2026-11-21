import { z } from "zod"

export const MAX_CHECKOUT_LINES = 50
export const MAX_LINE_QUANTITY = 99

export const checkoutSchema = z.object({
  userId: z.string().min(1, "User wajib diisi."),
  items: z
    .array(
      z.object({
        menuId: z.string().min(1, "Menu wajib valid."),
        quantity: z.number().int().min(1, "Jumlah item tidak valid.").max(MAX_LINE_QUANTITY, "Jumlah item tidak valid."),
      }),
    )
    .min(1, "Item checkout wajib ada.")
    .max(MAX_CHECKOUT_LINES, `Maksimal ${MAX_CHECKOUT_LINES} item per transaksi.`)
    .refine((lines) => new Set(lines.map((line) => line.menuId)).size === lines.length, {
      message: "Menu duplikat dalam satu transaksi.",
    }),
  paymentMethod: z.enum(["CASH", "CARD", "QRIS"], "Metode pembayaran tidak valid."),
})

export type CheckoutInput = z.infer<typeof checkoutSchema>

export type CheckoutValidationResult =
  | { ok: true; value: CheckoutInput }
  | { ok: false; error: string }

export function validateCheckoutInput(input: unknown): CheckoutValidationResult {
  const result = checkoutSchema.safeParse(input)

  if (!result.success) {
    const firstIssue = result.error.issues[0]
    const message = firstIssue?.message ?? "Payload checkout tidak valid."

    return { ok: false, error: message }
  }

  return { ok: true, value: result.data }
}
