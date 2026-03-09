"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react"
import { useRouter, usePathname } from "next/navigation"

interface AuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  user: AuthUser | null
  token: string | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
}

export type AdminRole = "ADMIN" | "COMMERCIAL" | "SUPERVISOR"

export interface AuthUser {
  id: string
  email: string
  name: string
  role: AdminRole
}

const ALLOWED_ADMIN_ROUTES: Record<AdminRole, string[]> = {
  ADMIN: [
    "/admin",
    "/admin/leads",
    "/admin/projects",
    "/admin/quotes",
    "/admin/magazine",
    "/admin/settings",
  ],
  COMMERCIAL: ["/admin", "/admin/leads", "/admin/projects", "/admin/quotes"],
  SUPERVISOR: ["/admin", "/admin/projects"],
}

const normalizeRole = (role?: string): AdminRole => {
  const value = (role || "").trim().toUpperCase()
  if (value === "COMMERCIAL") return "COMMERCIAL"
  if (value === "SUPERVISOR") return "SUPERVISOR"
  return "ADMIN"
}

export const canAccessAdminRoute = (role: AdminRole, pathname: string): boolean => {
  const allowed = ALLOWED_ADMIN_ROUTES[role]
  return allowed.some((route) => (route === "/admin" ? pathname === "/admin" : pathname.startsWith(route)))
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const AUTH_KEY = "hb_admin_auth"
import { api } from "@/lib/api"

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  // Check session on mount
  useEffect(() => {
    const bootstrapSession = async () => {
      const stored = sessionStorage.getItem(AUTH_KEY)
      if (!stored) {
        setIsLoading(false)
        return
      }

      try {
        const parsed = JSON.parse(stored)
        const savedToken = parsed.token as string | undefined
        const savedUser = parsed.user as AuthUser | undefined

        if (!savedToken || !savedUser) {
          sessionStorage.removeItem(AUTH_KEY)
          setIsLoading(false)
          return
        }

        const meRes = await api.auth.me(savedToken)
        if (meRes.error || !meRes.data) {
          sessionStorage.removeItem(AUTH_KEY)
          setIsLoading(false)
          return
        }

        const userData: AuthUser = {
          id: meRes.data.id || savedUser.id || "",
          email: meRes.data.email || savedUser.email,
          name: meRes.data.name || savedUser.name || "Admin",
          role: normalizeRole(meRes.data.role || savedUser.role),
        }

        setUser(userData)
        setToken(savedToken)
        setIsAuthenticated(true)
        sessionStorage.setItem(AUTH_KEY, JSON.stringify({ user: userData, token: savedToken }))
      } catch {
        sessionStorage.removeItem(AUTH_KEY)
      } finally {
        setIsLoading(false)
      }
    }

    void bootstrapSession()
  }, [])

  // Redirect logic
  useEffect(() => {
    if (isLoading) return

    const isLoginPage = pathname === "/admin/login"

    if (!isAuthenticated && !isLoginPage) {
      router.replace("/admin/login")
    }

    if (isAuthenticated && isLoginPage) {
      router.replace("/admin")
    }
  }, [isAuthenticated, isLoading, pathname, router])

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await api.auth.login(email, password)

      if (response.data) {
        const tokenStr = response.data.accessToken?.token || response.data.accessToken?.token || ''
        const userData: AuthUser = {
          id: response.data.user?.id || "",
          email: response.data.user?.email || email, 
          name: response.data.user?.name || "Admin",
          role: normalizeRole(response.data.user?.role),
        }
        setUser(userData)
        setToken(tokenStr)
        setIsAuthenticated(true)
        sessionStorage.setItem(AUTH_KEY, JSON.stringify({ user: userData, token: tokenStr }))
        return true
      }
      return false
    } catch (err) {
      console.error("Login error:", err)
      return false
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setToken(null)
    setIsAuthenticated(false)
    sessionStorage.removeItem(AUTH_KEY)
    router.replace("/admin/login")
  }, [router])

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
