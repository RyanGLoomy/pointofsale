import type { Role } from "@prisma/client"

export type Permission =
  | "orders:manage"
  | "transactions:create"
  | "transactions:read"
  | "reports:read"
  | "menu:manage"
  | "users:manage"

const rolePermissions: Record<Role, Permission[]> = {
  KASIR: ["orders:manage", "transactions:create", "transactions:read"],
  ADMIN: [
    "orders:manage",
    "transactions:create",
    "transactions:read",
    "menu:manage",
    "users:manage",
    "reports:read",
  ],
  OWNER: ["orders:manage", "transactions:create", "transactions:read", "reports:read"],
}

export function hasPermission(role: string | undefined, permission: Permission): boolean {
  if (!role) return false
  const allowed = rolePermissions[role as Role] ?? []
  return allowed.includes(permission)
}
