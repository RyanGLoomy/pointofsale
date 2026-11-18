"use client"

import { useState } from "react"
import { createMenu, setMenuActive, updateMenu } from "@/actions/menu"
import type { FormEvent } from "react"

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

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
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

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="rounded-xl border bg-white p-4">
        <h2 className="font-semibold">{editing ? "Edit Menu" : "Tambah Menu"}</h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Nama</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium">Kategori</label>
            <input value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium">Harga</label>
            <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" step="0.01" min="0" className="mt-1 w-full rounded-md border px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium">Stok</label>
            <input value={stock} onChange={(e) => setStock(e.target.value)} type="number" min="0" className="mt-1 w-full rounded-md border px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium">Deskripsi</label>
            <input value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2 text-sm" />
          </div>
        </div>

        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
        {notice ? <p className="mt-3 text-sm text-emerald-700">{notice}</p> : null}

        <div className="mt-4 flex gap-2">
          <button type="submit" className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white">
            {editing ? "Simpan Perubahan" : "Tambah Menu"}
          </button>
          {editing ? (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-md border px-3 py-2 text-sm font-medium"
            >
              Batal
            </button>
          ) : null}
        </div>
      </form>

      <div className="rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left">
              <th className="p-3">Nama</th>
              <th className="p-3">Kategori</th>
              <th className="p-3">Harga</th>
              <th className="p-3">Stok</th>
              <th className="p-3">Status</th>
              <th className="p-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {menus.map((menu) => (
              <tr key={menu.id} className="border-t">
                <td className="p-3">{menu.name}</td>
                <td className="p-3">{menu.category ?? "-"}</td>
                <td className="p-3">Rp {menu.price.toFixed(2)}</td>
                <td className="p-3">{menu.stock}</td>
                <td className="p-3">{menu.active ? "Aktif" : "Nonaktif"}</td>
                <td className="p-3">
                  <button
                    type="button"
                    onClick={() => startEdit(menu)}
                    className="mr-2 rounded-md border px-2 py-1 text-xs"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleActive(menu)}
                    className="rounded-md border px-2 py-1 text-xs"
                  >
                    {menu.active ? "Nonaktifkan" : "Aktifkan"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
