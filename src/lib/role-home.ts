/**
 * Role-based landing page for autenticated users.
 *
 * The root route (`/`) and the login page both redirect signed-in users
 * here, so the URL always lands on a role-aware destination instead of
 * bounced back to the login form.
 */
export function homePathForRole(role?: string | null): string {
  const normalized = role?.trim().toUpperCase()

  if (normalized === "ADMIN") return "/admin"
  if (normalized === "OWNER") return "/owner"
  return "/kasir"
}
