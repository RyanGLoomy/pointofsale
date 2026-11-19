import type { ReactNode } from "react"
import type { ShellUser } from "@/lib/session"
import { Sidebar } from "./Sidebar"

export function AppShell({ user, children }: { user: ShellUser; children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <Sidebar role={user.role} name={user.name} email={user.email} />
      <div className="pb-24 md:pb-0 md:pl-[86px]">
        <div className="mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-6 lg:px-8 lg:py-8">{children}</div>
      </div>
    </div>
  )
}
