export const MAX_MENU_IMAGE_BYTES = 2 * 1024 * 1024

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
}

export interface UploadCandidate {
  type: string
  size: number
  name: string
}

export type ValidationResult = { ok: true; extension: string } | { ok: false; error: string }

/** Validates a menu photo before it is sent to blob storage. */
export function validateMenuImage(file: UploadCandidate | null | undefined): ValidationResult {
  if (!file) return { ok: false, error: "Pilih gambar menu terlebih dahulu." }
  if (file.size <= 0) return { ok: false, error: "Gambar kosong tidak boleh diunggah." }
  if (file.size > MAX_MENU_IMAGE_BYTES) {
    return { ok: false, error: "Ukuran gambar maksimal 2 MB." }
  }

  const extension = EXTENSIONS[file.type]
  if (!extension) {
    return { ok: false, error: "Format harus JPG, PNG, atau WebP." }
  }

  const nameExtension = file.name.toLowerCase().split(".").pop()
  if (nameExtension !== extension && !(extension === "jpg" && nameExtension === "jpeg")) {
    return { ok: false, error: "Ekstensi file tidak sesuai dengan format gambar." }
  }

  return { ok: true, extension }
}

/** Collision-free, predictable path inside the menu-images Blob store. */
export function menuImagePath(menuId: string, extension: string, randomId: string): string {
  return `menus/${menuId}/${randomId}.${extension}`
}
