"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import {
  api,
  ARTICLE_CATEGORIES,
  ARTICLE_CATEGORY_LABELS,
  getFilePublicUrl,
  type ArticleCategory,
  type ArticleDto,
  type UpdateArticleDto,
} from "@/lib/api"
import { useAuth } from "@/components/admin/auth-context"

const SETTINGS_STORAGE_KEY = "hb_admin_settings_v1"

const getCategoryLabel = (cat: string) => {
  return ARTICLE_CATEGORY_LABELS[cat as ArticleCategory] || cat
}

export default function EditArticle() {
  const params = useParams()
  const router = useRouter()
  const { token } = useAuth()
  
  const [article, setArticle] = useState<ArticleDto | null>(null)
  const [activeCategories, setActiveCategories] = useState<string[]>([...ARTICLE_CATEGORIES])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "CONSEILS_TECHNIQUES" as string,
    status: "BROUILLON" as "BROUILLON" | "PUBLIE"
  })

  const articleId = params.id as string

  useEffect(() => {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY)
    if (!stored) return

    try {
      const parsed = JSON.parse(stored) as { magazineCategories?: string[] }
      const persistedSource = Array.isArray(parsed.magazineCategories)
        ? parsed.magazineCategories
        : undefined

      if (!persistedSource) return

      const selected = persistedSource.filter((cat) => ARTICLE_CATEGORIES.includes(cat as ArticleCategory))
      setActiveCategories(selected)
    } catch {
      // Keep defaults if local storage is malformed.
    }
  }, [])

  useEffect(() => {
    const fetchArticle = async () => {
      if (!token || !articleId) return
      
      setIsLoading(true)
      try {
        const response = await api.admin.articles.getById(articleId, token)
        if (response.error) {
          throw new Error(response.error)
        }
        
        // Handle different API response structures
        let articleData = null;
        if (response.data) {
          const responseData = response.data as any;
          if (responseData.data) {
            articleData = responseData.data;
          } else if (responseData.article) {
            articleData = responseData.article;
          } else {
            articleData = response.data;
          }
        }
        
        if (articleData) {
          setArticle(articleData)
          setFormData({
            title: articleData.title || "",
            excerpt: articleData.excerpt || "",
            content: articleData.content || "",
            category: articleData.category || "CONSEILS_TECHNIQUES",
            status: (articleData.status === "PUBLIE" ? "PUBLIE" : "BROUILLON") as "BROUILLON" | "PUBLIE"
          })
        }
      } catch (error) {
        console.error("Failed to fetch article for edit:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchArticle()
  }, [articleId, token])

  const handleSubmit = async (publish: boolean) => {
    if (!token || !articleId) return
    
    if (!formData.title || !formData.content) {
      alert("Le titre et le contenu sont requis.");
      return;
    }
    
    setIsSubmitting(true)
    try {
      let coverImageId = article?.coverImageId
      
      // Upload new cover image if provided
      if (coverFile) {
        const uploadRes = await api.upload.uploadFile(coverFile)
        if (uploadRes.data && uploadRes.data.id) {
          coverImageId = uploadRes.data.id
        } else {
          alert("Erreur lors de l'upload de l'image.")
          return
        }
      }

      // Prepare update data
      const updateData: UpdateArticleDto = {
        title: formData.title,
        excerpt: formData.excerpt,
        content: formData.content,
        category: formData.category,
        status: publish ? "PUBLIE" : "BROUILLON",
        coverImageId: coverImageId
      }

      const response = await api.admin.articles.update(articleId, updateData, token)

      if (response.error) {
        throw new Error(response.error)
      }

      alert(publish ? "Article publié avec succès !" : "Article mis à jour avec succès !")
      router.push("/admin/magazine")
      
    } catch (error) {
      console.error("Failed to update article:", error)
      alert("Erreur lors de la mise à jour de l'article.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Chargement de l'article...</span>
      </div>
    )
  }

  const availableCategories = activeCategories.includes(formData.category)
    ? activeCategories
    : [formData.category, ...activeCategories]

  if (!article) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">Article non trouvé</h2>
          <p className="text-muted-foreground">L'article que vous essayez de modifier n'existe pas.</p>
          <button 
            onClick={() => router.push("/admin/magazine")}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Retour à la liste
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 max-w-[1000px]">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/admin/magazine")}
            className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={16} className="mr-2" />
            Retour à la liste
          </button>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground">
            Modifier l'article
          </h1>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => handleSubmit(false)}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium bg-card border border-border text-foreground rounded-lg hover:bg-muted transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting && <Loader2 size={14} className="animate-spin" />}
            Sauvegarder
          </button>
          <button 
            onClick={() => handleSubmit(true)}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-[#0A1F35] transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting && <Loader2 size={14} className="animate-spin" />}
            Publier
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Current cover image */}
        {article.coverImage && (
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-sm text-muted-foreground mb-2">Image de couverture actuelle:</p>
            <img 
              src={getFilePublicUrl(article.coverImage) || ""} 
              alt={article.title}
              className="w-full max-w-md rounded-lg"
            />
          </div>
        )}

        {/* New image upload */}
        <div className="border-2 border-dashed border-input rounded-xl p-6 text-center hover:border-primary/30 transition-colors bg-card relative">
          <input 
            type="file" 
            accept="image/*"
            onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          {coverFile ? (
            <p className="text-sm font-medium text-primary">Nouvelle image : {coverFile.name}</p>
          ) : (
            <p className="text-sm text-muted-foreground">Changer l'image de couverture (optionnel)</p>
          )}
        </div>

        {/* Title and Excerpt */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">Titre *</label>
            <input
              type="text"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              placeholder="Titre de l'article..."
              className="w-full px-4 py-3 bg-card border border-input rounded-xl text-foreground text-lg font-serif font-semibold placeholder:text-muted-foreground/40 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">Extrait (Optionnel)</label>
            <textarea
              value={formData.excerpt}
              onChange={e => setFormData({...formData, excerpt: e.target.value})}
              placeholder="Résumé court visible sur les listes..."
              rows={2}
              className="w-full px-4 py-3 bg-card border border-input rounded-xl text-foreground text-sm placeholder:text-muted-foreground/40 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
            />
          </div>
        </div>

        {/* Category and Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">Catégorie *</label>
            <select 
              value={formData.category}
              onChange={e => setFormData({...formData, category: e.target.value})}
              className="w-full px-4 py-3 bg-card border border-input rounded-xl text-sm text-foreground focus:border-primary outline-none"
              disabled={activeCategories.length === 0}
            >
              {availableCategories.map(c => (
                <option key={c} value={c}>{getCategoryLabel(c)}</option>
              ))}
            </select>
            {activeCategories.length === 0 ? (
              <p className="text-xs text-amber-700 mt-2">
                Aucune categorie active. Activez une categorie depuis Parametres.
              </p>
            ) : null}
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">Statut</label>
            <select 
              value={formData.status}
              onChange={e => setFormData({...formData, status: e.target.value as "BROUILLON" | "PUBLIE"})}
              className="w-full px-4 py-3 bg-card border border-input rounded-xl text-sm text-foreground focus:border-primary outline-none"
            >
              <option value="BROUILLON">Brouillon</option>
              <option value="PUBLIE">Publié</option>
            </select>
          </div>
        </div>

        {/* Content */}
        <div>
          <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">
            Contenu (Markdown ou HTML supporté) *
          </label>
          <textarea
            value={formData.content}
            onChange={e => setFormData({...formData, content: e.target.value})}
            placeholder="Écrivez votre article ici..."
            rows={16}
            className="w-full px-4 py-3 bg-card border border-input rounded-xl text-foreground text-base leading-relaxed placeholder:text-muted-foreground/40 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
          />
        </div>
      </div>
    </div>
  )
}
