import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { MobileCTA } from "@/components/mobile-cta"
import { ArticleHeader } from "@/components/magazine/article/article-header"
import { ArticleContent } from "@/components/magazine/article/article-content"
import { ExpertAdvice } from "@/components/magazine/article/expert-advice"
import { ArticleCTA } from "@/components/magazine/article/article-cta"
import { SimilarArticles } from "@/components/magazine/article/similar-articles"
import { api, type ArticleDto } from "@/lib/api"

interface ArticlePageProps {
  params: Promise<{
    slug: string
  }>
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

async function findArticle(slugOrId: string): Promise<ArticleDto | null> {
  if (isUuid(slugOrId)) {
    const byId = await api.articles.getById(slugOrId)
    if (byId.data && !byId.error) {
      return byId.data
    }
  }

  const listResponse = await api.articles.getAll(1, 100)
  if (listResponse.error || !listResponse.data) {
    return null
  }

  const list = Array.isArray(listResponse.data)
    ? listResponse.data
    : Array.isArray((listResponse.data as { data?: unknown[] }).data)
      ? ((listResponse.data as { data: ArticleDto[] }).data)
      : []

  return list.find((item) => item.slug === slugOrId) ?? null
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params
  const article = await findArticle(slug)

  if (!article) {
    notFound()
  }

  return (
    <>
      <Header />
      <main className="bg-background">
        <ArticleHeader article={article} />
        <ArticleContent article={article} />
        <ExpertAdvice />
        <ArticleCTA />
        <SimilarArticles currentArticleId={article.id} />
      </main>
      <Footer />
      <MobileCTA />
    </>
  )
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params
  const article = await findArticle(slug)

  if (!article) {
    return {
      title: "Article introuvable — HelloBrico Magazine",
      description: "Article magazine introuvable.",
    }
  }

  const description =
    article.excerpt ||
    "Conseils techniques, devis rénovation, suivi chantier et bonnes pratiques pour rénover en Tunisie avec méthode."

  return {
    title: `${article.title} — HelloBrico Magazine`,
    description,
    keywords: [
      "rénovation Tunisie",
      "devis rénovation",
      "suivi chantier",
      "rénovation complète",
      "HelloBrico magazine",
    ],
  }
}
