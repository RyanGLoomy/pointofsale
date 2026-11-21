import type { Role } from "@/generated/client"

export type { Role }

export type Permission =
  | "orders:manage"
  | "transactions:create"
  | "transactions:read"
  | "receipt:print:own"
  | "menu:manage"
  | "users:manage"
  | "reports:read"
  | "reports:print"

const rolePermissions: Record<Role, Permission[]> = {
  KASIR: ["orders:manage", "transactions:create", "receipt:print:own"],
  ADMIN: ["users:manage", "menu:manage", "reports:read", "reports:print", "transactions:read"],
  OWNER: ["reports:read", "transactions:read"],
}

export function hasPermission(role: string | undefined, permission: Permission): boolean {
  if (!role) return false
  const allowed = rolePermissions[role as Role] ?? []
  return allowed.includes(permission)
}
