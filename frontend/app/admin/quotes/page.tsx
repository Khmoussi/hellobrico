"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Search,
  Filter,
  ChevronDown,
  Download,
  Eye,
  ArrowLeft,
  FileText,
  Plus,
  Loader2,
  Send,
  User,
  Mail,
  Calendar,
} from "lucide-react"
import { useSearchParams } from "next/navigation"
import { useAuth } from "@/components/admin/auth-context"
import { api, resolveMediaUrl, type LeadDto, type QuoteDto } from "@/lib/api"

type QuoteLifecycle = "ENVOYE" | "NEGOCIATION" | "ACCEPTE" | "REFUSE"

type QuoteWithLead = QuoteDto & {
  lead: LeadDto
  lifecycle: QuoteLifecycle
}

const lifecycleOptions = ["Tous", "Envoye", "En negociation", "Accepte", "Refuse"] as const

const lifecycleColors: Record<QuoteLifecycle, string> = {
  ENVOYE: "bg-blue-50 text-blue-700",
  NEGOCIATION: "bg-amber-50 text-amber-700",
  ACCEPTE: "bg-green-50 text-green-700",
  REFUSE: "bg-red-50 text-red-700",
}

const lifecycleLabels: Record<QuoteLifecycle, string> = {
  ENVOYE: "Envoye",
  NEGOCIATION: "En negociation",
  ACCEPTE: "Accepte",
  REFUSE: "Refuse",
}

const leadStatusToLifecycle = (status?: string): QuoteLifecycle => {
  if (status === "CONVERTI") return "ACCEPTE"
  if (status === "PERDU") return "REFUSE"
  if (status === "NEGOCIATION") return "NEGOCIATION"
  return "ENVOYE"
}

const formatDateTime = (value?: string) => {
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

const getPropertyTypeLabel = (value?: string) => {
  switch (value) {
    case "APPARTEMENT":
      return "Appartement"
    case "VILLA":
      return "Villa"
    case "BUREAU":
      return "Bureau"
    case "LOCAL_COMMERCIAL":
      return "Local commercial"
    default:
      return value || "-"
  }
}

const getLeadDisplay = (lead: LeadDto) => `${lead.fullName} (${getPropertyTypeLabel(lead.propertyType)})`

export default function AdminQuotes() {
  const { token } = useAuth()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<(typeof lifecycleOptions)[number]>("Tous")
  const [allLeads, setAllLeads] = useState<LeadDto[]>([])
  const [allQuotes, setAllQuotes] = useState<QuoteWithLead[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedQuote, setSelectedQuote] = useState<QuoteWithLead | null>(null)

  const [showSendPanel, setShowSendPanel] = useState(false)
  const [selectedLeadId, setSelectedLeadId] = useState("")
  const [quoteFile, setQuoteFile] = useState<File | null>(null)
  const [isSending, setIsSending] = useState(false)

  const loadData = async (preferredLeadId?: string) => {
    if (!token) return

    setIsLoading(true)
    try {
      const leadsRes = await api.admin.leads.getAll(token, 1, 200)
      const leads: LeadDto[] = Array.isArray(leadsRes.data)
        ? leadsRes.data
        : Array.isArray((leadsRes.data as any)?.data)
          ? (leadsRes.data as any).data
          : []

      setAllLeads(leads)

      const quotesResults = await Promise.all(
        leads.map(async (lead) => {
          const quotesRes = await api.admin.quotes.getForLead(lead.id, token)
          const quotes: QuoteDto[] = Array.isArray(quotesRes.data) ? quotesRes.data : []

          return quotes.map((q) => ({
            ...q,
            lead,
            lifecycle: leadStatusToLifecycle(lead.status),
          }))
        }),
      )

      const merged = quotesResults.flat().sort((a, b) => {
        return new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
      })

      setAllQuotes(merged)

      const initialLeadId = preferredLeadId || searchParams.get("leadId") || ""
      if (initialLeadId) {
        setSelectedLeadId(initialLeadId)
        setShowSendPanel(true)
      }
    } catch (error) {
      console.error("Failed to load quotes module:", error)
      setAllLeads([])
      setAllQuotes([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [token])

  const filteredQuotes = useMemo(() => {
    return allQuotes.filter((quote) => {
      const q = search.toLowerCase()
      const matchSearch =
        quote.lead.fullName.toLowerCase().includes(q) ||
        quote.emailTo.toLowerCase().includes(q) ||
        quote.file.filename.toLowerCase().includes(q)

      const matchStatus =
        statusFilter === "Tous" ||
        lifecycleLabels[quote.lifecycle].toLowerCase() === statusFilter.toLowerCase()

      return matchSearch && matchStatus
    })
  }, [allQuotes, search, statusFilter])

  const selectedLead = allLeads.find((lead) => lead.id === selectedLeadId) || null

  const handleSendQuote = async () => {
    if (!token || !selectedLeadId || !quoteFile) {
      alert("Selectionnez un lead et un fichier de devis.")
      return
    }

    setIsSending(true)
    try {
      const res = await api.admin.quotes.sendForLead(selectedLeadId, quoteFile, token)
      if (res.error) {
        throw new Error(res.error)
      }

      setQuoteFile(null)
      alert("Devis envoye avec succes.")
      await loadData(selectedLeadId)
    } catch (error) {
      console.error("Failed to send quote:", error)
      alert("Erreur lors de l'envoi du devis.")
    } finally {
      setIsSending(false)
    }
  }

  if (selectedQuote) {
    const downloadUrl = resolveMediaUrl(selectedQuote.file.publicUrl || selectedQuote.file.public_url)

    return (
      <div className="p-6 lg:p-8 max-w-[1200px]">
        <button
          onClick={() => setSelectedQuote(null)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          Retour aux devis
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-4">
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-serif text-xl font-semibold text-foreground">
                    Devis du {formatDateTime(selectedQuote.sentAt)}
                  </h2>
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${lifecycleColors[selectedQuote.lifecycle]}`}>
                    {lifecycleLabels[selectedQuote.lifecycle]}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{selectedQuote.lead.fullName}</p>
              </div>

              {downloadUrl ? (
                <a
                  href={downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-card border border-border rounded-lg text-xs font-medium text-foreground hover:bg-muted transition-colors"
                >
                  <Download size={12} />
                  Telecharger PDF
                </a>
              ) : null}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-5">
              <InfoCard icon={Mail} label="Email destinataire" value={selectedQuote.emailTo} />
              <InfoCard icon={User} label="Envoye par" value={`${selectedQuote.sentBy.firstName || ""} ${selectedQuote.sentBy.lastName || ""}`.trim() || selectedQuote.sentBy.email || "-"} />
              <InfoCard icon={FileText} label="Fichier" value={selectedQuote.file.filename || "-"} />
              <InfoCard icon={Calendar} label="Date envoi" value={formatDateTime(selectedQuote.sentAt)} />
            </div>

            <div className="mt-5 border border-border rounded-lg p-4 bg-muted/20">
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Objet email</p>
              <p className="text-sm text-foreground">{selectedQuote.emailSubject || "-"}</p>
            </div>

            <div className="mt-3 border border-border rounded-lg p-4 bg-muted/20">
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Corps email</p>
              <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{selectedQuote.emailBody || "-"}</p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 h-fit">
            <h3 className="font-serif text-lg font-semibold text-foreground mb-4">Lead associe</h3>
            <div className="space-y-3 text-sm">
              <InfoLine label="Nom" value={selectedQuote.lead.fullName} />
              <InfoLine label="Email" value={selectedQuote.lead.email} />
              <InfoLine label="Telephone" value={selectedQuote.lead.phone} />
              <InfoLine label="Type" value={getPropertyTypeLabel(selectedQuote.lead.propertyType)} />
              <InfoLine label="Statut lead" value={selectedQuote.lead.status || "-"} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 max-w-[1200px]">
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground">Devis</h1>
          <p className="text-sm text-muted-foreground mt-1">Creez, envoyez et suivez vos devis clients</p>
        </div>
        <button
          onClick={() => setShowSendPanel((v) => !v)}
          className="flex items-center gap-2 bg-primary text-primary-foreground text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-[#0A1F35] transition-colors"
        >
          <Plus size={14} />
          Nouveau devis
        </button>
      </div>

      {showSendPanel ? (
        <div className="bg-card border border-border rounded-xl p-5 mb-5">
          <h2 className="font-serif text-lg font-semibold text-foreground mb-4">Envoyer un devis</h2>
          <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr_auto] gap-3 items-end">
            <div>
              <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">Lead</label>
              <select
                value={selectedLeadId}
                onChange={(e) => setSelectedLeadId(e.target.value)}
                className="w-full px-3 py-2.5 bg-background border border-input rounded-lg text-sm text-foreground focus:border-primary outline-none"
              >
                <option value="">Selectionner un lead</option>
                {allLeads.map((lead) => (
                  <option key={lead.id} value={lead.id}>{getLeadDisplay(lead)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">Fichier PDF</label>
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setQuoteFile(e.target.files?.[0] || null)}
                className="w-full px-3 py-2.5 bg-background border border-input rounded-lg text-sm text-foreground file:mr-3 file:rounded file:border-0 file:bg-muted file:px-2 file:py-1 file:text-xs"
              />
            </div>

            <button
              onClick={handleSendQuote}
              disabled={isSending || !selectedLeadId || !quoteFile}
              className="h-[42px] px-4 bg-primary text-primary-foreground text-sm rounded-lg hover:bg-[#0A1F35] disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
            >
              {isSending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              Envoyer
            </button>
          </div>

          {selectedLead ? (
            <p className="mt-3 text-xs text-muted-foreground">
              Le devis sera envoye automatiquement a {selectedLead.email}.
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par client, email ou fichier..."
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-input rounded-lg text-sm placeholder:text-muted-foreground/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
          />
        </div>

        <div className="relative">
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as (typeof lifecycleOptions)[number])}
            className="pl-9 pr-8 py-2.5 bg-card border border-input rounded-lg text-sm text-foreground focus:border-primary outline-none appearance-none cursor-pointer"
          >
            {lifecycleOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-primary mb-4" size={32} />
            <p className="text-muted-foreground">Chargement des devis...</p>
          </div>
        ) : filteredQuotes.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">Aucun devis trouve.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground font-medium">Fichier</th>
                  <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground font-medium">Client</th>
                  <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground font-medium">Type</th>
                  <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground font-medium">Statut</th>
                  <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground font-medium">Date envoi</th>
                  <th className="px-6 py-3 text-center text-xs uppercase tracking-wider text-muted-foreground font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredQuotes.map((quote) => {
                  const downloadUrl = resolveMediaUrl(quote.file.publicUrl || quote.file.public_url)

                  return (
                    <tr key={quote.id} className="border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-3 font-medium text-foreground flex items-center gap-2">
                        <FileText size={14} className="text-muted-foreground" />
                        <span className="truncate max-w-[220px]" title={quote.file.filename}>{quote.file.filename}</span>
                      </td>
                      <td className="px-6 py-3 text-foreground">{quote.lead.fullName}</td>
                      <td className="px-6 py-3 text-muted-foreground">{getPropertyTypeLabel(quote.lead.propertyType)}</td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${lifecycleColors[quote.lifecycle]}`}>
                          {lifecycleLabels[quote.lifecycle]}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-muted-foreground">{formatDateTime(quote.sentAt)}</td>
                      <td className="px-6 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setSelectedQuote(quote)}
                            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                            aria-label="Voir le devis"
                          >
                            <Eye size={14} />
                          </button>
                          {downloadUrl ? (
                            <a
                              href={downloadUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                              aria-label="Telecharger"
                            >
                              <Download size={14} />
                            </a>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function InfoCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail
  label: string
  value: string
}) {
  return (
    <div className="border border-border rounded-lg p-3 bg-muted/20">
      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1 inline-flex items-center gap-1">
        <Icon size={12} />
        {label}
      </p>
      <p className="text-sm text-foreground break-words">{value || "-"}</p>
    </div>
  )
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground text-right">{value || "-"}</span>
    </div>
  )
}
