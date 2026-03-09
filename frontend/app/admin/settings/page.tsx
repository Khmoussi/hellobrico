"use client"

import { useEffect, useMemo, useState } from "react"
import { Loader2, Plus, Save, Users } from "lucide-react"
import {
  api,
  ARTICLE_CATEGORIES,
  ARTICLE_CATEGORY_LABELS,
  type AdminUserDto,
  type ArticleCategory,
} from "@/lib/api"
import { useAuth } from "@/components/admin/auth-context"
import { toast } from "@/hooks/use-toast"

type AppSettings = {
  quoteSenderEmail: string
  supportPhone: string
  magazineCategories: string[]
}

type RoleToCreate = "COMMERCIAL" | "SUPERVISOR"

const SETTINGS_STORAGE_KEY = "hb_admin_settings_v1"

const defaultSettings: AppSettings = {
  quoteSenderEmail: "devis@hellobrico.tn",
  supportPhone: "+216 XX XXX XXX",
  magazineCategories: [...ARTICLE_CATEGORIES],
}

const roleLabel: Record<string, string> = {
  ADMIN: "Admin principal",
  COMMERCIAL: "Commercial",
  SUPERVISOR: "Superviseur",
}

export default function AdminSettings() {
  const { token } = useAuth()

  const [settings, setSettings] = useState<AppSettings>(defaultSettings)

  const [users, setUsers] = useState<AdminUserDto[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [newUserRole, setNewUserRole] = useState<RoleToCreate>("COMMERCIAL")
  const [newUserFirstName, setNewUserFirstName] = useState("")
  const [newUserLastName, setNewUserLastName] = useState("")
  const [newUserPhone, setNewUserPhone] = useState("")
  const [newUserEmail, setNewUserEmail] = useState("")
  const [newUserPassword, setNewUserPassword] = useState("")

  useEffect(() => {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY)
    if (!stored) return

    try {
      const parsed = JSON.parse(stored) as Partial<AppSettings>
      const persistedSource = Array.isArray(parsed.magazineCategories)
        ? parsed.magazineCategories
        : undefined
      const hasPersistedCategories = Boolean(persistedSource)
      const persistedCategories = persistedSource
        ? persistedSource.filter((cat) => ARTICLE_CATEGORIES.includes(cat as ArticleCategory))
        : []

      setSettings((prev) => ({
        quoteSenderEmail: parsed.quoteSenderEmail || prev.quoteSenderEmail,
        supportPhone: parsed.supportPhone || prev.supportPhone,
        magazineCategories: hasPersistedCategories ? persistedCategories : prev.magazineCategories,
      }))
    } catch {
      // Keep defaults if local storage is malformed.
    }
  }, [])

  const loadUsers = async () => {
    if (!token) return
    setIsLoadingUsers(true)

    try {
      const res = await api.admin.users.getAll(token, 1, 200)
      if (res.error) throw new Error(res.error)
      const mapped = Array.isArray(res.data)
        ? res.data
        : Array.isArray((res.data as any)?.data)
          ? (res.data as any).data
          : []
      setUsers(mapped as AdminUserDto[])
    } catch (error) {
      console.error("Failed to load users:", error)
      setUsers([])
      toast({
        title: "Chargement impossible",
        description: "Impossible de recuperer les comptes admin.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingUsers(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [token])

  const sortedCategories = useMemo(() => {
    return [...settings.magazineCategories].sort((a, b) => a.localeCompare(b, "fr"))
  }, [settings.magazineCategories])

  const saveSettings = () => {
    if (!settings.quoteSenderEmail.includes("@")) {
      toast({
        title: "Email invalide",
        description: "Saisissez une adresse email valide pour les devis.",
        variant: "destructive",
      })
      return
    }

    if (!settings.supportPhone.trim()) {
      toast({
        title: "Telephone requis",
        description: "Renseignez un numero de telephone.",
        variant: "destructive",
      })
      return
    }

    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings))
    toast({
      title: "Parametres enregistres",
      description: "Configuration devis et magazine mise a jour.",
    })
  }

  const toggleCategory = (category: ArticleCategory) => {
    setSettings((prev) => {
      const exists = prev.magazineCategories.includes(category)
      const nextSettings: AppSettings = exists
        ? {
            ...prev,
            magazineCategories: prev.magazineCategories.filter((cat) => cat !== category),
          }
        : {
            ...prev,
            magazineCategories: [...prev.magazineCategories, category],
          }

      // Persist immediately to keep category selection after refresh.
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(nextSettings))

      if (exists) {
        return nextSettings
      }
      return nextSettings
    })
  }

  const resetNewUserForm = () => {
    setNewUserFirstName("")
    setNewUserLastName("")
    setNewUserPhone("")
    setNewUserEmail("")
    setNewUserPassword("")
  }

  const createUser = async () => {
    if (!token) return

    if (!newUserFirstName.trim() || !newUserLastName.trim() || !newUserEmail.trim() || !newUserPassword.trim() || !newUserPhone.trim()) {
      toast({
        title: "Champs requis",
        description: "Renseignez prenom, nom, telephone, email et mot de passe.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        firstName: newUserFirstName.trim(),
        lastName: newUserLastName.trim(),
        email: newUserEmail.trim(),
        password: newUserPassword,
        phone: newUserPhone.trim(),
      }

      const res =
        newUserRole === "COMMERCIAL"
          ? await api.admin.users.createCommercial(payload, token)
          : await api.admin.users.createSupervisor(payload, token)

      if (res.error) throw new Error(res.error)

      toast({
        title: "Compte cree",
        description: `${roleLabel[newUserRole]} ajoute avec succes.`,
      })
      resetNewUserForm()
      await loadUsers()
    } catch (error) {
      console.error("Create admin user failed:", error)
      toast({
        title: "Creation impossible",
        description: "Erreur lors de la creation du compte.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-6 lg:p-8 max-w-[1200px] space-y-6">
      <div>
        <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground">Parametres</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configurez les canaux devis, les categories magazine et les comptes admin.
        </p>
      </div>

      <section className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-sm font-semibold text-foreground mb-4">Configuration devis et contact</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Adresse email pour envoi devis"
            value={settings.quoteSenderEmail}
            onChange={(value) => setSettings((prev) => ({ ...prev, quoteSenderEmail: value }))}
            placeholder="devis@hellobrico.tn"
          />
          <InputField
            label="Numero telephone"
            value={settings.supportPhone}
            onChange={(value) => setSettings((prev) => ({ ...prev, supportPhone: value }))}
            placeholder="+216 XX XXX XXX"
          />
        </div>

        <div className="mt-4">
          <button
            onClick={saveSettings}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground text-sm rounded-lg hover:bg-[#0A1F35] transition-colors"
          >
            <Save size={14} />
            Enregistrer
          </button>
        </div>
      </section>

      <section className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-sm font-semibold text-foreground mb-4">Categories magazine</h2>
        <p className="text-xs text-muted-foreground mb-3">
          Activez uniquement les categories supportees par le backend magazine.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {ARTICLE_CATEGORIES.map((category) => {
            const checked = sortedCategories.includes(category)
            return (
              <button
                key={category}
                onClick={() => toggleCategory(category)}
                className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm transition-colors ${
                  checked
                    ? "border-primary bg-primary/5 text-foreground"
                    : "border-border bg-background text-muted-foreground hover:bg-muted/30"
                }`}
              >
                <span>{ARTICLE_CATEGORY_LABELS[category]}</span>
                <span className="text-xs">{checked ? "Actif" : "Inactif"}</span>
              </button>
            )
          })}
        </div>
      </section>

      <section className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users size={16} className="text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Gestion des comptes admin</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">Role</label>
            <select
              value={newUserRole}
              onChange={(e) => setNewUserRole(e.target.value as RoleToCreate)}
              className="w-full px-3 py-2.5 bg-background border border-input rounded-lg text-sm text-foreground focus:border-primary outline-none"
            >
              <option value="COMMERCIAL">Commercial</option>
              <option value="SUPERVISOR">Superviseur</option>
            </select>
          </div>
          <InputField label="Telephone" value={newUserPhone} onChange={setNewUserPhone} placeholder="+21612345678" />
          <InputField label="Email" value={newUserEmail} onChange={setNewUserEmail} placeholder="nom@hellobrico.tn" />
          <InputField label="Prenom" value={newUserFirstName} onChange={setNewUserFirstName} placeholder="Prenom" />
          <InputField label="Nom" value={newUserLastName} onChange={setNewUserLastName} placeholder="Nom" />
        </div>

        <div className="mb-5">
          <InputField
            label="Mot de passe initial"
            value={newUserPassword}
            onChange={setNewUserPassword}
            placeholder="Minimum 8 caracteres"
            type="password"
          />
        </div>

        <button
          onClick={createUser}
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground text-sm rounded-lg hover:bg-[#0A1F35] disabled:opacity-60"
        >
          {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
          Creer le compte
        </button>

        <div className="mt-6 border-t border-border pt-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Comptes existants</p>
          {isLoadingUsers ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 size={14} className="animate-spin" />
              Chargement des comptes...
            </div>
          ) : users.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun compte trouve.</p>
          ) : (
            <div className="space-y-2">
              {users.map((user) => {
                const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Sans nom"
                return (
                  <div key={user.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 rounded-lg border border-border px-3 py-2">
                    <div>
                      <p className="text-sm font-medium text-foreground">{fullName}</p>
                      <p className="text-xs text-muted-foreground">{user.email || "-"}</p>
                    </div>
                    <span className="inline-flex w-fit rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                      {roleLabel[user.role || ""] || user.role || "-"}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
}) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 bg-background border border-input rounded-lg text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary outline-none"
      />
    </div>
  )
}
