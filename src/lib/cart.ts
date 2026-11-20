export interface CartItem {
  id: string
  name: string
  price: number
  stock: number
}

export interface CartLine {
  menuId: string
  name: string
  price: number
  quantity: number
  stock: number
}

export const CART_STORAGE_KEY = "pos.cart.v1"

/** Adds one unit of `item`, merging with an existing line and respecting stock. */
export function addLine(cart: CartLine[], item: CartItem): CartLine[] {
  const existing = cart.find((line) => line.menuId === item.id)

  if (existing) {
    if (existing.quantity + 1 > existing.stock) return cart
    return cart.map((line) =>
      line.menuId === item.id ? { ...line, quantity: line.quantity + 1 } : line,
    )
  }

  if (item.stock <= 0) return cart

  return [
    ...cart,
    { menuId: item.id, name: item.name, price: item.price, quantity: 1, stock: item.stock },
  ]
}

/** Decrements a line, removing it when the last unit is taken out. */
export function decreaseLine(cart: CartLine[], menuId: string): CartLine[] {
  return cart.flatMap((line) => {
    if (line.menuId !== menuId) return [line]
    return line.quantity > 1 ? [{ ...line, quantity: line.quantity - 1 }] : []
  })
}

/** Increments a line without exceeding its stock. */
export function increaseLine(cart: CartLine[], menuId: string): CartLine[] {
  return cart.map((line) =>
    line.menuId === menuId && line.quantity < line.stock
      ? { ...line, quantity: line.quantity + 1 }
      : line,
  )
}

export function removeLine(cart: CartLine[], menuId: string): CartLine[] {
  return cart.filter((line) => line.menuId !== menuId)
}

/** Re-inserts an undone line at its previous position, clamped to current stock. */
export function insertLine(cart: CartLine[], line: CartLine, index: number): CartLine[] {
  if (line.stock <= 0) return cart

  const quantity = Math.min(Math.max(1, Math.floor(line.quantity)), line.stock)
  const restored: CartLine = { ...line, quantity }
  const at = Math.min(Math.max(0, index), cart.length)

  return [...cart.slice(0, at), restored, ...cart.slice(at)]
}

export function cartTotal(cart: CartLine[]): number {
  return cart.reduce((sum, line) => sum + line.price * line.quantity, 0)
}

export function cartCount(cart: CartLine[]): number {
  return cart.reduce((sum, line) => sum + line.quantity, 0)
}

/**
 * Rebuilds a persisted cart from untrusted storage data. Stored prices and
 * names are ignored: current menu data wins, inactive or unknown menus are
 * dropped, and quantities are clamped to available stock.
 */
export function sanitizeCart(raw: unknown, items: CartItem[]): CartLine[] {
  if (!Array.isArray(raw)) return []

  const menuById = new Map(items.map((item) => [item.id, item]))
  const quantities = new Map<string, number>()

  for (const entry of raw) {
    if (!entry || typeof entry !== "object") continue

    const candidate = entry as { menuId?: unknown; quantity?: unknown }
    if (typeof candidate.menuId !== "string") continue
    if (typeof candidate.quantity !== "number" || !Number.isFinite(candidate.quantity)) continue

    const quantity = Math.floor(candidate.quantity)
    if (quantity <= 0) continue

    const menu = menuById.get(candidate.menuId)
    if (!menu || menu.stock <= 0) continue

    const previous = quantities.get(menu.id) ?? 0
    quantities.set(menu.id, previous + quantity)
  }

  const lines: CartLine[] = []
  for (const [menuId, quantity] of quantities) {
    const menu = menuById.get(menuId)
    if (!menu) continue
    lines.push({
      menuId,
      name: menu.name,
      price: menu.price,
      quantity: Math.min(quantity, menu.stock),
      stock: menu.stock,
    })
  }

  return lines
}
