"use client"

import { useAuth } from "./auth-context"
import { usePathname, useRouter } from "next/navigation"
import { canAccessAdminRoute } from "./auth-context"
import { useEffect } from "react"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  const isLoginPage = pathname === "/admin/login"
  const isUnauthorizedRoute = Boolean(
    user && !isLoginPage && !canAccessAdminRoute(user.role, pathname),
  )

  useEffect(() => {
    if (!isAuthenticated || isLoginPage || !user) return
    if (!canAccessAdminRoute(user.role, pathname)) {
      router.replace("/admin")
    }
  }, [isAuthenticated, isLoginPage, pathname, router, user])

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-muted border-t-primary" />
          <p className="text-sm text-muted-foreground">Chargement...</p>
        </div>
      </div>
    )
  }

  // If on login page, always render children (the login form)
  if (isLoginPage) {
    return <>{children}</>
  }

  // If not authenticated and not on login page, show nothing (redirect happens in context)
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-muted border-t-primary" />
          <p className="text-sm text-muted-foreground">Redirection...</p>
        </div>
      </div>
    )
  }

  if (isUnauthorizedRoute) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-muted border-t-primary" />
          <p className="text-sm text-muted-foreground">Redirection...</p>
        </div>
      </div>
    )
  }

  // Authenticated, render the dashboard
  return <>{children}</>
}
