import { describe, expect, it } from "vitest"
import { hasPermission, type Permission, type Role } from "./permissions"

const ALL: Permission[] = [
  "orders:manage",
  "transactions:create",
  "transactions:read",
  "receipt:print:own",
  "menu:manage",
  "users:manage",
  "reports:read",
  "reports:print",
]

const expected: Record<Role, Permission[]> = {
  KASIR: ["orders:manage", "transactions:create", "receipt:print:own"],
  ADMIN: ["users:manage", "menu:manage", "reports:read", "reports:print", "transactions:read"],
  OWNER: ["reports:read", "transactions:read"],
}

describe("RBAC v2 permission matrix", () => {
  for (const role of Object.keys(expected) as Role[]) {
    describe(role, () => {
      it.each(ALL)("grants exactly the intended access for %s", (permission) => {
        expect(hasPermission(role, permission)).toBe(expected[role].includes(permission))
      })
    })
  }

  it("denies every permission for an unknown role", () => {
    for (const permission of ALL) {
      expect(hasPermission("UNKNOWN", permission)).toBe(false)
    }
  })

  it("denies every permission when the role is missing", () => {
    for (const permission of ALL) {
      expect(hasPermission(undefined, permission)).toBe(false)
    }
  })
})
