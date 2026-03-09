"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import type { ArticleDto } from "@/lib/api"

interface ArticleContentProps {
  article: ArticleDto
}

export function ArticleContent({ article }: ArticleContentProps) {
  const contentRef = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  const isHtmlContent = useMemo(() => /<[^>]+>/.test(article.content), [article.content])

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true)
      },
      { threshold: 0.1 }
    )

    if (contentRef.current) observer.observe(contentRef.current)

    return () => observer.disconnect()
  }, [])

  return (
    <section ref={contentRef} className="py-16">
      <div className="mx-auto max-w-4xl px-6">
        <article
          className={`prose prose-lg max-w-none ${
            isVisible ? "animate-fade-up" : ""
          }`}
        >
          {isHtmlContent ? (
            <div dangerouslySetInnerHTML={{ __html: article.content }} />
          ) : (
            article.content
              .split("\n")
              .filter((line) => line.trim().length > 0)
              .map((paragraph, index) => (
                <p key={`${article.id}-${index}`} className="text-foreground leading-relaxed mb-6">
                  {paragraph}
                </p>
              ))
          )}
        </article>
      </div>
    </section>
  )
}
