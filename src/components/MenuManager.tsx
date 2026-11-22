"use client"

import { useEffect, useState } from "react"
import { Save, X } from "lucide-react"
import { createMenu, setMenuActive, updateMenu } from "@/actions/menu"
import { removeMenuImage, uploadMenuImage } from "@/actions/menu-image"
import type { FormEvent } from "react"
import { formatRupiah } from "@/lib/format"
import { validateMenuImage } from "@/lib/menu-image"
import { digitsOnly, formatAmountInput, parseAmountInput } from "@/lib/money"
import { Badge, type BadgeTone } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { Field, Input } from "@/components/ui/input"
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table"
import { useConfirm } from "@/components/ui/confirm"
import { useToast } from "@/components/ui/toast"

export interface MenuRow {
  id: string
  name: string
  description?: string | null
  price: number
  stock: number
  category?: string | null
  imageUrl?: string | null
  active: boolean
}

interface MenuManagerProps {
  menus: MenuRow[]
}

interface FieldErrors {
  name?: string
  price?: string
  image?: string
}

function stockTone(stock: number): BadgeTone {
  if (stock <= 0) return "danger"
  if (stock <= 5) return "warning"
  return "neutral"
}

export function MenuManager({ menus }: MenuManagerProps) {
  const confirm = useConfirm()
  const toast = useToast()

  const [editing, setEditing] = useState<MenuRow | null>(null)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("0")
  const [stock, setStock] = useState("0")
  const [category, setCategory] = useState("")
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [removeImage, setRemoveImage] = useState(false)

  useEffect(() => {
    if (!imageFile) {
      setImagePreview(null)
      return
    }
    const url = URL.createObjectURL(imageFile)
    setImagePreview(url)
    return () => URL.revokeObjectURL(url)
  }, [imageFile])

  function startEdit(menu: MenuRow) {
    setEditing(menu)
    setName(menu.name)
    setDescription(menu.description ?? "")
    setPrice(String(Math.round(menu.price)))
    setStock(String(menu.stock))
    setCategory(menu.category ?? "")
    setImageFile(null)
    setRemoveImage(false)
    setFieldErrors({})
    setError(null)
  }

  function resetForm() {
    setEditing(null)
    setName("")
    setDescription("")
    setPrice("0")
    setStock("0")
    setCategory("")
    setImageFile(null)
    setRemoveImage(false)
    setFieldErrors({})
    setError(null)
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    const parsedPrice = parseAmountInput(price)
    const parsedStock = Math.max(0, Math.floor(Number(stock) || 0))
    const nextErrors: FieldErrors = {}

    if (!name.trim()) {
      nextErrors.name = "Nama menu wajib diisi."
    }

    if (price.trim() === "" || parsedPrice <= 0) {
      nextErrors.price = "Harga harus lebih dari 0."
    }

    if (imageFile) {
      const checked = validateMenuImage({ type: imageFile.type, size: imageFile.size, name: imageFile.name })
      if (!checked.ok) nextErrors.image = checked.error
    }

    if (nextErrors.name || nextErrors.price) {
      setFieldErrors(nextErrors)
      document.getElementById(nextErrors.name ? "menu-name" : nextErrors.price ? "menu-price" : "menu-image")?.focus()
      return
    }

    setFieldErrors({})
    setSaving(true)

    try {
      if (editing) {
        await updateMenu(editing.id, {
          name: name.trim(),
          description: description.trim() || undefined,
          price: parsedPrice,
          stock: parsedStock,
          category: category.trim() || undefined,
          active: editing.active,
        })
        if (imageFile) {
          const form = new FormData()
          form.set("image", imageFile)
          await uploadMenuImage(editing.id, form)
        } else if (removeImage && editing.imageUrl) {
          await removeMenuImage(editing.id)
        }
        toast.success("Menu diperbarui", name.trim())
      } else {
        const created = await createMenu({
          name: name.trim(),
          description: description.trim() || undefined,
          price: parsedPrice,
          stock: parsedStock,
          category: category.trim() || undefined,
        })
        if (imageFile) {
          const form = new FormData()
          form.set("image", imageFile)
          await uploadMenuImage(created.id, form)
        }
        toast.success("Menu ditambahkan", name.trim())
      }
      resetForm()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal menyimpan menu."
      setError(message)
      toast.error("Gagal menyimpan menu", message)
    } finally {
      setSaving(false)
    }
  }

  async function toggleActive(menu: MenuRow) {
    if (menu.active) {
      const confirmed = await confirm({
        title: `Nonaktifkan "${menu.name}"?`,
        description:
          "Menu ini tidak akan muncul di terminal kasir sampai diaktifkan kembali.",
        confirmLabel: "Nonaktifkan",
        tone: "danger",
      })

      if (!confirmed) return
    }

    setTogglingId(menu.id)
    setError(null)

    try {
      await setMenuActive(menu.id, !menu.active)
      toast.success(
        menu.active ? "Menu dinonaktifkan" : "Menu diaktifkan",
        menu.name,
      )
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal mengubah status menu."
      setError(message)
      toast.error("Gagal mengubah status menu", message)
    } finally {
      setTogglingId(null)
    }
  }

  const activeCount = menus.filter((menu) => menu.active).length

  return (
    <div className="mt-6 grid items-start gap-5 xl:grid-cols-[380px_minmax(0,1fr)]">
      <Card className="xl:sticky xl:top-6 xl:self-start">
        <CardHeader>
          <div>
            <CardTitle>{editing ? "Edit Menu" : "Tambah Menu"}</CardTitle>
            <p className="mt-0.5 text-[11px] text-muted">
              {editing ? "Perbarui detail menu yang dipilih." : "Daftarkan menu baru ke katalog kasir."}
            </p>
          </div>
          {editing ? <Badge tone="ember">Mode edit</Badge> : null}
        </CardHeader>

        <form onSubmit={onSubmit} className="space-y-3 p-4" noValidate>
          <Field label="Nama" htmlFor="menu-name" error={fieldErrors.name}>
            <Input
              id="menu-name"
              value={name}
              onChange={(event) => {
                setName(event.target.value)
                setFieldErrors((current) => ({ ...current, name: undefined }))
              }}
              aria-invalid={Boolean(fieldErrors.name)}
              aria-describedby={fieldErrors.name ? "menu-name-error" : undefined}
              placeholder="Contoh: Kopi Suroko"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Harga" htmlFor="menu-price" error={fieldErrors.price}>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted">
                  Rp
                </span>
                <Input
                  id="menu-price"
                  inputMode="numeric"
                  value={formatAmountInput(price)}
                  onChange={(event) => {
                    setPrice(digitsOnly(event.target.value))
                    setFieldErrors((current) => ({ ...current, price: undefined }))
                  }}
                  aria-invalid={Boolean(fieldErrors.price)}
                  aria-describedby={fieldErrors.price ? "menu-price-error" : undefined}
                  placeholder="0"
                  className="pl-9 text-right font-semibold tabular-nums"
                />
              </div>
            </Field>
            <Field label="Stok" htmlFor="menu-stock">
              <Input
                id="menu-stock"
                value={stock}
                onChange={(event) => setStock(event.target.value)}
                type="number"
                min="0"
              />
            </Field>
          </div>

          <Field label="Kategori" htmlFor="menu-category">
            <Input
              id="menu-category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              placeholder="Minuman / Makanan"
            />
          </Field>

          <Field
            label="Foto menu"
            htmlFor="menu-image"
            error={fieldErrors.image}
            hint="JPG, PNG, atau WebP · maksimal 2 MB"
          >
            <input
              id="menu-image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="block w-full text-xs text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-ember file:px-3 file:py-2 file:text-xs file:font-semibold file:text-[#f4f1e9] hover:file:bg-ember-strong"
              onChange={(event) => {
                setImageFile(event.target.files?.[0] ?? null)
                setRemoveImage(false)
                setFieldErrors((current) => ({ ...current, image: undefined }))
              }}
            />
            {imagePreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imagePreview} alt="Pratinjau foto menu" className="mt-2 h-20 w-28 rounded-lg object-cover" />
            ) : editing?.imageUrl && !removeImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={editing.imageUrl} alt={`Foto ${editing.name}`} className="mt-2 h-20 w-28 rounded-lg object-cover" />
            ) : null}
            {editing?.imageUrl ? (
              <button
                type="button"
                onClick={() => {
                  setRemoveImage((current) => !current)
                  setImageFile(null)
                }}
                className="mt-2 text-[11px] font-bold text-danger underline-offset-4 hover:underline"
              >
                {removeImage ? "Batal hapus gambar" : "Hapus gambar"}
              </button>
            ) : null}
          </Field>

          <Field label="Deskripsi" htmlFor="menu-description">
            <Input
              id="menu-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Deskripsi singkat"
            />
          </Field>

          {error ? (
            <p
              role="alert"
              className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger"
            >
              {error}
            </p>
          ) : null}

          <div className="flex gap-2 pt-1">
            <Button type="submit" className="flex-1" loading={saving}>
              {!saving ? <Save className="h-4 w-4" aria-hidden="true" /> : null}
              {saving ? "Menyimpan..." : editing ? "Simpan Perubahan" : "Tambah Menu"}
            </Button>
            {editing ? (
              <Button variant="secondary" onClick={resetForm} disabled={saving}>
                <X className="h-4 w-4" aria-hidden="true" />
                Batal
              </Button>
            ) : null}
          </div>
        </form>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader>
          <div>
            <CardTitle>Daftar Menu</CardTitle>
            <p className="mt-0.5 text-[11px] text-muted">{menus.length} menu terdaftar</p>
          </div>
          <Badge tone="success">{activeCount} aktif</Badge>
        </CardHeader>

        {menus.length === 0 ? (
          <EmptyState
            icon={Save}
            title="Belum ada menu"
            description="Tambahkan menu pertama lewat formulir di samping."
          />
        ) : (
          <Table>
            <THead>
              <TR>
                <TH>Nama</TH>
                <TH>Kategori</TH>
                <TH>Harga</TH>
                <TH>Stok</TH>
                <TH>Status</TH>
                <TH className="text-right">Aksi</TH>
              </TR>
            </THead>
            <TBody>
              {menus.map((menu) => (
                <TR key={menu.id}>
                  <TD>
                    <div className="flex items-center gap-2.5">
                      {menu.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={menu.imageUrl} alt="" className="h-9 w-9 shrink-0 rounded-lg object-cover" />
                      ) : null}
                      <div className="min-w-0">
                        <div className="font-semibold text-ink">{menu.name}</div>
                        {menu.description ? (
                          <div className="mt-0.5 text-[11px] text-muted">{menu.description}</div>
                        ) : null}
                      </div>
                    </div>
                  </TD>
                  <TD>
                    <span className="text-xs text-muted">{menu.category ?? "Umum"}</span>
                  </TD>
                  <TD className="font-semibold tabular-nums">{formatRupiah(menu.price)}</TD>
                  <TD>
                    <Badge tone={stockTone(menu.stock)}>{menu.stock}</Badge>
                  </TD>
                  <TD>
                    <Badge tone={menu.active ? "success" : "neutral"}>
                      {menu.active ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </TD>
                  <TD>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => startEdit(menu)}
                        disabled={togglingId === menu.id}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleActive(menu)}
                        loading={togglingId === menu.id}
                      >
                        {menu.active ? "Nonaktifkan" : "Aktifkan"}
                      </Button>
                    </div>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </Card>
    </div>
  )
}
