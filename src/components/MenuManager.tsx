"use client"

import { useState } from "react"
import { Save, X } from "lucide-react"
import { createMenu, setMenuActive, updateMenu } from "@/actions/menu"
import type { FormEvent } from "react"
import { formatRupiah } from "@/lib/format"
import { Badge, type BadgeTone } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { Field, Input } from "@/components/ui/input"
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table"

export interface MenuRow {
  id: string
  name: string
  description?: string | null
  price: number
  stock: number
  category?: string | null
  active: boolean
}

interface MenuManagerProps {
  menus: MenuRow[]
}

function stockTone(stock: number): BadgeTone {
  if (stock <= 0) return "danger"
  if (stock <= 5) return "warning"
  return "neutral"
}

export function MenuManager({ menus }: MenuManagerProps) {
  const [editing, setEditing] = useState<MenuRow | null>(null)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("0")
  const [stock, setStock] = useState("0")
  const [category, setCategory] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  function startEdit(menu: MenuRow) {
    setEditing(menu)
    setName(menu.name)
    setDescription(menu.description ?? "")
    setPrice(String(menu.price))
    setStock(String(menu.stock))
    setCategory(menu.category ?? "")
    setError(null)
    setNotice(null)
  }

  function resetForm() {
    setEditing(null)
    setName("")
    setDescription("")
    setPrice("0")
    setStock("0")
    setCategory("")
    setError(null)
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setNotice(null)

    const parsedPrice = Number(price)
    const parsedStock = Math.max(0, Math.floor(Number(stock) || 0))

    if (!name.trim()) {
      setError("Nama menu wajib diisi.")
      return
    }
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      setError("Harga tidak valid.")
      return
    }

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
        setNotice("Menu diperbarui.")
      } else {
        await createMenu({
          name: name.trim(),
          description: description.trim() || undefined,
          price: parsedPrice,
          stock: parsedStock,
          category: category.trim() || undefined,
        })
        setNotice("Menu ditambahkan.")
      }
      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan menu.")
    }
  }

  async function toggleActive(menu: MenuRow) {
    try {
      await setMenuActive(menu.id, !menu.active)
      setNotice(`Menu "${menu.name}" ${menu.active ? "dinonaktifkan" : "diaktifkan"}.`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengubah status menu.")
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

        <form onSubmit={onSubmit} className="space-y-3 p-4">
          <Field label="Nama" htmlFor="menu-name">
            <Input
              id="menu-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Contoh: Kopi Suroko"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Harga" htmlFor="menu-price">
              <Input
                id="menu-price"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                type="number"
                step="1"
                min="0"
              />
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

          <Field label="Deskripsi" htmlFor="menu-description">
            <Input
              id="menu-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Deskripsi singkat"
            />
          </Field>

          {error ? (
            <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
              {error}
            </p>
          ) : null}
          {notice ? (
            <p className="rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-xs text-success">
              {notice}
            </p>
          ) : null}

          <div className="flex gap-2 pt-1">
            <Button type="submit" className="flex-1">
              <Save className="h-4 w-4" />
              {editing ? "Simpan Perubahan" : "Tambah Menu"}
            </Button>
            {editing ? (
              <Button variant="secondary" onClick={resetForm}>
                <X className="h-4 w-4" />
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
                    <div className="font-semibold text-ink">{menu.name}</div>
                    {menu.description ? (
                      <div className="mt-0.5 text-[11px] text-muted">{menu.description}</div>
                    ) : null}
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
                      <Button variant="secondary" size="sm" onClick={() => startEdit(menu)}>
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => toggleActive(menu)}>
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
