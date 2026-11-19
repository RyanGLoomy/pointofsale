"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowRight,
  CircleCheck,
  Coffee,
  Package,
  Printer,
  Search,
  ShoppingCart,
  Trash2,
  UtensilsCrossed,
  X,
} from "lucide-react"
import { checkoutPOS } from "@/actions/orders"
import { cn, formatDateTime, formatRupiah } from "@/lib/format"
import { productGradient, productInitial } from "@/lib/product-visual"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { Input } from "@/components/ui/input"
import { QuantityStepper } from "@/components/ui/quantity-stepper"
import { Segmented, type SegmentedOption } from "@/components/ui/segmented"

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

type PaymentMethod = "CASH" | "CARD" | "QRIS"

interface Receipt {
  orderId: string
  total: number
  method: PaymentMethod
  createdAt: string
  lines: CartLine[]
}

const paymentOptions: SegmentedOption<PaymentMethod>[] = [
  { value: "CASH", label: "Tunai" },
  { value: "CARD", label: "Kartu" },
  { value: "QRIS", label: "QRIS" },
]

const paymentLabels: Record<PaymentMethod, string> = {
  CASH: "Tunai",
  CARD: "Kartu",
  QRIS: "QRIS",
}

function CategoryIcon({ category }: { category?: string | null }) {
  const value = (category ?? "").toLowerCase()
  if (value.includes("minum") || value.includes("kopi") || value.includes("teh")) {
    return <Coffee className="h-3.5 w-3.5" />
  }
  if (value.includes("makan") || value.includes("nasi")) {
    return <UtensilsCrossed className="h-3.5 w-3.5" />
  }
  return <Package className="h-3.5 w-3.5" />
}

export function PosTerminal({
  items,
  userId,
  cashierName,
}: {
  items: PosItem[]
  userId: string
  cashierName: string
}) {
  const router = useRouter()
  const [cart, setCart] = useState<CartLine[]>([])
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("Semua")
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH")
  const [receipt, setReceipt] = useState<Receipt | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  const categories = useMemo(() => {
    const unique = new Set(items.map((item) => item.category?.trim() || "Umum"))
    return ["Semua", ...Array.from(unique)]
  }, [items])

  const filteredItems = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return items.filter((item) => {
      const itemCategory = item.category?.trim() || "Umum"
      const matchesCategory = category === "Semua" || itemCategory === category
      const matchesQuery =
        needle.length === 0 ||
        item.name.toLowerCase().includes(needle) ||
        itemCategory.toLowerCase().includes(needle)
      return matchesCategory && matchesQuery
    })
  }, [items, query, category])

  const total = useMemo(
    () => cart.reduce((sum, line) => sum + line.price * line.quantity, 0),
    [cart],
  )
  const itemCount = useMemo(
    () => cart.reduce((sum, line) => sum + line.quantity, 0),
    [cart],
  )

  function addToCart(item: PosItem) {
    setCart((previous) => {
      const existing = previous.find((line) => line.menuId === item.id)
      if (existing) {
        if (existing.quantity + 1 > existing.stock) return previous
        return previous.map((line) =>
          line.menuId === item.id ? { ...line, quantity: line.quantity + 1 } : line,
        )
      }
      return [
        ...previous,
        { menuId: item.id, name: item.name, price: item.price, quantity: 1, stock: item.stock },
      ]
    })
  }

  function decreaseLine(menuId: string) {
    setCart((previous) =>
      previous.flatMap((line) => {
        if (line.menuId !== menuId) return [line]
        return line.quantity > 1 ? [{ ...line, quantity: line.quantity - 1 }] : []
      }),
    )
  }

  function increaseLine(menuId: string) {
    setCart((previous) =>
      previous.map((line) =>
        line.menuId === menuId && line.quantity < line.stock
          ? { ...line, quantity: line.quantity + 1 }
          : line,
      ),
    )
  }

  async function handleCheckout() {
    if (cart.length === 0) return

    setPending(true)
    setError(null)
    const snapshot = cart

    try {
      const result = await checkoutPOS({
        userId,
        items: snapshot.map((line) => ({ menuId: line.menuId, quantity: line.quantity })),
        paymentMethod,
      })

      setReceipt({
        orderId: result.orderId,
        total: result.total,
        method: paymentMethod,
        createdAt: new Date().toISOString(),
        lines: snapshot,
      })
      setCart([])
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memproses transaksi.")
    } finally {
      setPending(false)
    }
  }

  return (
    <>
      <div className="mt-6 grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_400px]">
        <Card className="overflow-hidden">
          <div className="space-y-3 border-b border-line p-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Cari menu atau kategori..."
                aria-label="Cari menu"
                className="pl-9"
              />
            </div>

            <div className="flex gap-1.5 overflow-x-auto pb-0.5">
              {categories.map((entry) => (
                <button
                  key={entry}
                  type="button"
                  aria-pressed={category === entry}
                  onClick={() => setCategory(entry)}
                  className={cn(
                    "shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                    category === entry
                      ? "border-ember/40 bg-ember/10 text-ember"
                      : "border-line bg-surface-2 text-muted hover:text-ink",
                  )}
                >
                  {entry}
                </button>
              ))}
            </div>
          </div>

          {filteredItems.length === 0 ? (
            <EmptyState
              icon={Search}
              title="Menu tidak ditemukan"
              description="Coba kata kunci lain atau pilih kategori yang berbeda."
            />
          ) : (
            <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 xl:grid-cols-[repeat(auto-fill,minmax(176px,1fr))]">
              {filteredItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => addToCart(item)}
                  disabled={item.stock <= 0}
                  aria-label={`Tambah ${item.name} ke keranjang`}
                  className="group flex flex-col rounded-2xl border border-line bg-surface-2/40 p-2.5 text-left transition duration-200 hover:-translate-y-0.5 hover:border-ember/50 hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
                >
                  <div
                    className="relative aspect-[4/3] w-full overflow-hidden rounded-xl"
                    style={{ backgroundImage: productGradient(item.name) }}
                  >
                    <span className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(255,255,255,0.35),transparent_55%)]" />
                    <span className="absolute bottom-1.5 left-3 text-4xl font-extrabold leading-none text-white/90">
                      {productInitial(item.name)}
                    </span>
                    <span className="absolute right-2 top-2 rounded-full bg-black/30 p-1.5 text-white/80 backdrop-blur-sm">
                      <CategoryIcon category={item.category} />
                    </span>
                    {item.stock <= 0 ? (
                      <span className="absolute inset-0 flex items-center justify-center bg-black/65 text-[11px] font-bold uppercase tracking-[0.16em] text-white">
                        Habis
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-2.5 flex flex-1 flex-col px-0.5 pb-0.5">
                    <p className="line-clamp-2 text-sm font-semibold leading-snug text-ink">{item.name}</p>
                    <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
                      {item.category ?? "Umum"}
                    </p>
                    <div className="mt-auto flex items-end justify-between pt-2">
                      <span className="text-sm font-bold tabular-nums text-ember">
                        {formatRupiah(item.price)}
                      </span>
                      <span className="text-[10px] text-muted">Stok {item.stock}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </Card>

        <aside className="lg:sticky lg:top-6 lg:self-start">
          <Card className="flex flex-col lg:max-h-[calc(100vh-7rem)]">
            <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3.5">
              <div>
                <h2 className="text-sm font-bold tracking-tight text-ink">Pesanan Saat Ini</h2>
                <p className="text-[11px] text-muted">{itemCount} item di keranjang</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={itemCount > 0 ? "ember" : "neutral"}>{itemCount}</Badge>
                {cart.length > 0 ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label="Kosongkan keranjang"
                    onClick={() => {
                      setCart([])
                      setError(null)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                ) : null}
              </div>
            </div>

            <div className="min-h-[180px] flex-1 overflow-y-auto px-3 py-3">
              {cart.length === 0 ? (
                <EmptyState
                  icon={ShoppingCart}
                  title="Keranjang masih kosong"
                  description="Pilih menu di sebelah kiri untuk mulai menyusun pesanan."
                  className="py-8"
                />
              ) : (
                <ul className="space-y-2">
                  {cart.map((line) => (
                    <li
                      key={line.menuId}
                      className="flex gap-3 rounded-xl border border-line bg-surface-2 p-2.5"
                    >
                      <div
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-sm font-extrabold text-white/90"
                        style={{ backgroundImage: productGradient(line.name) }}
                      >
                        {productInitial(line.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="truncate text-sm font-semibold text-ink">{line.name}</p>
                          <span className="sr-only">
                            {line.name} × {line.quantity}
                          </span>
                          <p className="shrink-0 text-sm font-bold tabular-nums text-ink">
                            {formatRupiah(line.price * line.quantity)}
                          </p>
                        </div>
                        <div className="mt-1.5 flex items-center justify-between gap-2">
                          <QuantityStepper
                            quantity={line.quantity}
                            max={line.stock}
                            onDecrease={() => decreaseLine(line.menuId)}
                            onIncrease={() => increaseLine(line.menuId)}
                          />
                          <span className="text-[10px] text-muted">
                            {formatRupiah(line.price)} / item
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="border-t border-line px-4 py-4">
              <div className="flex items-center justify-between text-xs text-muted">
                <span>Subtotal</span>
                <span className="tabular-nums">{formatRupiah(total)}</span>
              </div>
              <div className="mt-1.5 flex items-center justify-between">
                <span className="text-sm font-semibold text-ink">Total</span>
                <span className="text-lg font-extrabold tabular-nums text-ember">{formatRupiah(total)}</span>
              </div>

              <Segmented
                options={paymentOptions}
                value={paymentMethod}
                onChange={setPaymentMethod}
                ariaLabel="Metode pembayaran"
                className="mt-3"
              />

              <Button
                size="lg"
                className="mt-3 w-full"
                onClick={handleCheckout}
                disabled={pending || cart.length === 0}
              >
                {pending ? "Memproses..." : "Bayar Sekarang"}
                {!pending ? <ArrowRight className="h-4 w-4" /> : null}
              </Button>

              {error ? <p className="mt-2 text-xs text-danger">{error}</p> : null}
            </div>
          </Card>
        </aside>
      </div>

      {receipt ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          onClick={() => setReceipt(null)}
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Struk Transaksi"
            className="w-full max-w-md overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_40px_100px_-30px_rgba(0,0,0,0.9)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <div className="flex items-center gap-2 text-success">
                <CircleCheck className="h-5 w-5" />
                <span className="text-sm font-bold">Pembayaran Berhasil</span>
              </div>
              <Button variant="ghost" size="sm" aria-label="Tutup struk" onClick={() => setReceipt(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="max-h-[68vh] overflow-y-auto p-4">
              <div className="receipt mx-auto w-full max-w-[320px] rounded-xl bg-white p-5 text-slate-900">
                <div className="text-center">
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
                    Point of Sale
                  </p>
                  <p className="mt-1 text-base font-extrabold">Struk Pembayaran</p>
                </div>

                <dl className="mt-4 space-y-1 text-[11px] text-slate-600">
                  <div className="flex justify-between gap-2">
                    <dt>Order</dt>
                    <dd className="font-mono">{receipt.orderId.slice(0, 8).toUpperCase()}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt>Waktu</dt>
                    <dd>{formatDateTime(receipt.createdAt)}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt>Kasir</dt>
                    <dd>{cashierName}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt>Metode</dt>
                    <dd>{paymentLabels[receipt.method]}</dd>
                  </div>
                </dl>

                <div className="my-3 border-t border-dashed border-slate-300" />

                <ul className="space-y-2 text-[11px]">
                  {receipt.lines.map((line) => (
                    <li key={line.menuId} className="flex justify-between gap-2">
                      <span>
                        {line.name} × {line.quantity}
                      </span>
                      <span className="tabular-nums">{formatRupiah(line.price * line.quantity)}</span>
                    </li>
                  ))}
                </ul>

                <div className="my-3 border-t border-dashed border-slate-300" />

                <div className="flex justify-between text-sm font-extrabold">
                  <span>Total</span>
                  <span className="tabular-nums">{formatRupiah(receipt.total)}</span>
                </div>
                <p className="mt-4 text-center text-[10px] text-slate-500">
                  Terima kasih telah berbelanja.
                </p>
              </div>
            </div>

            <div className="flex gap-2 border-t border-line p-4">
              <Button variant="secondary" className="flex-1" onClick={() => window.print()}>
                <Printer className="h-4 w-4" />
                Cetak Struk
              </Button>
              <Button className="flex-1" onClick={() => setReceipt(null)}>
                Transaksi Baru
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
