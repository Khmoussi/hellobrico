"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { api, getFilePublicUrl, type ArticleDto } from "@/lib/api"

interface SimilarArticlesProps {
  currentArticleId: string
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

export function SimilarArticles({ currentArticleId }: SimilarArticlesProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [articles, setArticles] = useState<ArticleDto[]>([])

  useEffect(() => {
    const fetchSimilar = async () => {
      const response = await api.articles.getAll(1, 6)

      if (!response.data || response.error) {
        setArticles([])
        return
      }

      const list = Array.isArray(response.data)
        ? response.data
        : Array.isArray((response.data as { data?: unknown[] }).data)
          ? ((response.data as { data: ArticleDto[] }).data)
          : []

      setArticles(list.filter((item) => item.id !== currentArticleId).slice(0, 3))
    }

    fetchSimilar()

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true)
      },
      { threshold: 0.1 }
    )

    if (sectionRef.current) observer.observe(sectionRef.current)

    return () => observer.disconnect()
  }, [currentArticleId])

  if (articles.length === 0) {
    return null
  }

  return (
    <section ref={sectionRef} className="py-16 bg-muted/30">
      <div className="mx-auto max-w-6xl px-6">
        <div className={`${isVisible ? "animate-fade-up" : ""} text-center mb-12`}>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
            Articles similaires
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Continuez votre lecture avec des articles complementaires.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {articles.map((article, index) => (
            <Link
              key={article.id}
              href={`/magazine/${article.slug || article.id}`}
              className={`group bg-background rounded-2xl overflow-hidden border border-border hover:border-primary/20 hover:shadow-lg transition-all duration-300 ${
                isVisible ? "animate-fade-up" : ""
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={getFilePublicUrl(article.coverImage) || "/images/service-full.jpg"}
                  alt={article.title}
                  fill
                  className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
                />
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] uppercase tracking-widest text-accent font-medium">
                    {getCategoryLabel(article.category)}
                  </span>
                </div>

                <h3 className="font-serif text-lg font-semibold text-foreground leading-snug group-hover:underline underline-offset-2 line-clamp-2 mb-3">
                  {article.title}
                </h3>

                <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed mb-4">
                  {article.excerpt || "Decouvrez cet article de notre magazine."}
                </p>

                <span className="inline-flex items-center text-sm font-medium text-primary group-hover:translate-x-1 transition-transform duration-200">
                  Lire l'article
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className={`${isVisible ? "animate-fade-up delay-300" : ""} text-center mt-12`}>
          <Link
            href="/magazine"
            className="inline-flex items-center justify-center bg-primary text-primary-foreground font-medium text-sm tracking-wide uppercase px-8 py-3.5 rounded-xl hover:bg-primary/90 transition-all duration-300"
          >
            Voir tous les articles
          </Link>
        </div>
      </div>
    </section>
  )
}
