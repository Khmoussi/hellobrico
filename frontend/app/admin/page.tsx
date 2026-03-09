"use client"

import { useEffect, useMemo, useState, type ComponentType } from "react"
import { Users, FileText, TrendingUp, FolderKanban, Flag } from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { api, type DashboardKpisDto, type LeadDto, type ProjectDto, type QuoteDto } from "@/lib/api"
import { useAuth } from "@/components/admin/auth-context"

const statusColors: Record<string, string> = {
  NOUVEAU: "bg-blue-50 text-blue-700",
  CONTACTE: "bg-amber-50 text-amber-700",
  VISITE_PLANIFIEE: "bg-indigo-50 text-indigo-700",
  DEVIS_ENVOYE: "bg-emerald-50 text-emerald-700",
  NEGOCIATION: "bg-orange-50 text-orange-700",
  CONVERTI: "bg-green-50 text-green-700",
  PERDU: "bg-red-50 text-red-700",
}

const statusLabels: Record<string, string> = {
  NOUVEAU: "Nouveau",
  CONTACTE: "Contacte",
  VISITE_PLANIFIEE: "Visite planifiee",
  DEVIS_ENVOYE: "Devis envoye",
  NEGOCIATION: "Negociation",
  CONVERTI: "Converti",
  PERDU: "Perdu",
}

const projectStatusLabels: Record<string, string> = {
  EN_PREPARATION: "En preparation",
  EN_COURS: "En cours",
  EN_PAUSE: "En pause",
  TERMINE: "Termine",
  ANNULE: "Annule",
}

const activeProjectStatuses = new Set(["EN_PREPARATION", "EN_COURS", "EN_PAUSE"])

const propertyLabels: Record<string, string> = {
  APPARTEMENT: "Appartement",
  VILLA: "Villa",
  BUREAU: "Bureau",
  LOCAL_COMMERCIAL: "Local commercial",
}

const budgetLabels: Record<string, string> = {
  MOINS_20000: "< 20 000 DT",
  BETWEEN_20000_50000: "20 000 - 50 000 DT",
  PLUS_50000: "50 000 DT+",
  A_DEFINIR: "A definir",
}

function getLeadType(lead: LeadDto): string {
  if (lead.renovationTypes && lead.renovationTypes.length > 0) {
    return lead.renovationTypes.join(", ")
  }

  return propertyLabels[lead.propertyType] || lead.propertyType || "Non specifie"
}

function getLeadBudget(lead: LeadDto): string {
  if (!lead.budgetBracket) return "A definir"
  return budgetLabels[lead.budgetBracket] || lead.budgetBracket
}

function getStartOfWeek(date: Date) {
  const d = new Date(date)
  const day = (d.getDay() + 6) % 7
  d.setDate(d.getDate() - day)
  d.setHours(0, 0, 0, 0)
  return d
}

function buildWeeklySeries(leads: LeadDto[]) {
  const nowWeekStart = getStartOfWeek(new Date())
  const weekCount = 12

  const counts = Array(12).fill(0)
  const msPerWeek = 7 * 24 * 60 * 60 * 1000

  for (const lead of leads) {
    const leadWeek = getStartOfWeek(new Date(lead.createdAt))
    const diff = Math.round((leadWeek.getTime() - nowWeekStart.getTime()) / msPerWeek)
    const index = 11 + diff
    if (index >= 0 && index < 12) counts[index] += 1
  }

  // Show the most recent week first so the chart starts from S1 on the left.
  const newestFirstCounts = [...counts].reverse()

  return Array.from({ length: weekCount }, (_, index) => ({
    week: `S${index + 1}`,
    leads: newestFirstCounts[index],
  }))
}

function getProjectProgress(project: ProjectDto): number {
  if (project.steps && project.steps.length > 0) {
    const currentIndex = project.steps.findIndex((step) => step.step === project.currentStep)
    if (currentIndex >= 0) {
      return Math.round(((currentIndex + 1) / project.steps.length) * 100)
    }
  }

  const orderedSteps = [
    "VISITE_TECHNIQUE",
    "DEVIS_DETAILLE",
    "PLANIFICATION",
    "EXECUTION_SUPERVISEE",
    "FINITIONS_VERIFICATION",
    "LIVRAISON_GARANTIE",
  ]
  const idx = orderedSteps.indexOf(project.currentStep)
  if (idx < 0) return 0
  return Math.round(((idx + 1) / orderedSteps.length) * 100)
}

function extractList<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[]
  if (Array.isArray((payload as { data?: unknown[] })?.data)) return (payload as { data: T[] }).data
  return []
}

export default function AdminDashboard() {
  const { token, user } = useAuth()

  const [kpis, setKpis] = useState<DashboardKpisDto | null>(null)
  const [allLeads, setAllLeads] = useState<LeadDto[]>([])
  const [recentLeads, setRecentLeads] = useState<LeadDto[]>([])
  const [projects, setProjects] = useState<ProjectDto[]>([])
  const [commercialQuotesSent, setCommercialQuotesSent] = useState(0)
  const [weeklyChartData, setWeeklyChartData] = useState<Array<{ week: string; leads: number }>>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadDashboard = async () => {
      if (!token || !user) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      try {
        const [kpisRes, leadsRes, recentRes, projectsRes] = await Promise.all([
          user.role === "ADMIN" ? api.admin.getKpis(token) : Promise.resolve({ data: null }),
          api.admin.leads.getAll(token, 1, 300),
          api.admin.getRecentLeads(5, token),
          api.admin.projects.getAll(token, 1, 300),
        ])

        const fetchedLeads = extractList<LeadDto>(leadsRes.data)
        const fetchedProjects = extractList<ProjectDto>(projectsRes.data)
        const fetchedRecent = extractList<LeadDto>(recentRes.data)

        setKpis((kpisRes as { data?: DashboardKpisDto | null }).data || null)
        setAllLeads(fetchedLeads)
        setProjects(fetchedProjects)
        setRecentLeads(fetchedRecent.length > 0 ? fetchedRecent.slice(0, 5) : fetchedLeads.slice(0, 5))
        setWeeklyChartData(buildWeeklySeries(fetchedLeads))

        if (user.role === "COMMERCIAL") {
          const assignedLeads = fetchedLeads.filter((lead) => lead.assignedTo?.id === user.id)
          const quoteLists = await Promise.all(
            assignedLeads.map(async (lead) => {
              const quotesRes = await api.admin.quotes.getForLead(lead.id, token)
              return extractList<QuoteDto>(quotesRes.data)
            }),
          )

          const sentByCommercial = quoteLists
            .flat()
            .filter((quote) => quote.sentBy?.id === user.id).length

          setCommercialQuotesSent(sentByCommercial)
        } else {
          setCommercialQuotesSent(0)
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
        setKpis(null)
        setAllLeads([])
        setRecentLeads([])
        setProjects([])
        setWeeklyChartData([])
        setCommercialQuotesSent(0)
      } finally {
        setIsLoading(false)
      }
    }

    void loadDashboard()
  }, [token, user])

  const assignedLeads = useMemo(
    () => (user?.role === "COMMERCIAL" ? allLeads.filter((lead) => lead.assignedTo?.id === user.id) : []),
    [allLeads, user],
  )

  const commercialPendingLeads = useMemo(
    () => assignedLeads.filter((lead) => lead.status === "NOUVEAU" || lead.status === "CONTACTE").length,
    [assignedLeads],
  )

  const supervisorProjects = useMemo(
    () => (user?.role === "SUPERVISOR" ? projects.filter((project) => project.supervisor?.id === user.id) : []),
    [projects, user],
  )

  const supervisorActiveProjects = useMemo(
    () => supervisorProjects.filter((project) => activeProjectStatuses.has(project.status)).length,
    [supervisorProjects],
  )

  const supervisorAverageProgress = useMemo(() => {
    if (supervisorProjects.length === 0) return 0
    const total = supervisorProjects.reduce((sum, project) => sum + getProjectProgress(project), 0)
    return Math.round(total / supervisorProjects.length)
  }, [supervisorProjects])

  const supervisorMilestonesThisWeek = useMemo(() => {
    const now = new Date()
    const weekStart = getStartOfWeek(now)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 7)

    return supervisorProjects.filter((project) => {
      const startDate = project.startDate ? new Date(project.startDate) : null
      const endDate = project.endDate ? new Date(project.endDate) : null

      const startInWeek = startDate && startDate >= weekStart && startDate < weekEnd
      const endInWeek = endDate && endDate >= weekStart && endDate < weekEnd

      return Boolean(startInWeek || endInWeek)
    }).length
  }, [supervisorProjects])

  const adminCards = useMemo(
    () => [
      { label: "Leads ce mois", value: kpis?.leadsThisMonth ?? 0, icon: Users },
      { label: "Devis envoyes", value: kpis?.quotesSentThisMonth ?? 0, icon: FileText },
      { label: "Taux conversion", value: `${(kpis?.conversionRate ?? 0).toFixed(1)}%`, icon: TrendingUp },
      { label: "Projets en cours", value: kpis?.activeProjects ?? 0, icon: FolderKanban },
    ],
    [kpis],
  )

  const commercialCards = useMemo(
    () => [
      { label: "Mes leads assignes", value: assignedLeads.length, icon: Users },
      { label: "Devis envoyes", value: commercialQuotesSent, icon: FileText },
      { label: "Leads en attente", value: commercialPendingLeads, icon: Flag },
    ],
    [assignedLeads.length, commercialPendingLeads, commercialQuotesSent],
  )

  const supervisorCards = useMemo(
    () => [
      { label: "Mes chantiers actifs", value: supervisorActiveProjects, icon: FolderKanban },
      { label: "Avancement moyen", value: `${supervisorAverageProgress}%`, icon: TrendingUp },
      { label: "Jalons cette semaine", value: supervisorMilestonesThisWeek, icon: Flag },
    ],
    [supervisorActiveProjects, supervisorAverageProgress, supervisorMilestonesThisWeek],
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Chargement du dashboard...</span>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 max-w-[1200px]">
      <div className="mb-8">
        <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {user?.role === "ADMIN" && "Vue globale de votre activite"}
          {user?.role === "COMMERCIAL" && "Vue commerciale: leads assignes et devis"}
          {user?.role === "SUPERVISOR" && "Vue terrain: chantiers et avancement"}
        </p>
      </div>

      {user?.role === "ADMIN" && (
        <>
          <KpiCards cards={adminCards} columnsClass="lg:grid-cols-4" />

          <div className="bg-card border border-border rounded-xl p-6 mb-8">
            <h2 className="text-sm font-semibold text-foreground mb-4">Leads par semaine</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.25)" />
                  <XAxis dataKey="week" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: "rgba(2, 38, 81, 0.05)" }}
                    contentStyle={{ borderRadius: 10, borderColor: "#e5e7eb", fontSize: 12 }}
                  />
                  <Bar dataKey="leads" fill="#002651" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <LeadsTable title="Derniers leads recus" leads={recentLeads.slice(0, 5)} />
        </>
      )}

      {user?.role === "COMMERCIAL" && (
        <>
          <KpiCards cards={commercialCards} columnsClass="lg:grid-cols-3" />
          <LeadsTable title="Mes leads assignes" leads={assignedLeads.slice(0, 5)} />
        </>
      )}

      {user?.role === "SUPERVISOR" && (
        <>
          <KpiCards cards={supervisorCards} columnsClass="lg:grid-cols-3" />

          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <h2 className="text-sm font-semibold text-foreground">Mes projets</h2>
            </div>

            <div className="divide-y divide-border">
              {supervisorProjects.length === 0 ? (
                <p className="px-6 py-8 text-sm text-muted-foreground">Aucun projet assigne pour le moment.</p>
              ) : (
                supervisorProjects.map((project) => {
                  const progress = getProjectProgress(project)
                  return (
                    <div key={project.id} className="px-6 py-4">
                      <div className="flex items-center justify-between gap-4 mb-2">
                        <div>
                          <p className="text-sm font-semibold text-foreground">{project.name}</p>
                          <p className="text-xs text-muted-foreground">{project.address}</p>
                        </div>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                          {projectStatusLabels[project.status] || project.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="h-2.5 bg-muted rounded-full flex-1 overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${progress}%` }} />
                        </div>
                        <span className="text-xs font-medium text-foreground w-10 text-right">{progress}%</span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function KpiCards({
  cards,
  columnsClass,
}: {
  cards: Array<{ label: string; value: string | number; icon: ComponentType<{ size?: number; className?: string; strokeWidth?: number }> }>
  columnsClass: string
}) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 ${columnsClass} gap-4 mb-10`}>
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <div key={card.label} className="bg-card border border-border rounded-xl p-5 hover:shadow-sm transition-shadow duration-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">{card.label}</span>
              <Icon size={16} className="text-muted-foreground/50" strokeWidth={1.5} />
            </div>
            <p className="text-2xl font-bold text-foreground">{card.value}</p>
          </div>
        )
      })}
    </div>
  )
}

function LeadsTable({ title, leads }: { title: string; leads: LeadDto[] }) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground font-medium">Nom</th>
              <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground font-medium">Type</th>
              <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground font-medium">Budget</th>
              <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground font-medium">Statut</th>
              <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground font-medium">Date</th>
            </tr>
          </thead>

          <tbody>
            {leads.length === 0 ? (
              <tr>
                <td className="px-6 py-8 text-muted-foreground" colSpan={5}>
                  Aucun lead disponible.
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr key={lead.id} className="border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-3 font-medium text-foreground">{lead.fullName}</td>
                  <td className="px-6 py-3 text-muted-foreground">{getLeadType(lead)}</td>
                  <td className="px-6 py-3 text-muted-foreground">{getLeadBudget(lead)}</td>
                  <td className="px-6 py-3">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[lead.status] || "bg-muted text-muted-foreground"}`}>
                      {statusLabels[lead.status] || lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-muted-foreground">{new Date(lead.createdAt).toLocaleDateString("fr-FR")}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
