"use client"

import { useMemo, useState } from "react"
import { checkoutPOS } from "@/actions/orders"

export interface PosItem {
  id: string
  name: string
  price: number
  stock: number
  category?: string | null
}

interface CartLine {
  menuId: string
  name: string
  price: number
  quantity: number
  stock: number
}

interface Receipt {
  orderId: string
  total: number
}

export function PosTerminal({ items, userId }: { items: PosItem[]; userId: string }) {
  const [cart, setCart] = useState<CartLine[]>([])
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "CARD" | "QRIS">("CASH")
  const [receipt, setReceipt] = useState<Receipt | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  const total = useMemo(() => cart.reduce((sum, line) => sum + line.price * line.quantity, 0), [cart])

  function addToCart(item: PosItem) {
    setCart((prev) => {
      const existing = prev.find((line) => line.menuId === item.id)
      if (existing) {
        if (existing.quantity + 1 > existing.stock) return prev
        return prev.map((line) => (line.menuId === item.id ? { ...line, quantity: line.quantity + 1 } : line))
      }
      return [
        ...prev,
        { menuId: item.id, name: item.name, price: item.price, quantity: 1, stock: item.stock },
      ]
    })
  }

  async function handleCheckout() {
    setPending(true)
    setError(null)

    try {
      const result = await checkoutPOS({
        userId,
        items: cart.map((line) => ({ menuId: line.menuId, quantity: line.quantity })),
        paymentMethod,
      })

      setReceipt({ orderId: result.orderId, total: result.total })
      setCart([])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memproses transaksi.")
    } finally {
      setPending(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Kasir — Point of Sale</h1>
          <span className="text-sm text-slate-500">Transaksi akan dicatat otomatis.</span>
        </header>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
          <section className="rounded-xl border bg-white p-4">
            <h2 className="font-semibold">Menu</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => addToCart(item)}
                  className="rounded-lg border p-3 text-left disabled:opacity-50"
                  disabled={item.stock <= 0}
                >
                  <div className="font-medium">{item.name}</div>
                  <div className="text-sm text-slate-500">{item.category ?? "Umum"}</div>
                  <div className="mt-1 text-sm font-semibold">Rp {item.price.toFixed(2)}</div>
                  <div className="text-xs text-slate-500">Stok: {item.stock}</div>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-xl border bg-white p-4">
            <h2 className="font-semibold">Keranjang</h2>

            {cart.length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">Keranjang kosong.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {cart.map((line) => (
                  <li key={line.menuId} className="flex items-center justify-between text-sm">
                    <span>
                      {line.name} × {line.quantity}
                    </span>
                    <span>Rp {(line.price * line.quantity).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-4 border-t pt-3">
              <div className="flex items-center justify-between font-semibold">
                <span>Total</span>
                <span>Rp {total.toFixed(2)}</span>
              </div>

              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as "CASH" | "CARD" | "QRIS")}
                className="mt-3 w-full rounded-md border px-2 py-2 text-sm"
              >
                <option value="CASH">Tunai</option>
                <option value="CARD">Kartu</option>
                <option value="QRIS">QRIS</option>
              </select>

              <button
                type="button"
                onClick={handleCheckout}
                disabled={pending || cart.length === 0}
                className="mt-3 w-full rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
              >
                {pending ? "Memproses..." : "Checkout & Catat Transaksi"}
              </button>

              {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
            </div>
          </section>
        </div>

        {receipt ? (
          <div className="receipt mt-6 rounded-xl border bg-white p-6">
            <h2 className="font-semibold">Struk Transaksi</h2>
            <p className="mt-2 text-sm">Order: {receipt.orderId}</p>
            <p className="mt-1 text-xl font-bold">Total: Rp {receipt.total.toFixed(2)}</p>
            <button type="button" onClick={() => window.print()} className="mt-4 rounded-md border px-3 py-2 text-sm">
              Cetak Struk
            </button>
          </div>
        ) : null}
      </div>
    </main>
  )
}
