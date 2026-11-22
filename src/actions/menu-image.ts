"use server"

import { del, put } from "@vercel/blob"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/session"
import { menuImagePath, validateMenuImage } from "@/lib/menu-image"

function revalidateMenuViews(): void {
  revalidatePath("/admin/menus")
  revalidatePath("/admin")
  revalidatePath("/kasir")
}

async function deleteBlobQuietly(url: string): Promise<void> {
  try {
    await del(url)
  } catch {
    // A stale blob must never block a menu update.
  }
}

/** Uploads a validated photo and stores its public URL on the menu row. */
export async function uploadMenuImage(menuId: string, formData: FormData): Promise<string> {
  await requirePermission("menu:manage")

  const file = formData.get("image")
  if (!(file instanceof File)) {
    throw new Error("Pilih gambar menu terlebih dahulu.")
  }

  const validated = validateMenuImage({ type: file.type, size: file.size, name: file.name })
  if (!validated.ok) throw new Error(validated.error)

  const existing = await prisma.menu.findUnique({
    where: { id: menuId },
    select: { imageUrl: true },
  })
  if (!existing) throw new Error("Menu tidak ditemukan.")

  const blob = await put(
    menuImagePath(menuId, validated.extension, crypto.randomUUID()),
    file,
    { access: "public", contentType: file.type },
  )

  await prisma.menu.update({
    where: { id: menuId },
    data: { imageUrl: blob.url },
  })

  if (existing.imageUrl && existing.imageUrl !== blob.url) {
    await deleteBlobQuietly(existing.imageUrl)
  }

  revalidateMenuViews()
  return blob.url
}

/** Removes the photo from the menu and deletes its blob. */
export async function removeMenuImage(menuId: string): Promise<void> {
  await requirePermission("menu:manage")

  const existing = await prisma.menu.findUnique({
    where: { id: menuId },
    select: { imageUrl: true },
  })
  if (!existing) throw new Error("Menu tidak ditemukan.")

  await prisma.menu.update({
    where: { id: menuId },
    data: { imageUrl: null },
  })

  if (existing.imageUrl) await deleteBlobQuietly(existing.imageUrl)

  revalidateMenuViews()
}
