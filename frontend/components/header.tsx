"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X } from "lucide-react"

interface HeaderProps {
  forceSolid?: boolean
}

export function Header({ forceSolid = false }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        forceSolid || scrolled
          ? "bg-card shadow-sm border-b border-border"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-[1280px] px-6 flex items-center justify-between h-[72px]">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="relative w-10 h-10">
            <Image
              src={forceSolid || scrolled ? "/images/logomark-blue.png" : "/images/logomark-white.png"}
              alt="HelloBrico Logo"
              fill
              className="object-contain"
            />
          </div>
          <div className="relative h-6 w-32">
            <Image
              src={forceSolid || scrolled ? "/images/wordmark-blue.png" : "/images/wordmark-white.png"}
              alt="HelloBrico"
              fill
              className="object-contain"
            />
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {[
            { label: "Accueil", href: "/" },
            { label: "Services", href: "/services" },
            { label: "Magazine", href: "/magazine" },
            { label: "Estimation", href: "/estimation" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-medium tracking-wide transition-colors duration-300 hover:opacity-80 ${
                forceSolid || scrolled ? "text-foreground" : "text-primary-foreground"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <Link
          href="/estimation"
          className={`hidden md:inline-flex text-sm font-medium tracking-wide px-5 py-2.5 rounded-[10px] transition-all duration-300 ${
            forceSolid || scrolled
              ? "bg-primary text-primary-foreground hover:bg-[#0A1F35]"
              : "border border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10"
          }`}
        >
          Estimer mes travaux
        </Link>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className={`md:hidden transition-colors duration-300 ${
            forceSolid || scrolled ? "text-foreground" : "text-primary-foreground"
          }`}
          aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-card border-t border-border">
          <nav className="flex flex-col px-6 py-4 gap-3">
            {[
              { label: "Accueil", href: "/" },
              { label: "Services", href: "/services" },
              { label: "Magazine", href: "/magazine" },
              { label: "Estimation", href: "/estimation" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="text-foreground text-base py-2 border-b border-border last:border-b-0"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/estimation"
              onClick={() => setMobileOpen(false)}
              className="mt-2 text-center bg-primary text-primary-foreground py-3 rounded-[10px] text-sm font-medium tracking-wide"
            >
              Estimer mes travaux
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
