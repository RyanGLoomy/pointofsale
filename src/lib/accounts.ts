import { z } from "zod"

const name = z.string().trim().min(1, "Nama wajib diisi.").max(80, "Nama terlalu panjang.")
const email = z.email("Email tidak valid.").transform((value) => value.trim().toLowerCase())
const password = z.string().min(8, "Password minimal 8 karakter.").max(128, "Password terlalu panjang.")
const role = z.enum(["KASIR", "ADMIN", "OWNER"])

export const createAccountSchema = z.object({ name, email, password, role })
export const updateAccountSchema = z.object({ name, email, role, active: z.boolean() })
export const resetPasswordSchema = z.object({ password })

export type CreateAccountInput = z.infer<typeof createAccountSchema>
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
