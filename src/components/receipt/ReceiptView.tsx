import { cn, formatDateTime, formatRupiah } from "@/lib/format"
import {
  buildReceiptNumber,
  paymentLabel,
  STORE_PROFILE,
  type ReceiptData,
} from "@/lib/receipt"

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <dt>{label}</dt>
      <dd className="text-right">{value}</dd>
    </div>
  )
}

/**
 * Printable receipt used by the checkout dialog and by transaction reprints.
 * Kept free of client hooks so both server and client components can render it.
 */
export function ReceiptView({ data, className }: { data: ReceiptData; className?: string }) {
  const receiptNumber = buildReceiptNumber(data.orderId, data.createdAt)
  const change = data.cashReceived != null ? data.cashReceived - data.total : null

  return (
    <div
      className={cn(
        "receipt mx-auto w-full max-w-[320px] rounded-xl bg-white p-5 text-slate-900",
        className,
      )}
    >
      <div className="text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
          {STORE_PROFILE.name}
        </p>
        {STORE_PROFILE.address ? (
          <p className="mt-0.5 text-[10px] leading-snug text-slate-500">{STORE_PROFILE.address}</p>
        ) : null}
        {STORE_PROFILE.phone ? (
          <p className="text-[10px] text-slate-500">{STORE_PROFILE.phone}</p>
        ) : null}
        <p className="mt-1 text-base font-extrabold">Struk Pembayaran</p>
      </div>

      <dl className="mt-4 space-y-1 text-[11px] text-slate-600">
        <div className="flex justify-between gap-2">
          <dt>No. Struk</dt>
          <dd className="font-mono">{receiptNumber}</dd>
        </div>
        <Row label="Waktu" value={formatDateTime(data.createdAt)} />
        {data.cashierName ? <Row label="Kasir" value={data.cashierName} /> : null}
        <Row label="Metode" value={paymentLabel(data.method)} />
      </dl>

      <div className="my-3 border-t border-dashed border-slate-300" />

      <ul className="space-y-2 text-[11px]">
        {data.lines.length === 0 ? (
          <li className="text-slate-500">Detail item tidak tersedia.</li>
        ) : null}
        {data.lines.map((line, index) => (
          <li key={`${line.name}-${index}`} className="flex justify-between gap-2">
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
        <span className="tabular-nums">{formatRupiah(data.total)}</span>
      </div>

      {data.cashReceived != null ? (
        <dl className="mt-1 space-y-0.5 text-[11px] text-slate-600">
          <Row label="Tunai" value={formatRupiah(data.cashReceived)} />
          <Row label="Kembali" value={formatRupiah(Math.max(0, change ?? 0))} />
        </dl>
      ) : null}

      <p className="mt-4 text-center text-[10px] leading-relaxed text-slate-500">
        Terima kasih telah berbelanja.
      </p>
      <p className="text-center text-[10px] text-slate-500">Simpan struk ini sebagai bukti pembayaran.</p>
    </div>
  )
}
