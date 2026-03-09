"use client"

import { useRef, useState, useEffect } from "react"

export function MagazineNewsletter() {
  const sectionRef = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [email, setEmail] = useState("")
  const [isSubscribed, setIsSubscribed] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true)
      },
      { threshold: 0.1 },
    )

    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!email.trim() || !email.includes("@")) return
    setIsSubscribed(true)
    setEmail("")
  }

  return (
    <section ref={sectionRef} className="bg-background py-16 md:py-20">
      <div className="mx-auto max-w-[1280px] px-6">
        <div
          className={`rounded-2xl border border-border bg-card p-6 md:p-8 ${
            isVisible ? "animate-fade-up" : "opacity-0"
          }`}
        >
          <div className="max-w-3xl mx-auto text-center">
            <span className="text-[11px] uppercase tracking-[0.16em] text-primary font-semibold">
              Newsletter Premium
            </span>
            <h3 className="mt-3 font-serif text-2xl md:text-3xl font-bold text-foreground">
              Recevez nos conseils rénovation en avant-première
            </h3>
            <p className="mt-3 text-sm md:text-base text-muted-foreground leading-relaxed">
              Études de cas, méthodes terrain, budgets réalistes et bonnes pratiques
              pour rénover avec méthode et sérénité.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 max-w-xl mx-auto flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Votre email"
              className="flex-1 h-11 rounded-[10px] border border-input bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary"
              aria-label="Votre email"
            />
            <button
              type="submit"
              className="h-11 px-6 rounded-[10px] bg-primary text-primary-foreground text-sm font-medium tracking-wide uppercase hover:bg-[#0A1F35] transition-colors"
            >
              S'abonner
            </button>
          </form>

          {isSubscribed && (
            <p className="mt-3 text-center text-xs text-primary">
              Merci. Vous êtes inscrit à la newsletter HelloBrico Magazine.
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
