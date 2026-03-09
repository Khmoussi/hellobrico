"use client"

import Image from "next/image"
import Link from "next/link"
import { useRef, useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { api, getFilePublicUrl, type ArticleDto } from "@/lib/api"

const apiCategories = [
  "Tous",
  "CONSEILS_TECHNIQUES",
  "REALISATIONS",
  "BUDGET_PLANIFICATION",
  "ARCHITECTURE_FINITIONS",
  "SUIVI_CHANTIER",
]

const getCategoryLabel = (cat: string) => {
  const map: Record<string, string> = {
    CONSEILS_TECHNIQUES: "Conseils techniques",
    REALISATIONS: "Nos réalisations",
    BUDGET_PLANIFICATION: "Budget & planification",
    ARCHITECTURE_FINITIONS: "Architecture & finitions",
    SUIVI_CHANTIER: "Suivi de chantier"
  };
  return map[cat] || cat;
}



export function MagazineGrid() {
  const sectionRef = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [activeCategory, setActiveCategory] = useState("Tous")
  const [articles, setArticles] = useState<ArticleDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFilterFading, setIsFilterFading] = useState(false)

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await api.articles.getAll(1, 100);
        if (response.data) {
          const list = Array.isArray(response.data) ? response.data : response.data.data || [];
          // If the first item is featured, maybe we shouldn't slice it out, 
          // but we can skip it if the user wants. Since it wasn't requested, we'll show all.
          setArticles(list);
        }
      } catch (error) {
        console.error("Error fetching articles:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchArticles();

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true)
      },
      { threshold: 0.05 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  const filtered =
    activeCategory === "Tous"
      ? articles
      : articles.filter((a) => a.category === activeCategory)

  const handleCategoryChange = (category: string) => {
    if (category === activeCategory) return
    setIsFilterFading(true)
    window.setTimeout(() => {
      setActiveCategory(category)
      setIsFilterFading(false)
    }, 250)
  }

  return (
    <section ref={sectionRef} className="bg-card py-16 md:py-24 border-t border-border">
      <div className="mx-auto max-w-[1280px] px-6">
        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-10 scrollbar-hide">
          {apiCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {getCategoryLabel(cat)}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-opacity duration-300 ${isFilterFading ? "opacity-0" : "opacity-100"}`}>
          {isLoading ? (
            <div className="col-span-1 md:col-span-2 lg:col-span-3 py-12 flex flex-col items-center justify-center">
              <Loader2 className="animate-spin text-primary mb-4" size={32} />
              <p className="text-muted-foreground">Chargement des articles...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="col-span-1 md:col-span-2 lg:col-span-3 py-12 text-center text-muted-foreground">
              Aucun article trouvé pour cette catégorie.
            </div>
          ) : (
            filtered.map((article, index) => (
              <Link
                key={article.id}
                href={`/magazine/${article.slug || article.id}`}
                className={`group bg-background border border-border rounded-2xl overflow-hidden hover:border-primary/20 hover:shadow-lg transition-all duration-300 ${
                  isVisible ? "animate-fade-up" : ""
                }`}
                style={{ animationDelay: `${index * 60}ms` }}
              >
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={getFilePublicUrl(article.coverImage) || "/images/service-full.jpg"}
                    alt={article.title}
                    fill
                    className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
                  />
                </div>

                {/* Content */}
                <div className="p-5">
                  <span className="text-[11px] uppercase tracking-widest text-accent font-medium">
                    {getCategoryLabel(article.category)}
                  </span>
                  <h3 className="mt-2 font-serif text-lg font-semibold text-foreground leading-snug group-hover:underline underline-offset-2 line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                    {article.excerpt || "Découvrez notre dernier article."}
                  </p>
                  <span className="mt-3 inline-block text-sm font-medium text-primary">
                    Lire →
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </section>
  )
}
