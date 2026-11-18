import { auth } from "@/auth"
import { NextResponse } from "next/server"

const roleHomeRoutes: Record<string, string> = {
  KASIR: "/kasir",
  ADMIN: "/admin",
  OWNER: "/owner",
}

export default auth((req) => {
  const session = req.auth
  const user = session?.user
  const role = user?.role

  if (!user?.id) {
    const loginUrl = new URL("/login", req.url)
    return NextResponse.redirect(loginUrl)
  }

  const path = req.nextUrl.pathname

  if (path.startsWith("/admin") && role !== "ADMIN" && role !== "OWNER") {
    const home = roleHomeRoutes[role ?? ""] ?? "/login"
    return NextResponse.redirect(new URL(home, req.url))
  }

  if (path.startsWith("/owner") && role !== "OWNER") {
    const home = roleHomeRoutes[role ?? ""] ?? "/login"
    return NextResponse.redirect(new URL(home, req.url))
  }

  if (path.startsWith("/kasir") && !["KASIR", "ADMIN", "OWNER"].includes(role ?? "")) {
    const home = roleHomeRoutes[role ?? ""] ?? "/login"
    return NextResponse.redirect(new URL(home, req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api/auth|_next|_vercel|favicon.ico).*)"],
}
