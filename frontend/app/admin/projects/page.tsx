"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Search,
  Filter,
  ChevronDown,
  MapPin,
  Calendar,
  ArrowLeft,
  Loader2,
  FileText,
  Plus,
  Trash2,
  Save,
} from "lucide-react"
import {
  api,
  getFilePublicUrl,
  type AdminUserDto,
  type LeadDto,
  type ProjectDto,
  type ProjectNoteDto,
} from "@/lib/api"
import { useAuth } from "@/components/admin/auth-context"
import { toast } from "@/hooks/use-toast"

const statusOptions = ["Tous", "EN_PREPARATION", "EN_COURS", "EN_PAUSE", "TERMINE", "ANNULE"] as const

const statusLabel: Record<string, string> = {
  EN_PREPARATION: "En preparation",
  EN_COURS: "En cours",
  EN_PAUSE: "En pause",
  TERMINE: "Termine",
  ANNULE: "Annule",
}

const statusColors: Record<string, string> = {
  EN_PREPARATION: "bg-slate-100 text-slate-700",
  EN_COURS: "bg-blue-50 text-blue-700",
  EN_PAUSE: "bg-amber-50 text-amber-700",
  TERMINE: "bg-green-50 text-green-700",
  ANNULE: "bg-red-50 text-red-700",
}

const propertyLabel: Record<string, string> = {
  APPARTEMENT: "Appartement",
  VILLA: "Villa",
  BUREAU: "Bureau",
  LOCAL_COMMERCIAL: "Local commercial",
}

const stepLabel: Record<string, string> = {
  VISITE_TECHNIQUE: "Visite technique",
  DEVIS_DETAILLE: "Devis detaille",
  PLANIFICATION: "Planification",
  EXECUTION_SUPERVISEE: "Execution supervisee",
  FINITIONS_VERIFICATION: "Finitions et verification",
  LIVRAISON_GARANTIE: "Livraison et garantie",
}

const formatDate = (value?: string | null) => {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date)
}

const formatDateTime = (value?: string | null) => {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

const getProjectProgress = (project: ProjectDto): number => {
  if (!project.steps || project.steps.length === 0) return 0
  const currentIndex = project.steps.findIndex((step) => step.step === project.currentStep)
  if (currentIndex < 0) return 0
  return Math.min(100, Math.round(((currentIndex + 1) / project.steps.length) * 100))
}

const splitProjectName = (name: string): { clientName: string; projectName: string } => {
  const parts = name.split(" - ")
  if (parts.length < 2) {
    return { clientName: name, projectName: name }
  }
  const clientName = parts[0].trim()
  const projectName = parts.slice(1).join(" - ").trim()
  return { clientName, projectName }
}

export default function AdminProjects() {
  const { token } = useAuth()

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<(typeof statusOptions)[number]>("Tous")

  const [projects, setProjects] = useState<ProjectDto[]>([])
  const [leads, setLeads] = useState<LeadDto[]>([])
  const [supervisors, setSupervisors] = useState<AdminUserDto[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [selectedProject, setSelectedProject] = useState<ProjectDto | null>(null)
  const [projectNotes, setProjectNotes] = useState<ProjectNoteDto[]>([])

  const [showCreatePanel, setShowCreatePanel] = useState(false)
  const [leadIdToConvert, setLeadIdToConvert] = useState("")
  const [newProjectNote, setNewProjectNote] = useState("")
  const [supervisorId, setSupervisorId] = useState("")

  const [isSubmitting, setIsSubmitting] = useState(false)

  const extractUsers = (payload: unknown): AdminUserDto[] => {
    if (Array.isArray(payload)) return payload as AdminUserDto[]
    if (Array.isArray((payload as any)?.data)) return (payload as any).data as AdminUserDto[]
    if (Array.isArray((payload as any)?.items)) return (payload as any).items as AdminUserDto[]
    return []
  }

  const fetchProjects = async () => {
    if (!token) return
    const res = await api.admin.projects.getAll(token, 1, 200)
    if (res.error) throw new Error(res.error)

    if (Array.isArray(res.data)) {
      setProjects(res.data)
      return
    }

    if (Array.isArray((res.data as any)?.data)) {
      setProjects((res.data as any).data)
      return
    }

    setProjects([])
  }

  const fetchLeads = async () => {
    if (!token) return
    const res = await api.admin.leads.getAll(token, 1, 200)
    if (Array.isArray(res.data)) {
      setLeads(res.data)
      return
    }
    if (Array.isArray((res.data as any)?.data)) {
      setLeads((res.data as any).data)
      return
    }
    setLeads([])
  }

  const fetchSupervisors = async () => {
    if (!token) return

    const res = await api.admin.users.getAll(token, 1, 50)
    if (res.error) throw new Error(res.error)
    const users = extractUsers(res.data)
    const normalizedSupervisors = users.filter(
      (user) => (user.role || "").trim().toUpperCase() === "SUPERVISOR",
    )

    // Fallback: some API payloads may omit role in list responses.
    if (normalizedSupervisors.length > 0) {
      setSupervisors(normalizedSupervisors)
      return
    }

    const rolelessUsers = users.filter((user) => !user.role)
    setSupervisors(rolelessUsers)
  }

  const fetchProjectNotes = async (projectId: string) => {
    if (!token) return
    const res = await api.admin.projects.getNotes(projectId, token)
    if (Array.isArray(res.data)) {
      setProjectNotes(res.data)
      return
    }
    setProjectNotes([])
  }

  const loadData = async () => {
    if (!token) return
    setIsLoading(true)
    try {
      await Promise.all([fetchProjects(), fetchLeads(), fetchSupervisors()])
    } catch (error) {
      console.error("Failed to load projects module:", error)
      setProjects([])
      setLeads([])
      setSupervisors([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [token])

  useEffect(() => {
    if (!selectedProject) {
      setProjectNotes([])
      setNewProjectNote("")
      setSupervisorId("")
      return
    }

    setSupervisorId(selectedProject.supervisor?.id || "")
    fetchProjectNotes(selectedProject.id)
  }, [selectedProject?.id, token])

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const q = search.toLowerCase()
      const matchesSearch =
        project.name.toLowerCase().includes(q) ||
        project.address.toLowerCase().includes(q)
      const matchesStatus = statusFilter === "Tous" || project.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [projects, search, statusFilter])

  const selectedLeadForCreate = leads.find((lead) => lead.id === leadIdToConvert)

  const handleCreateFromLead = async () => {
    if (!token || !leadIdToConvert) {
      toast({
        title: "Lead requis",
        description: "Selectionnez un lead pour creer un projet.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const res = await api.admin.projects.createFromLead(leadIdToConvert, token)
      if (res.error) throw new Error(res.error)
      await loadData()
      setShowCreatePanel(false)
      setLeadIdToConvert("")
      if (res.data) setSelectedProject(res.data)
      toast({ title: "Projet cree", description: "Le projet a ete ajoute avec succes." })
    } catch (error) {
      console.error("Create from lead failed:", error)
      toast({
        title: "Erreur de creation",
        description: "Impossible de creer le projet depuis ce lead.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateStatus = async (status: string) => {
    if (!token || !selectedProject) return
    try {
      const res = await api.admin.projects.updateStatus(selectedProject.id, { status }, token)
      if (res.error) throw new Error(res.error)
      if (res.data) {
        setSelectedProject(res.data)
        setProjects((prev) => prev.map((p) => (p.id === res.data!.id ? res.data! : p)))
      }
    } catch (error) {
      console.error("Update status failed:", error)
      toast({
        title: "Mise a jour impossible",
        description: "Erreur lors de la mise a jour du statut.",
        variant: "destructive",
      })
    }
  }

  const handleUpdateStep = async (step: string) => {
    if (!token || !selectedProject) return
    try {
      const res = await api.admin.projects.updateStep(selectedProject.id, { currentStep: step }, token)
      if (res.error) throw new Error(res.error)
      if (res.data) {
        setSelectedProject(res.data)
        setProjects((prev) => prev.map((p) => (p.id === res.data!.id ? res.data! : p)))
      }
    } catch (error) {
      console.error("Update step failed:", error)
      toast({
        title: "Mise a jour impossible",
        description: "Erreur lors de la mise a jour de l'etape.",
        variant: "destructive",
      })
    }
  }

  const handleAddNote = async () => {
    if (!token || !selectedProject || !newProjectNote.trim()) return

    setIsSubmitting(true)
    try {
      const res = await api.admin.projects.addNote(selectedProject.id, newProjectNote.trim(), token)
      if (res.error) throw new Error(res.error)
      setNewProjectNote("")
      await fetchProjectNotes(selectedProject.id)
      if (res.data) {
        setSelectedProject(res.data)
        setProjects((prev) => prev.map((p) => (p.id === res.data!.id ? res.data! : p)))
      }
    } catch (error) {
      console.error("Add note failed:", error)
      toast({
        title: "Ajout impossible",
        description: "Erreur lors de l'ajout de la note.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAssignSupervisor = async () => {
    if (!token || !selectedProject || !supervisorId.trim()) {
      toast({
        title: "Superviseur requis",
        description: "Selectionnez un superviseur avant validation.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const res = await api.admin.projects.assignSupervisor(selectedProject.id, supervisorId.trim(), token)
      if (res.error) throw new Error(res.error)
      if (res.data) {
        setSelectedProject(res.data)
        setProjects((prev) => prev.map((p) => (p.id === res.data!.id ? res.data! : p)))
      }
      toast({ title: "Superviseur assigne", description: "Le projet a ete mis a jour." })
    } catch (error) {
      console.error("Assign supervisor failed:", error)
      toast({
        title: "Assignation impossible",
        description: "Erreur lors de l'assignation du superviseur.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteProject = async () => {
    if (!token || !selectedProject) return
    const confirmed = window.confirm("Supprimer ce projet ? Cette action est irreversible.")
    if (!confirmed) return

    setIsSubmitting(true)
    try {
      const res = await api.admin.projects.delete(selectedProject.id, token)
      if (res.error) throw new Error(res.error)
      setProjects((prev) => prev.filter((p) => p.id !== selectedProject.id))
      setSelectedProject(null)
      setProjectNotes([])
      toast({ title: "Projet supprime", description: "Le chantier a ete retire." })
    } catch (error) {
      console.error("Delete project failed:", error)
      toast({
        title: "Suppression impossible",
        description: "Erreur lors de la suppression.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (selectedProject) {
    return (
      <div className="p-6 lg:p-8 max-w-[1200px]">
        <button
          onClick={() => setSelectedProject(null)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          Retour aux projets
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-6">
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <h2 className="font-serif text-xl font-semibold text-foreground">{selectedProject.name}</h2>
                  <p className="text-sm text-muted-foreground mt-1">{propertyLabel[selectedProject.propertyType] || selectedProject.propertyType}</p>
                </div>
                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${statusColors[selectedProject.status] || "bg-muted text-muted-foreground"}`}>
                  {statusLabel[selectedProject.status] || selectedProject.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                <InfoRow icon={MapPin} label="Adresse" value={selectedProject.address} />
                <InfoRow icon={Calendar} label="Debut" value={formatDate(selectedProject.startDate)} />
                <InfoRow icon={Calendar} label="Fin" value={formatDate(selectedProject.endDate)} />
                <InfoRow icon={FileText} label="Etape courante" value={stepLabel[selectedProject.currentStep] || selectedProject.currentStep} />
                <InfoRow icon={FileText} label="Avancement" value={`${getProjectProgress(selectedProject)}%`} />
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-sm font-semibold text-foreground mb-3">Planning chantier</h3>
              <div className="space-y-2">
                {(selectedProject.steps || []).map((step) => (
                  <div key={step.step} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                    <span className="text-sm text-foreground">{stepLabel[step.step] || step.label}</span>
                    <span className={`text-xs font-medium ${step.isCurrent ? "text-primary" : "text-muted-foreground"}`}>
                      {step.isCurrent ? "Etape active" : "A venir"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-sm font-semibold text-foreground mb-3">Fichiers projet</h3>
              {selectedProject.files?.length ? (
                <div className="space-y-2">
                  {selectedProject.files.map((file) => {
                    const url = getFilePublicUrl(file)
                    return (
                      <a
                        key={file.id}
                        href={url || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between rounded-lg border border-border px-3 py-2 hover:bg-muted/40"
                      >
                        <span className="text-sm text-foreground truncate">{file.filename}</span>
                        <span className="text-xs text-muted-foreground">{file.mimetype}</span>
                      </a>
                    )
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Aucun fichier associe.</p>
              )}
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-sm font-semibold text-foreground mb-3">Notes chantier</h3>
              <div className="space-y-2 mb-4 max-h-[220px] overflow-auto">
                {projectNotes.length ? (
                  projectNotes.map((note) => (
                    <div key={note.id} className="rounded-lg border border-border p-3 bg-muted/20">
                      <p className="text-sm text-foreground whitespace-pre-wrap">{note.note}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDateTime(note.createdAt)}
                        {note.user ? ` - ${note.user.firstName || ""} ${note.user.lastName || ""}` : ""}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Aucune note pour ce projet.</p>
                )}
              </div>

              <div className="space-y-2">
                <textarea
                  value={newProjectNote}
                  onChange={(e) => setNewProjectNote(e.target.value)}
                  placeholder="Ajouter une note interne..."
                  rows={3}
                  className="w-full px-3 py-2.5 bg-background border border-input rounded-lg text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary outline-none resize-none"
                />
                <button
                  onClick={handleAddNote}
                  disabled={isSubmitting || !newProjectNote.trim()}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm rounded-lg hover:bg-[#0A1F35] disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  Ajouter la note
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Actions projet</h3>

              <div>
                <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">Statut</label>
                <select
                  value={selectedProject.status}
                  onChange={(e) => handleUpdateStatus(e.target.value)}
                  className="w-full px-3 py-2.5 bg-background border border-input rounded-lg text-sm text-foreground focus:border-primary outline-none"
                >
                  {statusOptions.filter((s) => s !== "Tous").map((s) => (
                    <option key={s} value={s}>{statusLabel[s] || s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">Etape</label>
                <select
                  value={selectedProject.currentStep}
                  onChange={(e) => handleUpdateStep(e.target.value)}
                  className="w-full px-3 py-2.5 bg-background border border-input rounded-lg text-sm text-foreground focus:border-primary outline-none"
                >
                  {(selectedProject.steps || []).map((step) => (
                    <option key={step.step} value={step.step}>{stepLabel[step.step] || step.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">Superviseur</label>
                <div className="flex gap-2">
                  <select
                    value={supervisorId}
                    onChange={(e) => setSupervisorId(e.target.value)}
                    className="flex-1 px-3 py-2.5 bg-background border border-input rounded-lg text-sm text-foreground focus:border-primary outline-none"
                  >
                    <option value="">Selectionner un superviseur</option>
                    {supervisors.map((user) => {
                      const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim()
                      const label = fullName || user.email || user.id
                      return (
                        <option key={user.id} value={user.id}>
                          {label}
                        </option>
                      )
                    })}
                  </select>
                  <button
                    onClick={handleAssignSupervisor}
                    disabled={isSubmitting || !supervisorId.trim()}
                    className="px-3 py-2.5 bg-card border border-border text-sm rounded-lg hover:bg-muted disabled:opacity-50"
                  >
                    Assigner
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Actuel: {selectedProject.supervisor ? `${selectedProject.supervisor.firstName || ""} ${selectedProject.supervisor.lastName || ""}`.trim() || selectedProject.supervisor.id : "Aucun"}</p>
                {supervisors.length === 0 ? (
                  <p className="text-xs text-amber-700 mt-1">
                    Aucun superviseur disponible. Creez un compte superviseur depuis Parametres.
                  </p>
                ) : null}
              </div>
            </div>

            <button
              onClick={handleDeleteProject}
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
              Supprimer ce projet
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 max-w-[1200px]">
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground">Projets actifs</h1>
          <p className="text-sm text-muted-foreground mt-1">Suivez, mettez a jour et pilotez vos chantiers</p>
        </div>
        <button
          onClick={() => setShowCreatePanel((v) => !v)}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-[#0A1F35] transition-colors"
        >
          <Plus size={14} />
          Nouveau projet
        </button>
      </div>

      {showCreatePanel ? (
        <div className="bg-card border border-border rounded-xl p-5 mb-5">
          <h2 className="font-serif text-lg font-semibold text-foreground mb-4">Creer un projet depuis un lead converti</h2>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-3 items-end">
            <div>
              <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">Lead source</label>
              <select
                value={leadIdToConvert}
                onChange={(e) => setLeadIdToConvert(e.target.value)}
                className="w-full px-3 py-2.5 bg-background border border-input rounded-lg text-sm text-foreground focus:border-primary outline-none"
              >
                <option value="">Selectionner un lead</option>
                {leads.map((lead) => (
                  <option key={lead.id} value={lead.id}>{lead.fullName} - {propertyLabel[lead.propertyType] || lead.propertyType}</option>
                ))}
              </select>
              {selectedLeadForCreate ? (
                <p className="mt-2 text-xs text-muted-foreground">Adresse: {selectedLeadForCreate.projectAddress}</p>
              ) : null}
            </div>

            <button
              onClick={handleCreateFromLead}
              disabled={isSubmitting || !leadIdToConvert}
              className="h-[42px] px-4 bg-primary text-primary-foreground text-sm rounded-lg hover:bg-[#0A1F35] disabled:opacity-50 inline-flex items-center gap-2"
            >
              {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              Creer
            </button>
          </div>
        </div>
      ) : null}

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un projet..."
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-input rounded-lg text-sm placeholder:text-muted-foreground/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
          />
        </div>
        <div className="relative">
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as (typeof statusOptions)[number])}
            className="pl-9 pr-8 py-2.5 bg-card border border-input rounded-lg text-sm text-foreground focus:border-primary outline-none appearance-none cursor-pointer"
          >
            {statusOptions.map((s) => (
              <option key={s} value={s}>{statusLabel[s] || s}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-primary mb-4" size={32} />
            <p className="text-muted-foreground">Chargement des projets...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">Aucun projet trouve.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground font-medium">Nom client</th>
                  <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground font-medium">Projet</th>
                  <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground font-medium">Avancement</th>
                  <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground font-medium">Etape</th>
                  <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground font-medium">Superviseur</th>
                  <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground font-medium">Statut</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((project) => {
                  const names = splitProjectName(project.name)
                  const progress = getProjectProgress(project)
                  const supervisorName = project.supervisor
                    ? `${project.supervisor.firstName || ""} ${project.supervisor.lastName || ""}`.trim() || project.supervisor.id
                    : "Non assigne"

                  return (
                  <tr
                    key={project.id}
                    onClick={async () => {
                      if (!token) return
                      const res = await api.admin.projects.getById(project.id, token)
                      setSelectedProject(res.data || project)
                    }}
                    className="border-b border-border last:border-b-0 hover:bg-muted/30 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-3 font-medium text-foreground">{names.clientName}</td>
                    <td className="px-6 py-3 text-muted-foreground">{names.projectName}</td>
                    <td className="px-6 py-3">
                      <div className="w-32">
                        <div className="h-2 w-full rounded-full bg-muted">
                          <div className="h-2 rounded-full bg-primary" style={{ width: `${progress}%` }} />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{progress}%</p>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-muted-foreground">{stepLabel[project.currentStep] || project.currentStep}</td>
                    <td className="px-6 py-3 text-muted-foreground">{supervisorName}</td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[project.status] || "bg-muted text-muted-foreground"}`}>
                        {statusLabel[project.status] || project.status}
                      </span>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="rounded-lg border border-border p-3 bg-muted/20">
      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1 inline-flex items-center gap-1">
        <Icon size={12} />
        {label}
      </p>
      <p className="text-sm text-foreground break-words">{value || "-"}</p>
    </div>
  )
}
