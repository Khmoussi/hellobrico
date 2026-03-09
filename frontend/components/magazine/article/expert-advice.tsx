"use client"

import { useRef, useState, useEffect } from "react"
import Link from "next/link"

export function ExpertAdvice() {
  const adviceRef = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true)
      },
      { threshold: 0.1 }
    )
    if (adviceRef.current) observer.observe(adviceRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={adviceRef} className="py-16">
      <div className="mx-auto max-w-4xl px-6">
        <div className={`bg-[#F7F4EF] border-l-4 border-primary rounded-r-2xl p-8 md:p-10 ${
          isVisible ? "animate-fade-up" : ""
        }`}>
          <h3 className="font-serif text-2xl font-bold text-primary mb-3">
            Conseil HelloBrico
          </h3>
          <p className="text-base text-foreground/85 leading-relaxed">
            Toujours prévoir un diagnostic technique avant toute estimation budgétaire.
            C'est la base pour éviter les écarts de budget et sécuriser la planification.
          </p>

          <div className="mt-7 text-center">
            <Link
              href="/estimation"
              className="inline-flex items-center justify-center bg-primary text-primary-foreground font-medium text-sm tracking-wide uppercase px-8 py-3.5 rounded-[10px] hover:bg-[#0A1F35] transition-all duration-300"
            >
              Demander une estimation personnalisée
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
