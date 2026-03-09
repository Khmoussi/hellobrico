"use client"

import Image from "next/image"
import Link from "next/link"
import { useRef, useState, useEffect } from "react"
import { api, getFilePublicUrl, type ArticleDto } from "@/lib/api"

const getCategoryLabel = (cat: string) => {
  const map: Record<string, string> = {
    CONSEILS_TECHNIQUES: "Conseils Techniques",
    REALISATIONS: "Réalisations",
    ETUDE_DE_CAS: "Étude de cas",
    BUDGET_PLANIFICATION: "Budget & Planification",
    ARCHITECTURE_FINITIONS: "Architecture & Finitions",
    SUIVI_CHANTIER: "Suivi Chantier"
  };
  return map[cat] || cat;
}

export function MagazineFeatured() {
  const sectionRef = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [featuredArticle, setFeaturedArticle] = useState<ArticleDto | null>(null)

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await api.articles.getAll(1, 1);
        if (response.data) {
          const list = Array.isArray(response.data) ? response.data : response.data.data || [];
          if (list.length > 0) {
            setFeaturedArticle(list[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching featured article:", error);
      }
    };
    fetchFeatured();

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true)
      },
      { threshold: 0.1 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  if (!featuredArticle) {
    return null; // Don't show featured if there are no articles
  }

  const featuredCover = getFilePublicUrl(featuredArticle?.coverImage) || "/images/article-featured.jpg"
  const fallbackTitle = "Comment structurer une rénovation complète sans dépassement budgétaire ?"
  const fallbackExcerpt = "Une rénovation complète ne dépend pas uniquement des travaux réalisés. Elle repose sur un devis structuré, une planification maîtrisée et une supervision continue."
  const displayCategory = getCategoryLabel(featuredArticle.category || "ETUDE_DE_CAS") || "Étude de cas"

  return (
    <section ref={sectionRef} className="bg-background py-16 md:py-24">
      <div className="mx-auto max-w-[1280px] px-6">
        <div
          className={`flex flex-col md:flex-row gap-8 items-center ${
            isVisible ? "animate-fade-up" : ""
          }`}
        >
          {/* Image */}
          <div className="w-full md:w-7/12 relative aspect-[16/10] rounded-2xl overflow-hidden">
            <Image
              src={featuredCover}
              alt={featuredArticle.title}
              fill
              className="object-cover"
            />
          </div>

          {/* Content */}
          <div className="w-full md:w-5/12">
            <span className="text-xs uppercase tracking-widest text-accent font-medium">
              {displayCategory}
            </span>
            <h2 className="mt-3 font-serif text-2xl md:text-3xl font-bold text-foreground leading-tight text-balance">
              {featuredArticle.title || fallbackTitle}
            </h2>
            <p className="mt-4 text-base text-muted-foreground leading-relaxed">
              {featuredArticle.excerpt || fallbackExcerpt}
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Link
                href={`/magazine/${featuredArticle.slug || featuredArticle.id}`}
                className="inline-flex items-center justify-center border border-border text-foreground font-medium text-sm px-5 py-2.5 rounded-[10px] hover:bg-muted transition-all duration-300"
              >
                {"Lire l'article"}
              </Link>
              <Link
                href="/estimation"
                className="inline-flex items-center justify-center bg-primary text-primary-foreground font-medium text-sm tracking-wide uppercase px-5 py-2.5 rounded-[10px] hover:bg-[#0A1F35] transition-all duration-300"
              >
                Estimer mes travaux
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
