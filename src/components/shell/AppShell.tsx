import type { ReactNode } from "react"
import type { ShellUser } from "@/lib/session"
import { Sidebar } from "./Sidebar"

export function AppShell({ user, children }: { user: ShellUser; children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[80] focus:rounded-lg focus:bg-ember focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-[#f4f1e9]"
      >
        Lewati ke konten
      </a>
      <Sidebar role={user.role} name={user.name} email={user.email} />
      <div className="pb-24 md:pb-0 md:pl-[212px]">
        <div className="mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
          <main id="main-content" tabIndex={-1} className="outline-none">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
