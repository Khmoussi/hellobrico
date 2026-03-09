"use client"

import { useState, useEffect } from "react"
import {
  Search,
  Plus,
  Edit3,
  Eye,
  Globe,
  Calendar,
  Tag,
  Image as ImageIcon,
  Loader2,
} from "lucide-react"
import {
  api,
  ARTICLE_CATEGORIES,
  ARTICLE_CATEGORY_LABELS,
  getFilePublicUrl,
  type ArticleCategory,
  type ArticleDto,
} from "@/lib/api"
import { useAuth } from "@/components/admin/auth-context"
import { useRouter } from "next/navigation"

const SETTINGS_STORAGE_KEY = "hb_admin_settings_v1"
const articleStatuses = ["Tous", "PUBLIE", "BROUILLON"]

const articleStatusColors: Record<string, string> = {
  "PUBLIE": "bg-green-50 text-green-700",
  "BROUILLON": "bg-amber-50 text-amber-700",
}

const getCategoryLabel = (cat: string) => {
  return ARTICLE_CATEGORY_LABELS[cat as ArticleCategory] || cat
}

export default function AdminMagazine() {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("Tous")
  const [statusFilter, setStatusFilter] = useState("Tous")
  
  const [articles, setArticles] = useState<ArticleDto[]>([])
  const [activeCategories, setActiveCategories] = useState<string[]>([...ARTICLE_CATEGORIES])
  const [isLoading, setIsLoading] = useState(true)
  const [showEditor, setShowEditor] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { token } = useAuth()

  // New Article Form state
  const [newArticle, setNewArticle] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "CONSEILS_TECHNIQUES" as ArticleCategory,
    status: "BROUILLON" as "BROUILLON" | "PUBLIE"
  });
  const [coverFile, setCoverFile] = useState<File | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY)
    if (!stored) return

    try {
      const parsed = JSON.parse(stored) as { magazineCategories?: string[] }
      const persistedSource = Array.isArray(parsed.magazineCategories)
        ? parsed.magazineCategories
        : undefined
      const hasPersistedCategories = Boolean(persistedSource)
      const selected = persistedSource
        ? persistedSource.filter((cat) => ARTICLE_CATEGORIES.includes(cat as ArticleCategory))
        : []

      if (!hasPersistedCategories) return

      setActiveCategories(selected)
      setCategoryFilter((prev) => (prev === "Tous" || selected.includes(prev) ? prev : "Tous"))
      setNewArticle((prev) => ({
        ...prev,
        category: selected.includes(prev.category)
          ? (prev.category as ArticleCategory)
          : ((selected[0] || ARTICLE_CATEGORIES[0]) as ArticleCategory),
      }))
    } catch {
      // Keep backend defaults if local storage is malformed.
    }
  }, [])

  const fetchArticles = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const response = await api.admin.articles.getAll(token, 1, 100);
      if (response.error) {
        throw new Error(response.error)
      }
      
      // Handle different API response structures
      let articlesData = [];
      if (response.data) {
        if (Array.isArray(response.data)) {
          articlesData = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          articlesData = response.data.data;
        } else if (response.data.articles && Array.isArray(response.data.articles)) {
          articlesData = response.data.articles;
        }
      }
      
      setArticles(articlesData);
    } catch (error) {
      console.error("Failed to fetch articles:", error);
      // Set empty array on error to prevent infinite loading
      setArticles([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [token]);

  const handleCreateArticle = async (publish: boolean) => {
    if (!token) return;
    if (!newArticle.title || !newArticle.content) {
      alert("Le titre et le contenu sont requis.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      let coverImageId: string | null = null;
      if (coverFile) {
        const uploadRes = await api.upload.uploadFile(coverFile);
        if (uploadRes.data && uploadRes.data.id) {
          coverImageId = uploadRes.data.id;
        } else {
          alert("Erreur lors de l'upload de l'image.");
          return;
        }
      }

      const createResponse = await api.admin.articles.create({
        title: newArticle.title,
        excerpt: newArticle.excerpt,
        content: newArticle.content,
        category: newArticle.category,
        coverImageId
      }, token);

      if (createResponse.error) {
        throw new Error(createResponse.error);
      }

      const createdArticleId = createResponse.data?.id;

      // If user wants to publish immediately, we update the status right after creation
      if (publish && createdArticleId) {
         await api.admin.articles.update(createdArticleId, { status: "PUBLIE" }, token);
      }

      alert("Article créé avec succès !");
      setShowEditor(false);
      
      // Reset form
      setNewArticle({
        title: "",
        excerpt: "",
        content: "",
        category: (activeCategories[0] || ARTICLE_CATEGORIES[0]) as ArticleCategory,
        status: "BROUILLON"
      });
      setCoverFile(null);
      
      fetchArticles();
    } catch (error) {
      console.error("Create article error:", error);
      alert("Erreur lors de la création de l'article.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = articles.filter((a) => {
    const isCategoryActive = activeCategories.length > 0 && activeCategories.includes(a.category)
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase())
    const matchCategory = categoryFilter === "Tous" || a.category === categoryFilter
    const matchStatus = statusFilter === "Tous" || a.status === statusFilter
    return isCategoryActive && matchSearch && matchCategory && matchStatus
  })

  if (showEditor) {
    return (
      <div className="p-6 lg:p-8 max-w-[1000px]">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-serif text-2xl font-bold text-foreground">
            Nouvel article
          </h1>
          <div className="flex gap-2">
            <button
              onClick={() => setShowEditor(false)}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-foreground border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            <button 
              onClick={() => handleCreateArticle(false)}
              disabled={isSubmitting || activeCategories.length === 0}
              className="px-4 py-2 text-sm font-medium bg-card border border-border text-foreground rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
            >
              Sauvegarder brouillon
            </button>
            <button 
              onClick={() => handleCreateArticle(true)}
              disabled={isSubmitting || activeCategories.length === 0}
              className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-[#0A1F35] transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting && <Loader2 size={14} className="animate-spin" />}
              Publier
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Image upload */}
          <div className="border-2 border-dashed border-input rounded-xl p-6 text-center hover:border-primary/30 transition-colors bg-card relative">
            <input 
              type="file" 
              accept="image/*"
              onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            {coverFile ? (
               <p className="text-sm font-medium text-primary">Fichier sélectionné : {coverFile.name}</p>
            ) : (
                <>
                  <ImageIcon size={32} className="mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-sm text-muted-foreground">Image de couverture</p>
                  <p className="text-xs text-muted-foreground/50 mt-1">Cliquez pour parcourir (1200x630 recommandé)</p>
                </>
            )}
          </div>

          {/* Title and Excerpt */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">Titre *</label>
              <input
                type="text"
                value={newArticle.title}
                onChange={e => setNewArticle({...newArticle, title: e.target.value})}
                placeholder="Titre de l'article..."
                className="w-full px-4 py-3 bg-card border border-input rounded-xl text-foreground text-lg font-serif font-semibold placeholder:text-muted-foreground/40 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">Extrait (Optionnel)</label>
              <textarea
                value={newArticle.excerpt}
                onChange={e => setNewArticle({...newArticle, excerpt: e.target.value})}
                placeholder="Résumé court visible sur les listes..."
                rows={2}
                className="w-full px-4 py-3 bg-card border border-input rounded-xl text-foreground text-sm placeholder:text-muted-foreground/40 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
              />
            </div>
          </div>

          {/* Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">
                <Tag size={10} className="inline mr-1" />
                Catégorie *
              </label>
              <select 
                value={newArticle.category}
                onChange={e => setNewArticle({...newArticle, category: e.target.value as ArticleCategory})}
                className="w-full px-4 py-3 bg-card border border-input rounded-xl text-sm text-foreground focus:border-primary outline-none"
                disabled={activeCategories.length === 0}
              >
                {activeCategories.map(c => (
                  <option key={c} value={c}>{getCategoryLabel(c)}</option>
                ))}
              </select>
              {activeCategories.length === 0 ? (
                <p className="text-xs text-amber-700 mt-2">
                  Aucune categorie active. Activez une categorie depuis Parametres.
                </p>
              ) : null}
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">
              Contenu (Markdown ou HTML supporté) *
            </label>
            <textarea
              value={newArticle.content}
              onChange={e => setNewArticle({...newArticle, content: e.target.value})}
              placeholder="Écrivez votre article ici..."
              rows={16}
              className="w-full px-4 py-3 bg-card border border-input rounded-xl text-foreground text-base leading-relaxed placeholder:text-muted-foreground/40 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 max-w-[1200px]">
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground">
            Magazine
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gérez vos articles et contenus éditoriaux
          </p>
        </div>
        <button
          onClick={() => setShowEditor(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-[#0A1F35] transition-colors"
        >
          <Plus size={14} />
          Nouvel article
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
            <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-card border border-border rounded-xl p-5">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">Articles publiés</span>
              <p className="text-2xl font-bold text-foreground mt-1">
                {articles.filter(a => a.status === "PUBLIE").length}
              </p>
            </div>
            <div className="bg-card border border-border rounded-xl p-5">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">Brouillons</span>
              <p className="text-2xl font-bold text-foreground mt-1">
                {articles.filter(a => a.status === "BROUILLON").length}
              </p>
            </div>
            <div className="bg-card border border-border rounded-xl p-5">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">Vues totales</span>
              <p className="text-2xl font-bold text-foreground mt-1">
                {articles.reduce((sum, a) => sum + (a.views || 0), 0).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un article..."
                className="w-full pl-10 pr-4 py-2.5 bg-card border border-input rounded-lg text-sm placeholder:text-muted-foreground/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2.5 bg-card border border-input rounded-lg text-sm text-foreground focus:border-primary outline-none appearance-none cursor-pointer"
            >
              {["Tous", ...activeCategories].map(c => <option key={c} value={c}>{c === "Tous" ? "Toutes categories" : getCategoryLabel(c)}</option>)}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2.5 bg-card border border-input rounded-lg text-sm text-foreground focus:border-primary outline-none appearance-none cursor-pointer"
            >
              {articleStatuses.map(s => <option key={s} value={s}>{s === "Tous" ? "Tous statuts" : s}</option>)}
            </select>
          </div>

          {/* Articles list */}
          <div className="space-y-3">
            {filtered.length === 0 ? (
               <div className="p-12 text-center text-muted-foreground bg-card border border-border rounded-xl">
                 Aucun article trouvé.
               </div>
            ) : filtered.map((article) => (
              <div
                key={article.id}
                className="bg-card border border-border rounded-xl p-4 flex items-center gap-4 hover:shadow-sm transition-all duration-200"
              >
                {/* Thumbnail */}
                <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 hidden sm:block bg-muted">
                  {getFilePublicUrl(article.coverImage) ? (
                    <img 
                      src={getFilePublicUrl(article.coverImage) || ""} 
                      alt={article.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon size={20} className="text-muted-foreground/50" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-foreground truncate">{article.title}</h3>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Tag size={10} />
                      {getCategoryLabel(article.category)}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar size={10} />
                      {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString("fr-FR") : new Date(article.createdAt).toLocaleDateString("fr-FR")}
                    </span>
                    {(article.views ?? 0) > 0 && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Eye size={10} />
                        {(article.views ?? 0).toLocaleString()} vues
                      </span>
                    )}
                  </div>
                </div>

                {/* Status */}
                <span
                  className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium shrink-0 ${
                    articleStatusColors[article.status] || "bg-muted text-muted-foreground"
                  }`}
                >
                  {article.status}
                </span>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                  {article.status === "PUBLIE" && (
                     <button 
                       onClick={() => window.open(`/magazine/${article.slug || article.id}`, '_blank')}
                       className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" 
                       aria-label="Voir"
                     >
                       <Globe size={14} />
                     </button>
                  )}
                  <button 
                    onClick={() => router.push(`/admin/magazine/${article.id}/edit`)} 
                    className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" 
                    aria-label="Modifier"
                  >
                    <Edit3 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
