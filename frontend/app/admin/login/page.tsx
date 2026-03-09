"use client"

import { useState } from "react"
import { useAuth } from "@/components/admin/auth-context"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, ArrowRight, Lock } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function AdminLoginPage() {
  const { login } = useAuth()
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const success = await login(email, password)

    if (success) {
      router.replace("/admin")
    } else {
      setError("Email ou mot de passe incorrect.")
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left side - branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative flex-col justify-between p-12">
        <div>
          <Link href="/" className="flex items-center gap-3">
            <div className="relative w-10 h-10">
              <Image
                src="/images/logomark-blue.png"
                alt="HelloBrico Logo"
                fill
                className="object-contain"
              />
            </div>
            <div className="relative h-6 w-32">
              <Image
                src="/images/wordmark-blue.png"
                alt="HelloBrico"
                fill
                className="object-contain"
              />
            </div>
          </Link>
        </div>

        <div className="max-w-md">
          <h1 className="font-serif text-4xl font-bold text-primary-foreground leading-tight text-balance">
            {"Tableau de bord administration"}
          </h1>
          <p className="mt-4 text-primary-foreground/60 text-lg leading-relaxed">
            {"Gerez vos leads, projets, devis et contenus depuis un seul espace."}
          </p>
        </div>

        <div className="flex items-center gap-3 text-primary-foreground/40 text-sm">
          <Lock size={14} />
          <span>{"Acces reserve aux administrateurs"}</span>
        </div>

        {/* Decorative pattern */}
        <div className="absolute top-0 right-0 w-64 h-64 opacity-[0.03]">
          <svg viewBox="0 0 200 200" fill="currentColor" className="text-primary-foreground w-full h-full">
            <circle cx="100" cy="100" r="80" />
          </svg>
        </div>
        <div className="absolute bottom-0 left-0 w-96 h-96 opacity-[0.03]">
          <svg viewBox="0 0 200 200" fill="currentColor" className="text-primary-foreground w-full h-full">
            <circle cx="100" cy="100" r="80" />
          </svg>
        </div>
      </div>

      {/* Right side - form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-6 sm:p-12 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden mb-10">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative w-10 h-10">
                <Image
                  src="/images/logomark-blue.png"
                  alt="HelloBrico Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="relative h-6 w-32">
                <Image
                  src="/images/wordmark-blue.png"
                  alt="HelloBrico"
                  fill
                  className="object-contain"
                />
              </div>
            </Link>
          </div>

          <div className="mb-8">
            <h2 className="font-serif text-3xl font-bold text-foreground">
              {"Connexion"}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {"Entrez vos identifiants pour acceder au tableau de bord."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Email */}
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Adresse email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@hellobrico.tn"
                required
                className="h-12 rounded-lg border border-border bg-card px-4 text-sm text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring transition-all"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium text-foreground">
                  Mot de passe
                </label>
                <button
                  type="button"
                  className="text-xs text-accent hover:text-accent/80 transition-colors"
                >
                  {"Mot de passe oublie ?"}
                </button>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Votre mot de passe"
                  required
                  className="h-12 w-full rounded-lg border border-border bg-card px-4 pr-12 text-sm text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 h-12 rounded-lg bg-primary text-primary-foreground font-medium text-sm flex items-center justify-center gap-2 hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                  {"Connexion en cours..."}
                </>
              ) : (
                <>
                  {"Se connecter"}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

      

          <p className="mt-8 text-center text-xs text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">
              {"Retour au site"}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
