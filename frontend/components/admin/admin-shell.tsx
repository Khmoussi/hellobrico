"use client"

import { usePathname } from "next/navigation"
import { AuthProvider } from "./auth-context"
import { AuthGuard } from "./auth-guard"
import { AdminSidebar } from "./admin-sidebar"

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AuthGuard>
        <AdminContent>{children}</AdminContent>
      </AuthGuard>
    </AuthProvider>
  )
}

function AdminContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLoginPage = pathname === "/admin/login"

  // Login page renders full-screen, no sidebar
  if (isLoginPage) {
    return <>{children}</>
  }

  // All other admin pages get the sidebar layout
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 bg-background overflow-y-auto lg:ml-[272px]">{children}</main>
    </div>
  )
}
