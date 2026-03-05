"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { useRef, useState, useEffect } from "react"

export function CTAFinal() {
  const sectionRef = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true)
      },
      { threshold: 0.1 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="bg-primary py-20 md:py-28 overflow-hidden">
      <div className="mx-auto max-w-[1280px] px-6 text-center">
        <h2
          className={`font-serif text-3xl md:text-[44px] md:leading-[1.12] font-bold text-primary-foreground text-balance ${
            isVisible ? "animate-fade-up" : "opacity-0"
          }`}
        >
          {"Un projet en tête ?"}
        </h2>
        <p
          className={`mt-5 max-w-xl mx-auto text-base md:text-lg text-primary-foreground/80 leading-relaxed ${
            isVisible ? "animate-fade-up delay-100" : "opacity-0"
          }`}
        >
          {"Décrivez votre projet et recevez une estimation claire, structurée et sans engagement. Notre équipe vous répond rapidement."}
        </p>
        <div
          className={`mt-8 ${isVisible ? "animate-fade-up delay-200" : "opacity-0"}`}
        >
          <Link
            href="/estimation"
            className="inline-flex items-center justify-center gap-2 bg-card text-primary font-medium text-sm tracking-wide uppercase px-8 py-3.5 rounded-[10px] hover:bg-secondary hover:shadow-lg transition-all duration-300"
          >
            Estimer mes travaux
            <ArrowRight size={16} />
          </Link>
          <p className="mt-3 text-xs text-primary-foreground/50">
            {"Réponse rapide • Sans engagement • Projets en Tunisie & à distance"}
          </p>
        </div>
      </div>
    </section>
  )
}
