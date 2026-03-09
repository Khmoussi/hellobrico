"use client"

import { useRef, useState, useEffect } from "react"
import Link from "next/link"

export function ArticleCTA() {
  const ctaRef = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true)
      },
      { threshold: 0.1 }
    )
    if (ctaRef.current) observer.observe(ctaRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={ctaRef} className="py-20">
      <div className="mx-auto max-w-4xl px-6">
        <div className={`bg-primary rounded-3xl p-10 md:p-14 text-center text-primary-foreground ${
          isVisible ? "animate-fade-up" : ""
        }`}>
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-5">
            Un projet en tête ?
          </h2>

          <p className="text-base md:text-lg mb-8 max-w-2xl mx-auto leading-relaxed text-primary-foreground/80">
            Lire est utile. Structurer votre rénovation l'est encore plus.
            Décrivez votre projet et recevez une estimation claire et détaillée.
          </p>

          <div className="flex justify-center">
            <Link
              href="/estimation"
              className="inline-flex w-full sm:w-auto items-center justify-center bg-card text-primary font-medium text-sm tracking-wide uppercase px-8 py-3.5 rounded-[10px] hover:bg-secondary transition-all duration-300"
            >
              Estimer mes travaux
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
