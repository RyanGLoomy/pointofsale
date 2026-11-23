"use client"

import { useState } from "react"
import type { FormEvent } from "react"
import { Save, ShieldCheck, X } from "lucide-react"
import { createAccount, resetAccountPassword, updateAccount } from "@/actions/users"
import { Badge, type BadgeTone } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { Field, Input } from "@/components/ui/input"
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table"
import { useConfirm } from "@/components/ui/confirm"
import { useToast } from "@/components/ui/toast"

export interface AccountRow {
  id: string
  name: string
  email: string
  role: string
  active: boolean
}

const ROLES = ["KASIR", "ADMIN", "OWNER"] as const

const selectClass =
  "h-10 w-full rounded-xl border border-line bg-surface-2 px-3 text-sm text-ink outline-none transition focus:border-ember/60 focus:ring-2 focus:ring-ember/20"

const roleTone: Record<string, BadgeTone> = {
  KASIR: "neutral",
  ADMIN: "ember",
  OWNER: "info",
}

export function AccountManager({ accounts }: { accounts: AccountRow[] }) {
  const confirm = useConfirm()
  const toast = useToast()

  const [editing, setEditing] = useState<AccountRow | null>(null)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<string>("KASIR")
  const [password, setPassword] = useState("")
  const [active, setActive] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)

  function resetForm() {
    setEditing(null)
    setName("")
    setEmail("")
    setRole("KASIR")
    setPassword("")
    setActive(true)
    setError(null)
  }

  function startEdit(account: AccountRow) {
    setEditing(account)
    setName(account.name)
    setEmail(account.email)
    setRole(account.role)
    setPassword("")
    setActive(account.active)
    setError(null)
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSaving(true)

    try {
      if (editing) {
        await updateAccount(editing.id, { name, email, role, active })
        if (password.trim()) {
          await resetAccountPassword(editing.id, { password })
        }
        toast.success("Akun diperbarui", name)
      } else {
        await createAccount({ name, email, role, password })
        toast.success("Akun ditambahkan", name)
      }
      resetForm()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal menyimpan akun."
      setError(message)
      toast.error("Gagal menyimpan akun", message)
    } finally {
      setSaving(false)
    }
  }

  async function toggleActive(account: AccountRow) {
    if (account.active) {
      const confirmed = await confirm({
        title: `Nonaktifkan "${account.name}"?`,
        description: "Akun ini tidak bisa masuk sampai diaktifkan kembali.",
        confirmLabel: "Nonaktifkan",
        tone: "danger",
      })
      if (!confirmed) return
    }

    setBusyId(account.id)
    setError(null)
    try {
      await updateAccount(account.id, {
        name: account.name,
        email: account.email,
        role: account.role,
        active: !account.active,
      })
      toast.success(account.active ? "Akun dinonaktifkan" : "Akun diaktifkan", account.name)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal mengubah status akun."
      setError(message)
      toast.error("Gagal mengubah status akun", message)
    } finally {
      setBusyId(null)
    }
  }

  const activeCount = accounts.filter((account) => account.active).length

  return (
    <div className="mt-6 grid items-start gap-5 xl:grid-cols-[380px_minmax(0,1fr)]">
      <Card className="xl:sticky xl:top-6 xl:self-start">
        <CardHeader>
          <div>
            <CardTitle>{editing ? "Edit Akun" : "Tambah Akun"}</CardTitle>
            <p className="mt-0.5 text-[11px] text-muted">
              {editing ? "Perbarui data akun yang dipilih." : "Daftarkan pengguna baru ke sistem."}
            </p>
          </div>
          {editing ? <Badge tone="ember">Mode edit</Badge> : null}
        </CardHeader>

        <form onSubmit={onSubmit} className="space-y-3 p-4" noValidate>
          <Field label="Nama" htmlFor="account-name">
            <Input
              id="account-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Contoh: Kasir Satu"
              autoComplete="off"
            />
          </Field>

          <Field label="Email" htmlFor="account-email">
            <Input
              id="account-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="kasir@pointofsale.id"
              autoComplete="off"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Peran" htmlFor="account-role">
              <select
                id="account-role"
                value={role}
                onChange={(event) => setRole(event.target.value)}
                className={selectClass}
              >
                {ROLES.map((entry) => (
                  <option key={entry} value={entry}>
                    {entry}
                  </option>
                ))}
              </select>
            </Field>
            <Field
              label={editing ? "Password baru" : "Password"}
              htmlFor="account-password"
              hint={editing ? "Kosongkan jika tidak diubah" : undefined}
            >
              <Input
                id="account-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={editing ? "••••••••" : "Minimal 8 karakter"}
                autoComplete="new-password"
              />
            </Field>
          </div>

          {editing ? (
            <label className="flex items-center gap-2 rounded-xl border border-line bg-surface-2 px-3 py-2.5 text-xs font-semibold text-ink">
              <input
                type="checkbox"
                checked={active}
                onChange={(event) => setActive(event.target.checked)}
                className="h-4 w-4 accent-[#1f5d48]"
              />
              Akun aktif
            </label>
          ) : null}

          {error ? (
            <p role="alert" className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
              {error}
            </p>
          ) : null}

          <div className="flex gap-2 pt-1">
            <Button type="submit" className="flex-1" loading={saving}>
              {!saving ? <Save className="h-4 w-4" aria-hidden="true" /> : null}
              {saving ? "Menyimpan..." : editing ? "Simpan Perubahan" : "Tambah Akun"}
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
            <CardTitle>Daftar Akun</CardTitle>
            <p className="mt-0.5 text-[11px] text-muted">{accounts.length} akun terdaftar</p>
          </div>
          <Badge tone="success">{activeCount} aktif</Badge>
        </CardHeader>

        {accounts.length === 0 ? (
          <EmptyState icon={ShieldCheck} title="Belum ada akun" description="Tambahkan akun pertama lewat formulir di samping." />
        ) : (
          <Table>
            <THead>
              <TR>
                <TH>Nama</TH>
                <TH>Email</TH>
                <TH>Peran</TH>
                <TH>Status</TH>
                <TH className="text-right">Aksi</TH>
              </TR>
            </THead>
            <TBody>
              {accounts.map((account) => (
                <TR key={account.id}>
                  <TD className="font-semibold text-ink">{account.name}</TD>
                  <TD className="text-xs text-muted">{account.email}</TD>
                  <TD>
                    <Badge tone={roleTone[account.role] ?? "neutral"}>{account.role}</Badge>
                  </TD>
                  <TD>
                    <Badge tone={account.active ? "success" : "neutral"}>
                      {account.active ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </TD>
                  <TD>
                    <div className="flex justify-end gap-2">
                      <Button variant="secondary" size="sm" onClick={() => startEdit(account)} disabled={busyId === account.id}>
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleActive(account)}
                        loading={busyId === account.id}
                      >
                        {account.active ? "Nonaktifkan" : "Aktifkan"}
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
