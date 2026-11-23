import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/session"
import { PageHeader } from "@/components/shell/PageHeader"
import { Badge } from "@/components/ui/badge"
import { AccountManager } from "@/components/AccountManager"

export const metadata = { title: "Kelola Akun" }

export default async function AdminAccountsPage() {
  await requirePermission("users:manage")

  const dbUsers = await prisma.user.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, email: true, role: true, active: true },
  })

  const users = dbUsers.map((user) => ({ ...user, name: user.name ?? user.email }))

  return (
    <>
      <PageHeader
        eyebrow="Pengaturan"
        title="Kelola Akun"
        description="Atur pengguna, peran, dan status akses ke sistem."
        actions={<Badge tone="ember">{users.length} akun</Badge>}
      />
      <AccountManager accounts={users} />
    </>
  )
}

export const dynamic = "force-dynamic"
