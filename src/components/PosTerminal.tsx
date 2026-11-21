"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowRight,
  CircleCheck,
  Coffee,
  Copy,
  Package,
  Printer,
  Search,
  ShoppingCart,
  Trash2,
  UtensilsCrossed,
  X,
} from "lucide-react"
import { checkoutPOS } from "@/actions/orders"
import { cn, formatRupiah } from "@/lib/format"
import { productInitial, productToneClass } from "@/lib/product-visual"
import {
  addLine,
  CART_STORAGE_KEY,
  cartCount,
  cartTotal,
  decreaseLine,
  increaseLine,
  insertLine,
  removeLine,
  sanitizeCart,
  type CartLine,
} from "@/lib/cart"
import {
  calculateChange,
  digitsOnly,
  formatAmountInput,
  isCashEnough,
  parseAmountInput,
  quickCashOptions,
} from "@/lib/money"
import {
  buildReceiptNumber,
  PAYMENT_LABELS,
  type PaymentMethod,
  type ReceiptData,
} from "@/lib/receipt"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { Input } from "@/components/ui/input"
import { Modal } from "@/components/ui/modal"
import { QuantityStepper } from "@/components/ui/quantity-stepper"
import { Segmented, type SegmentedOption } from "@/components/ui/segmented"
import { useConfirm } from "@/components/ui/confirm"
import { useToast } from "@/components/ui/toast"
import { ReceiptView } from "@/components/receipt/ReceiptView"

export interface PosItem {
  id: string
  name: string
  price: number
  stock: number
  category?: string | null
}

const paymentOptions: SegmentedOption<PaymentMethod>[] = [
  { value: "CASH", label: "Tunai" },
  { value: "CARD", label: "Kartu" },
  { value: "QRIS", label: "QRIS" },
]

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

function readStoredCart(items: PosItem[]): CartLine[] {
  if (typeof window === "undefined") return []

  try {
    const stored = window.localStorage.getItem(CART_STORAGE_KEY)
    if (!stored) return []
    return sanitizeCart(JSON.parse(stored), items)
  } catch {
    return []
  }
}

export function PosTerminal({
  items,
  cashierName,
}: {
  items: PosItem[]
  cashierName: string
}) {
  const router = useRouter()
  const confirm = useConfirm()
  const toast = useToast()
  const searchRef = useRef<HTMLInputElement>(null)

  const [cart, setCart] = useState<CartLine[]>([])
  const [hydrated, setHydrated] = useState(false)
  const [restoreBanner, setRestoreBanner] = useState(false)
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("Semua")
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH")
  const [cashReceived, setCashReceived] = useState("")
  const [receipt, setReceipt] = useState<ReceiptData | null>(null)
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

  const total = useMemo(() => cartTotal(cart), [cart])
  const itemCount = useMemo(() => cartCount(cart), [cart])
  const cashAmount = parseAmountInput(cashReceived)
  const change = calculateChange(cashAmount, total)
  const cashEnough = isCashEnough(cashAmount, total)
  const cashRequired = paymentMethod === "CASH" && cart.length > 0
  const canCheckout = cart.length > 0 && !pending && (!cashRequired || cashEnough)

  useEffect(() => {
    const stored = readStoredCart(items)
    if (stored.length > 0) {
      setCart(stored)
      setRestoreBanner(true)
    }
    setHydrated(true)
  }, [items])

  useEffect(() => {
    if (!hydrated) return

    try {
      if (cart.length === 0) {
        window.localStorage.removeItem(CART_STORAGE_KEY)
      } else {
        window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
      }
    } catch {
      // Storage can be unavailable (private mode); the cart still works in memory.
    }
  }, [cart, hydrated])

  useEffect(() => {
    if (cart.length === 0) return

    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault()
      event.returnValue = ""
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [cart.length])

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return

      const target = event.target as HTMLElement | null
      const tag = target?.tagName
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target?.isContentEditable) {
        return
      }

      event.preventDefault()
      searchRef.current?.focus()
    }

    window.addEventListener("keydown", handleShortcut)
    return () => window.removeEventListener("keydown", handleShortcut)
  }, [])

  useEffect(() => {
    if (cart.length === 0) setCashReceived("")
  }, [cart.length])

  function addToCart(item: PosItem) {
    const existing = cart.find((line) => line.menuId === item.id)

    if (existing && existing.quantity >= existing.stock) {
      toast.info("Stok maksimum", `${item.name} hanya tersisa ${existing.stock}.`)
      return
    }

    setCart((previous) => addLine(previous, item))
  }

  function handleDecrease(line: CartLine) {
    if (line.quantity > 1) {
      setCart((previous) => decreaseLine(previous, line.menuId))
      return
    }

    const index = cart.findIndex((entry) => entry.menuId === line.menuId)
    const removed = cart[index]
    setCart((previous) => removeLine(previous, line.menuId))

    if (removed) {
      toast.info("Item dihapus", removed.name, {
        label: "Urungkan",
        onClick: () => setCart((previous) => insertLine(previous, removed, index)),
      })
    }
  }

  async function handleClear() {
    if (cart.length === 0) return

    const confirmed = await confirm({
      title: "Kosongkan keranjang?",
      description: `${itemCount} item akan dihapus dari pesanan ini.`,
      confirmLabel: "Kosongkan",
      tone: "danger",
    })

    if (!confirmed) return

    const snapshot = sanitizeCart(cart, items)
    setCart([])
    setError(null)

    toast.info("Keranjang dikosongkan", undefined, {
      label: "Urungkan",
      onClick: () => setCart(snapshot),
    })
  }

  function handleDismissRestore() {
    setCart([])
    setRestoreBanner(false)
    setError(null)
  }

  async function copyReceiptNumber() {
    if (!receipt) return

    const value = buildReceiptNumber(receipt.orderId, receipt.createdAt)

    try {
      await navigator.clipboard.writeText(value)
      toast.success("Nomor struk disalin", value)
    } catch {
      toast.error("Gagal menyalin", "Salin nomor struk secara manual.")
    }
  }

  async function handleCheckout() {
    if (cart.length === 0 || pending) return

    if (cashRequired && !cashEnough) {
      setError("Uang diterima belum mencukupi total.")
      return
    }

    setPending(true)
    setError(null)
    const snapshot = cart
    const received = paymentMethod === "CASH" ? cashAmount : undefined

    try {
      const result = await checkoutPOS({
        items: snapshot.map((line) => ({ menuId: line.menuId, quantity: line.quantity })),
        paymentMethod,
      })

      setReceipt({
        orderId: result.orderId,
        total: result.total,
        method: paymentMethod,
        createdAt: new Date().toISOString(),
        lines: snapshot,
        cashierName,
        cashReceived: received,
      })
      setCart([])
      setRestoreBanner(false)
      router.refresh()
      toast.success("Pembayaran berhasil", `${formatRupiah(result.total)} · ${PAYMENT_LABELS[paymentMethod]}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal memproses transaksi."
      setError(message)
      toast.error("Transaksi gagal", message)
    } finally {
      setPending(false)
    }
  }

  return (
    <>
      {restoreBanner ? (
        <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-info/30 bg-info/10 px-3 py-2">
          <p className="text-xs font-medium text-info">Keranjang sebelumnya dipulihkan.</p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleDismissRestore}
              className="rounded-md px-2 py-1 text-[11px] font-bold text-info underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-info/60"
            >
              Kosongkan
            </button>
            <button
              type="button"
              aria-label="Tutup pemberitahuan"
              onClick={() => setRestoreBanner(false)}
              className="flex h-6 w-6 items-center justify-center rounded-md text-info/80 transition-colors hover:bg-info/10 hover:text-info focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-info/60"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      ) : null}

      <div className="mt-5 grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_400px]">
        <Card className="overflow-hidden">
          <div className="space-y-3 border-b border-line p-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <Input
                ref={searchRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Escape" && query.length > 0) {
                    event.preventDefault()
                    setQuery("")
                  }
                }}
                placeholder="Cari menu atau kategori..."
                aria-label="Cari menu"
                className="pl-9 pr-10"
              />
              {query ? (
                <button
                  type="button"
                  aria-label="Hapus pencarian"
                  onClick={() => {
                    setQuery("")
                    searchRef.current?.focus()
                  }}
                  className="absolute right-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-muted transition-colors hover:bg-ink/5 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember/60"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              ) : (
                <kbd
                  aria-hidden="true"
                  className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 rounded border border-line bg-surface px-1.5 py-0.5 text-[10px] font-semibold text-muted sm:block"
                >
                  /
                </kbd>
              )}
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
                      ? "border-ember/40 bg-ember text-[#f4f1e9]"
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
                  className="group flex flex-col rounded-2xl border border-line bg-surface p-2.5 text-left transition duration-200 hover:-translate-y-0.5 hover:border-ember/50 hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
                >
                  <div
                    className={cn("relative aspect-[4/3] w-full overflow-hidden rounded-xl", productToneClass(item.name))}
                  >
                    <span className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(255,255,255,0.35),transparent_55%)]" />
                    <span className="absolute bottom-1.5 left-3 text-4xl font-serif font-bold leading-none text-[#f4f1e9]">
                      {productInitial(item.name)}
                    </span>
                    <span className="absolute right-2 top-2 rounded-full bg-ink/45 p-1.5 text-[#f4f1e9] backdrop-blur-sm">
                      <CategoryIcon category={item.category} />
                    </span>
                    {item.stock <= 0 ? (
                      <span className="absolute inset-0 flex items-center justify-center bg-ink/70 text-[11px] font-bold uppercase tracking-[0.16em] text-[#f4f1e9]">
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
                  <Button variant="ghost" size="sm" aria-label="Kosongkan keranjang" onClick={handleClear}>
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
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
                        className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-sm font-serif font-extrabold text-[#f4f1e9]", productToneClass(line.name))}
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
                            onDecrease={() => handleDecrease(line)}
                            onIncrease={() => setCart((previous) => increaseLine(previous, line.menuId))}
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
                <span className="text-lg font-serif font-bold tabular-nums text-ember">{formatRupiah(total)}</span>
              </div>

              <Segmented
                options={paymentOptions}
                value={paymentMethod}
                onChange={setPaymentMethod}
                ariaLabel="Metode pembayaran"
                className="mt-3"
              />

              {paymentMethod === "CASH" && cart.length > 0 ? (
                <div className="mt-3 rounded-xl border border-line bg-surface-2/60 p-3">
                  <label
                    htmlFor="cash-received"
                    className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-muted"
                  >
                    Uang diterima
                  </label>
                  <div className="relative mt-1.5">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted">
                      Rp
                    </span>
                    <Input
                      id="cash-received"
                      inputMode="numeric"
                      autoComplete="off"
                      value={formatAmountInput(cashReceived)}
                      onChange={(event) => {
                        setCashReceived(digitsOnly(event.target.value))
                        setError(null)
                      }}
                      placeholder="0"
                      className="pl-9 text-right font-semibold tabular-nums"
                    />
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {quickCashOptions(total).map((amount, index) => (
                      <button
                        key={amount}
                        type="button"
                        onClick={() => {
                          setCashReceived(String(amount))
                          setError(null)
                        }}
                        className="rounded-lg border border-line bg-surface px-2.5 py-1 text-[11px] font-semibold text-muted transition-colors hover:border-ember/40 hover:text-ember focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember/60"
                      >
                        {index === 0 ? "Uang pas" : formatRupiah(amount)}
                      </button>
                    ))}
                  </div>
                  <div className="mt-2.5 flex items-center justify-between text-xs">
                    <span className="text-muted">Kembalian</span>
                    <span
                      className={cn(
                        "font-bold tabular-nums",
                        change < 0 ? "text-danger" : "text-success",
                      )}
                    >
                      {change < 0 ? `Kurang ${formatRupiah(Math.abs(change))}` : formatRupiah(change)}
                    </span>
                  </div>
                </div>
              ) : null}

              <Button
                size="lg"
                className="mt-3 w-full"
                onClick={handleCheckout}
                disabled={!canCheckout}
                loading={pending}
              >
                {pending ? "Memproses..." : "Bayar Sekarang"}
                {!pending ? <ArrowRight className="h-4 w-4" aria-hidden="true" /> : null}
              </Button>

              {error ? (
                <p role="alert" className="mt-2 text-xs text-danger">
                  {error}
                </p>
              ) : null}
            </div>
          </Card>
        </aside>
      </div>

      <Modal
        open={receipt !== null}
        onClose={() => setReceipt(null)}
        titleId="receipt-title"
        className="max-w-md"
      >
        {receipt ? (
          <>
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <div className="flex items-center gap-2 text-success">
                <CircleCheck className="h-5 w-5" aria-hidden="true" />
                <h2 id="receipt-title" className="text-sm font-bold text-ink">
                  Pembayaran Berhasil
                </h2>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label="Salin nomor struk"
                  title="Salin nomor struk"
                  onClick={copyReceiptNumber}
                >
                  <Copy className="h-4 w-4" aria-hidden="true" />
                </Button>
                <Button variant="ghost" size="sm" aria-label="Tutup struk" onClick={() => setReceipt(null)}>
                  <X className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            </div>

            <div className="max-h-[68vh] overflow-y-auto p-4">
              <ReceiptView data={receipt} />
            </div>

            <div className="flex gap-2 border-t border-line p-4">
              <Button variant="secondary" className="flex-1" onClick={() => window.print()}>
                <Printer className="h-4 w-4" aria-hidden="true" />
                Cetak Struk
              </Button>
              <Button className="flex-1" onClick={() => setReceipt(null)}>
                Transaksi Baru
              </Button>
            </div>
          </>
        ) : null}
      </Modal>
    </>
  )
}
