"use client"

import Image from "next/image"
import { useRef, useState, useEffect } from "react"
import { getFilePublicUrl, type ArticleDto } from "@/lib/api"

interface ArticleHeaderProps {
  article: ArticleDto
}

const getCategoryLabel = (cat: string) => {
  const map: Record<string, string> = {
    CONSEILS_TECHNIQUES: "Conseils techniques",
    REALISATIONS: "Nos realisations",
    BUDGET_PLANIFICATION: "Budget et planification",
    ARCHITECTURE_FINITIONS: "Architecture et finitions",
    SUIVI_CHANTIER: "Suivi de chantier",
  }

  return map[cat] || cat
}

export function ArticleHeader({ article }: ArticleHeaderProps) {
  const headerRef = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true)
      },
      { threshold: 0.1 }
    )
    if (headerRef.current) observer.observe(headerRef.current)
    return () => observer.disconnect()
  }, [])

  const coverUrl = getFilePublicUrl(article.coverImage) || "/images/service-bathroom.jpg"

  return (
    <header ref={headerRef} className="relative">
      {/* Image header */}
      <div className="relative aspect-[16/9] md:aspect-[21/9] overflow-hidden">
        <Image
          src={coverUrl}
          alt={article.title}
          fill
          className={`object-cover transition-all duration-1000 ${
            isVisible ? "scale-100 opacity-100" : "scale-105 opacity-90"
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      </div>

      {/* Titre et introduction */}
      <div className="relative -mt-20 mx-auto max-w-4xl px-6 pb-12">
        <div className="bg-background rounded-2xl shadow-xl p-8 md:p-12">
          <div className={`space-y-6 ${
            isVisible ? "animate-fade-up delay-200" : ""
          }`}>
            {/* Catégorie et métadonnées */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="text-accent font-medium uppercase tracking-wider">
                {getCategoryLabel(article.category)}
              </span>
              {article.publishedAt && (
                <>
                  <span>•</span>
                  <span>{new Date(article.publishedAt).toLocaleDateString("fr-FR")}</span>
                </>
              )}
            </div>

            {/* Titre principal */}
            <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
              {article.title}
            </h1>

            {/* Introduction */}
            <div className="prose prose-lg max-w-none">
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                {article.excerpt || "Decouvrez notre dernier article magazine."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
