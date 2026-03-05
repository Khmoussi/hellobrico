import Link from "next/link"
import { Phone, Mail, MapPin } from "lucide-react"

function FacebookIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  )
}

function InstagramIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  )
}

function LinkedInIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="mx-auto max-w-[1280px] px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <span className="font-serif text-2xl font-bold">HelloBrico</span>
            <p className="mt-4 text-sm text-primary-foreground/70 leading-relaxed">
              {"Rénovation premium avec méthode, transparence et supervision quotidienne."}
            </p>
            {/* Social links */}
            <div className="mt-5 flex items-center gap-3">
              {[
                { icon: FacebookIcon, href: "#", label: "Facebook" },
                { icon: InstagramIcon, href: "#", label: "Instagram" },
                { icon: LinkedInIcon, href: "#", label: "LinkedIn" },
              ].map((social) => {
                const Icon = social.icon
                return (
                  <Link
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="w-8 h-8 rounded-lg bg-primary-foreground/10 flex items-center justify-center text-primary-foreground/60 hover:bg-primary-foreground/20 hover:text-primary-foreground transition-all duration-200"
                  >
                    <Icon size={14} />
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-primary-foreground/50 mb-4">
              Navigation
            </h4>
            <nav className="flex flex-col gap-2.5">
              {[
                { label: "Accueil", href: "/" },
                { label: "Services", href: "/services" },
                { label: "Magazine", href: "/magazine" },
                { label: "Estimation", href: "/estimation" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-primary-foreground/50 mb-4">
              Services
            </h4>
            <nav className="flex flex-col gap-2.5">
              {[
                "Salle de bain",
                "Cuisine",
                "Rénovation complète",
                "Bureaux & locaux",
              ].map((item) => (
                <Link
                  key={item}
                  href="/services"
                  className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                >
                  {item}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-primary-foreground/50 mb-4">
              Contact
            </h4>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2.5 text-sm text-primary-foreground/70">
                <Phone size={14} />
                <span>+216 XX XXX XXX</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm text-primary-foreground/70">
                <Mail size={14} />
                <span>contact@hellobrico.tn</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm text-primary-foreground/70">
                <MapPin size={14} />
                <span>Tunis, Tunisie</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-primary-foreground/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-primary-foreground/40">
            {"© 2026 HelloBrico. Tous droits réservés."}
          </p>
          <div className="flex gap-6">
            <Link
              href="#"
              className="text-xs text-primary-foreground/40 hover:text-primary-foreground/70 transition-colors"
            >
              {"Mentions légales"}
            </Link>
            <Link
              href="#"
              className="text-xs text-primary-foreground/40 hover:text-primary-foreground/70 transition-colors"
            >
              {"Politique de confidentialité"}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
