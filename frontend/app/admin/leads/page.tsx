"use client"

import { useEffect, useState } from "react"
import { Search, Filter, ChevronDown, Phone, Mail, MapPin, Calendar, MessageSquare, FileText, ArrowLeft, Loader2, Download, Trash2 } from "lucide-react"
import { api, type AdminUserDto, type LeadDto, type LeadHistoryDto, type UploadedFileDto } from "@/lib/api"
import { useAuth } from "@/components/admin/auth-context"
import { useRouter } from "next/navigation"

const statuses = ["Tous", "NOUVEAU", "CONTACTE", "VISITE_PLANIFIEE", "DEVIS_ENVOYE", "NEGOCIATION", "CONVERTI", "PERDU"]

// Mapping backend enums to displayable French labels
const statusLabels: Record<string, string> = {
  "NOUVEAU": "Nouveau",
  "CONTACTE": "Contacté",
  "VISITE_PLANIFIEE": "Visite planifiée",
  "DEVIS_ENVOYE": "Devis envoyé",
  "NEGOCIATION": "Négociation",
  "CONVERTI": "Converti",
  "PERDU": "Perdu"
}

const statusColors: Record<string, string> = {
  "NOUVEAU": "bg-blue-50 text-blue-700",
  "CONTACTE": "bg-amber-50 text-amber-700",
  "VISITE_PLANIFIEE": "bg-indigo-50 text-indigo-700",
  "DEVIS_ENVOYE": "bg-emerald-50 text-emerald-700",
  "NEGOCIATION": "bg-orange-50 text-orange-700",
  "CONVERTI": "bg-green-50 text-green-700",
  "PERDU": "bg-red-50 text-red-700",
}

export default function AdminLeads() {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("Tous")
  const [serviceFilter, setServiceFilter] = useState("Tous")
  const [budgetFilter, setBudgetFilter] = useState("Tous")
  const [isAbroadFilter, setIsAbroadFilter] = useState(false)
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [allLeads, setAllLeads] = useState<LeadDto[]>([])
  const [assignableUsers, setAssignableUsers] = useState<AdminUserDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedLead, setSelectedLead] = useState<LeadDto | null>(null)
  const [selectedLeadFiles, setSelectedLeadFiles] = useState<UploadedFileDto[]>([])
  const [isLoadingLeadDetails, setIsLoadingLeadDetails] = useState(false)
  
  // History and Notes states
  const [leadHistory, setLeadHistory] = useState<LeadHistoryDto[]>([])
  const [newNote, setNewNote] = useState("")
  const [isSubmittingNote, setIsSubmittingNote] = useState(false)
  const [isAssigning, setIsAssigning] = useState(false)
  const [selectedAssigneeId, setSelectedAssigneeId] = useState("")
  const [emailSubject, setEmailSubject] = useState("")
  const [emailBody, setEmailBody] = useState("")
  const [isSendingEmail, setIsSendingEmail] = useState(false)

  const { token } = useAuth()

  useEffect(() => {
    const fetchLeads = async () => {
      if (!token) return;
      setIsLoading(true)
      try {
        const [leadsRes, usersRes] = await Promise.all([
          api.admin.leads.getAll(token, 1, 100),
          api.admin.users.getAll(token, 1, 200),
        ])

        if (leadsRes.error) {
          throw new Error(leadsRes.error)
        }

        if (usersRes.error) {
          throw new Error(usersRes.error)
        }

        if (Array.isArray(leadsRes.data)) {
          setAllLeads(leadsRes.data)
        } else if (Array.isArray((leadsRes.data as any)?.data)) {
          setAllLeads((leadsRes.data as any).data)
        } else {
          setAllLeads([])
        }

        const usersData = Array.isArray(usersRes.data)
          ? usersRes.data
          : Array.isArray((usersRes.data as any)?.data)
            ? (usersRes.data as any).data
            : []

        // Leads can be assigned to commercial/supervisor users.
        setAssignableUsers(
          (usersData as AdminUserDto[]).filter(
            (user) => user.role === "COMMERCIAL" || user.role === "SUPERVISOR",
          ),
        )
      } catch (error) {
        console.error("Error fetching leads:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchLeads()
  }, [token])

  useEffect(() => {
    const fetchLeadDetail = async () => {
      if (!selectedLead || !token) return

      setIsLoadingLeadDetails(true)
      try {
        const [leadRes, historyRes] = await Promise.all([
          api.admin.leads.getById(selectedLead.id, token),
          api.admin.leads.getHistory(selectedLead.id, token),
        ])

        const resolvedLead = leadRes.data || selectedLead
        setSelectedLead(resolvedLead)
        setSelectedAssigneeId(resolvedLead.assignedTo?.id || "")
        setEmailSubject(`Suivi de votre demande - ${resolvedLead.fullName}`)
        setEmailBody(
          `Bonjour ${resolvedLead.fullName},\n\nNous revenons vers vous concernant votre demande de renovation.\n\nCordialement,\nEquipe HelloBrico`,
        )

        if (historyRes.data) {
          setLeadHistory(Array.isArray(historyRes.data) ? historyRes.data : [])
        }

        if (Array.isArray((resolvedLead as any).files) && (resolvedLead as any).files.length > 0) {
          setSelectedLeadFiles((resolvedLead as any).files)
          return
        }

        if (Array.isArray(resolvedLead.fileIds) && resolvedLead.fileIds.length > 0) {
          const filesRes = await api.upload.findByIds(resolvedLead.fileIds, token)
          if (!filesRes.error && Array.isArray(filesRes.data)) {
            setSelectedLeadFiles(filesRes.data)
            return
          }
        }

        setSelectedLeadFiles([])
      } catch (error) {
        console.error("Error fetching lead details:", error)
      } finally {
        setIsLoadingLeadDetails(false)
      }
    }

    fetchLeadDetail()
  }, [selectedLead?.id, token])

  const handleOpenLead = async (lead: LeadDto) => {
    setSelectedLead(lead)
  }

  const handleDeleteLeadFile = async (fileId: string) => {
    if (!token || !selectedLead) return
    const confirmed = window.confirm("Supprimer ce fichier ?")
    if (!confirmed) return

    try {
      const response = await api.upload.deleteFile(fileId, token)
      if (response.error) throw new Error(response.error)
      setSelectedLeadFiles((prev) => prev.filter((file) => file.id !== fileId))
    } catch (error) {
      console.error("Failed to delete file", error)
      alert("Erreur lors de la suppression du fichier.")
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedLead || !token) return;
    
    // Optimistic update
    const previousStatus = selectedLead.status;
    setSelectedLead({ ...selectedLead, status: newStatus });
    setAllLeads(allLeads.map(l => l.id === selectedLead.id ? { ...l, status: newStatus } : l));
    
    try {
      const response = await api.admin.leads.updateStatus(selectedLead.id, newStatus, token);
      if (response.error) {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error("Failed to update status", error);
      // Revert on error
      setSelectedLead({ ...selectedLead, status: previousStatus });
      setAllLeads(allLeads.map(l => l.id === selectedLead.id ? { ...l, status: previousStatus } : l));
      alert("Erreur lors de la mise à jour du statut.");
    }
  }

  const handleAssignLead = async (assignedToId: string) => {
    if (!selectedLead || !token) return

    setIsAssigning(true)
    try {
      const response = await api.admin.leads.assign(
        selectedLead.id,
        assignedToId || null,
        token,
      )
      if (response.error) throw new Error(response.error)

      const updatedLead = response.data || { ...selectedLead, assignedTo: null }
      setSelectedLead(updatedLead)
      setAllLeads(allLeads.map((lead) => (lead.id === updatedLead.id ? updatedLead : lead)))
      setSelectedAssigneeId(updatedLead.assignedTo?.id || "")
    } catch (error) {
      console.error("Failed to assign lead", error)
      alert("Erreur lors de l'assignation du lead.")
    } finally {
      setIsAssigning(false)
    }
  }

  const handleScheduleVisit = async () => {
    await handleStatusChange("VISITE_PLANIFIEE")
  }

  const handleSendEmail = async () => {
    if (!selectedLead) return
    if (!emailSubject.trim() || !emailBody.trim()) {
      alert("Sujet et contenu email requis.")
      return
    }

    setIsSendingEmail(true)
    try {
      const response = await api.email.send(
        selectedLead.email,
        emailSubject.trim(),
        emailBody.trim(),
        token || undefined,
      )
      if (response.error) throw new Error(response.error)
      alert("Email envoye avec succes.")
    } catch (error) {
      console.error("Failed to send email", error)
      alert("Erreur lors de l'envoi de l'email.")
    } finally {
      setIsSendingEmail(false)
    }
  }

  const getAssignedToText = (lead: LeadDto) => {
    if (!lead.assignedTo) return "—"
    const fullName = `${lead.assignedTo.firstName || ""} ${lead.assignedTo.lastName || ""}`.trim()
    return fullName || lead.assignedTo.email || lead.assignedTo.id
  }

  const handleAddNote = async () => {
    if (!selectedLead || !token || !newNote.trim()) return;
    setIsSubmittingNote(true);
    try {
      const response = await api.admin.leads.addNote(selectedLead.id, newNote.trim(), token);
      if (response.error) throw new Error(response.error);
      setNewNote("");
      // Refresh history
      const historyRes = await api.admin.leads.getHistory(selectedLead.id, token);
      if (historyRes.data) {
          setLeadHistory(Array.isArray(historyRes.data) ? historyRes.data : []);
      }
    } catch (error) {
      console.error("Failed to add note", error);
      alert("Erreur lors de l'ajout de la note.");
    } finally {
      setIsSubmittingNote(false);
    }
  }

  const filtered = allLeads.filter((lead) => {
    const leadName = lead.fullName || ""
    const query = search.toLowerCase()
    const projectType = getTypologyText(lead.propertyType).toLowerCase()
    const renovationTypes = getRenovationTypesText(lead.renovationTypes || []).toLowerCase()
    const matchSearch =
      leadName.toLowerCase().includes(query) ||
      lead.phone.toLowerCase().includes(query) ||
      lead.email.toLowerCase().includes(query) ||
      projectType.includes(query) ||
      renovationTypes.includes(query)

    const matchStatus = statusFilter === "Tous" || lead.status === statusFilter

    const matchService =
      serviceFilter === "Tous" ||
      lead.propertyType === serviceFilter ||
      (lead.renovationTypes || []).includes(serviceFilter)

    const matchBudget = budgetFilter === "Tous" || (lead.budgetBracket || "") === budgetFilter

    const matchAbroad = !isAbroadFilter || Boolean(lead.isAbroad)

    const createdAt = new Date(lead.createdAt)
    const fromDate = dateFrom ? new Date(`${dateFrom}T00:00:00`) : null
    const toDate = dateTo ? new Date(`${dateTo}T23:59:59`) : null
    const matchDate = (!fromDate || createdAt >= fromDate) && (!toDate || createdAt <= toDate)

    return matchSearch && matchStatus && matchService && matchBudget && matchAbroad && matchDate
  })

  function getBudgetText(budget: string) {
    switch (budget) {
      case "MOINS_20000": return "< 20 000 DT"
      case "BETWEEN_20000_50000": return "20 000 - 50 000 DT"
      case "PLUS_50000": return "50 000 DT +"
      case "A_DEFINIR": return "À définir"
      default: return budget || "Non spécifié"
    }
  }

  function getTypologyText(type: string) {
    switch(type) {
      case "APPARTEMENT": return "Appartement"
      case "VILLA": return "Villa"
      case "BUREAU": return "Bureau"
      case "LOCAL_COMMERCIAL": return "Local commercial"
      default: return type
    }
  }

  function getRenovationTypesText(types: string[]) {
    if (!types || !types.length) return "Non spécifié"
    const map: Record<string, string> = {
      SALLE_DE_BAIN: "Salle de bain",
      CUISINE: "Cuisine",
      RENOVATION_COMPLETE: "Rénovation complète",
      BUREAU_LOCAL: "Bureau / Local"
    }
    return types.map(t => map[t] || t).join(", ")
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "—"
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }).format(new Date(dateString))
  }

  if (selectedLead) {
    return (
      <div className="p-6 lg:p-8 max-w-[1200px]">
        <button
          onClick={() => setSelectedLead(null)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          Retour aux leads
        </button>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left: project info */}
          <div className="flex-1">
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="font-serif text-xl font-semibold text-foreground mb-4">
                Informations projet
              </h2>
              <div className="space-y-3">
                <InfoRow label="Adresse" value={selectedLead.projectAddress || "Non spécifié"} icon={MapPin} />
                <InfoRow label="Typologie" value={getTypologyText(selectedLead.propertyType)} />
                <InfoRow label="Type rénovation" value={getRenovationTypesText(selectedLead.renovationTypes)} />
                <InfoRow label="Budget" value={getBudgetText(selectedLead.budgetBracket || "")} />
                <InfoRow label="Surface" value={selectedLead.surfaceM2 ? `${selectedLead.surfaceM2} m²` : "Non spécifié"} />
                <InfoRow label="Date" value={formatDate(selectedLead.createdAt)} icon={Calendar} />
              </div>
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Description</p>
                <p className="text-sm text-foreground leading-relaxed">{selectedLead.description || "Aucune description fournie."}</p>
              </div>

              {isLoadingLeadDetails ? (
                <div className="mt-4 pt-4 border-t border-border flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 size={14} className="animate-spin" />
                  Chargement des fichiers...
                </div>
              ) : selectedLeadFiles.length > 0 ? (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Fichiers joints</p>
                  <div className="gap-2 flex flex-col">
                    {selectedLeadFiles.map((file) => (
                      <a
                        key={file.id}
                        href={file.publicUrl || file.public_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center p-3 rounded-lg border border-border bg-secondary/20 hover:bg-secondary/40 transition-colors"
                      >
                        <FileText size={16} className="text-muted-foreground mr-3 shrink-0" />
                        <span className="text-sm text-foreground flex-1 truncate">{file.filename || "Fichier joint"}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            void handleDeleteLeadFile(file.id)
                          }}
                          className="mr-2 text-muted-foreground hover:text-red-600 transition-colors"
                          aria-label="Supprimer le fichier"
                        >
                          <Trash2 size={14} />
                        </button>
                        <Download size={14} className="text-muted-foreground ml-2 shrink-0 hover:text-primary transition-colors" />
                      </a>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            {/* Notes */}
            <div className="bg-card border border-border rounded-xl p-6 mt-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">Notes internes</h3>
              <div className="flex flex-col gap-3">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Ajouter une note interne..."
                  rows={3}
                  className="w-full px-3 py-2.5 bg-background border border-input rounded-lg text-sm placeholder:text-muted-foreground/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"
                />
                <button 
                  onClick={handleAddNote}
                  disabled={isSubmittingNote || !newNote.trim()}
                  className="self-end px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-[#0A1F35] transition-colors disabled:opacity-50"
                >
                  {isSubmittingNote ? <Loader2 size={14} className="animate-spin inline mr-2" /> : null}
                  Ajouter la note
                </button>
              </div>
            </div>

            {/* History */}
            <div className="bg-card border border-border rounded-xl p-6 mt-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">Historique</h3>
              <div className="space-y-4">
                {leadHistory.map((h, i) => (
                  <div key={h.id || i} className="flex gap-3 text-sm border-b border-border last:border-0 pb-3 last:pb-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/40 mt-1.5 shrink-0" />
                    <div className="flex-1 flex flex-col gap-1">
                       <span className="text-foreground font-medium">
                         {h.type === "STATUS_CHANGE" && `Statut changé: ${statusLabels[h.oldStatus || ""] || h.oldStatus} ➔ ${statusLabels[h.newStatus || ""] || h.newStatus}`}
                         {h.type === "NOTE" && "Note ajoutée"}
                         {h.type === "ASSIGN" && "Assignation modifiée"}
                         {h.type === "CREATION" && "Lead créé"}
                       </span>
                       {h.note && <span className="text-muted-foreground bg-muted p-2 rounded-lg mt-1">{h.note}</span>}
                       <span className="text-muted-foreground text-xs mt-1">
                         {formatDate(h.createdAt)} {h.user && `par ${h.user.firstName || ""} ${h.user.lastName || ""}`}
                       </span>
                    </div>
                  </div>
                ))}
                {leadHistory.length === 0 && (
                   <div className="text-sm text-muted-foreground">Aucun historique disponible.</div>
                )}
              </div>
            </div>
          </div>

          {/* Right: contact info */}
          <div className="w-full lg:w-[340px]">
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="font-serif text-xl font-semibold text-foreground mb-4">
                Contact
              </h2>
              <div className="space-y-3">
                <InfoRow label="Nom" value={selectedLead.fullName} />
                <InfoRow label="Téléphone" value={selectedLead.phone} icon={Phone} />
                <InfoRow label="Email" value={selectedLead.email} icon={Mail} />
                <InfoRow label="Résident étranger" value={selectedLead.isAbroad ? "Oui" : "Non"} />
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-4 space-y-2">
              <button
                onClick={handleScheduleVisit}
                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground text-sm font-medium py-2.5 rounded-lg hover:bg-[#0A1F35] transition-colors"
              >
                <Calendar size={14} /> Planifier visite
              </button>
              <button
                onClick={() => router.push(`/admin/quotes?leadId=${selectedLead.id}`)}
                className="w-full flex items-center justify-center gap-2 bg-card border border-border text-foreground text-sm font-medium py-2.5 rounded-lg hover:bg-muted transition-colors"
              >
                <FileText size={14} /> Générer devis
              </button>
              <button
                onClick={handleSendEmail}
                disabled={isSendingEmail}
                className="w-full flex items-center justify-center gap-2 bg-card border border-border text-foreground text-sm font-medium py-2.5 rounded-lg hover:bg-muted transition-colors disabled:opacity-60"
              >
                <MessageSquare size={14} /> Envoyer email
              </button>
            </div>

            <div className="bg-card border border-border rounded-xl p-4 mt-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Assigner le lead</p>
              <select
                value={selectedAssigneeId}
                onChange={(e) => {
                  setSelectedAssigneeId(e.target.value)
                  void handleAssignLead(e.target.value)
                }}
                disabled={isAssigning}
                className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm text-foreground focus:border-primary outline-none disabled:opacity-60"
              >
                <option value="">Non assigne</option>
                {assignableUsers.map((user) => {
                  const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim()
                  const label = fullName || user.email || user.id
                  return (
                    <option key={user.id} value={user.id}>{label}</option>
                  )
                })}
              </select>
            </div>

            <div className="bg-card border border-border rounded-xl p-4 mt-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Email client</p>
              <div className="space-y-2">
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Sujet"
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm text-foreground focus:border-primary outline-none"
                />
                <textarea
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  rows={4}
                  placeholder="Contenu"
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm text-foreground focus:border-primary outline-none resize-none"
                />
              </div>
            </div>

            {/* Status change */}
            <div className="bg-card border border-border rounded-xl p-4 mt-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Changer statut</p>
              <select 
                value={selectedLead.status || ""} 
                onChange={(e) => handleStatusChange(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm text-foreground focus:border-primary outline-none"
              >
                {statuses.filter(s => s !== "Tous").map(s => (
                  <option key={s} value={s}>{statusLabels[s] || s}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 max-w-[1200px]">
      <div className="mb-8">
        <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground">
          Leads (CRM)
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gérez et suivez vos demandes d{"'"}estimation
        </p>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-4 mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-3">
          <div className="relative lg:col-span-2">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher nom, tel, email..."
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-input rounded-lg text-sm placeholder:text-muted-foreground/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
          />
          </div>

          <div className="relative">
            <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-9 pr-8 py-2.5 bg-card border border-input rounded-lg text-sm text-foreground focus:border-primary outline-none appearance-none cursor-pointer"
          >
            {statuses.map((s) => (
              <option key={s} value={s}>{statusLabels[s] || s}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>

          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="px-3 py-2.5 bg-card border border-input rounded-lg text-sm text-foreground focus:border-primary outline-none appearance-none cursor-pointer"
          >
            <option value="Tous">Type service</option>
            <option value="APPARTEMENT">Appartement</option>
            <option value="VILLA">Villa</option>
            <option value="BUREAU">Bureau</option>
            <option value="LOCAL_COMMERCIAL">Local commercial</option>
            <option value="SALLE_DE_BAIN">Salle de bain</option>
            <option value="CUISINE">Cuisine</option>
            <option value="RENOVATION_COMPLETE">Renovation complete</option>
            <option value="BUREAU_LOCAL">Bureau / Local</option>
          </select>

          <select
            value={budgetFilter}
            onChange={(e) => setBudgetFilter(e.target.value)}
            className="px-3 py-2.5 bg-card border border-input rounded-lg text-sm text-foreground focus:border-primary outline-none appearance-none cursor-pointer"
          >
            <option value="Tous">Budget</option>
            <option value="MOINS_20000">&lt; 20 000 DT</option>
            <option value="BETWEEN_20000_50000">20 000 - 50 000 DT</option>
            <option value="PLUS_50000">50 000+ DT</option>
            <option value="A_DEFINIR">A definir</option>
          </select>

          <div className="flex items-center gap-2 px-3 py-2.5 bg-card border border-input rounded-lg text-sm text-foreground">
            <input
              id="abroad-only"
              type="checkbox"
              checked={isAbroadFilter}
              onChange={(e) => setIsAbroadFilter(e.target.checked)}
              className="rounded border-input"
            />
            <label htmlFor="abroad-only" className="cursor-pointer">A l'etranger</label>
          </div>

          <div className="grid grid-cols-2 gap-2 lg:col-span-2">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-2.5 bg-card border border-input rounded-lg text-sm text-foreground focus:border-primary outline-none"
            />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-2.5 bg-card border border-input rounded-lg text-sm text-foreground focus:border-primary outline-none"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-primary mb-4" size={32} />
            <p className="text-muted-foreground">Chargement des leads...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            Aucun lead trouvé.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground font-medium">Nom</th>
                <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground font-medium">Tel</th>
                <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground font-medium">Type</th>
                <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground font-medium">Budget</th>
                <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground font-medium">Statut</th>
                <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground font-medium">Assigné</th>
                <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((lead) => (
                <tr
                  key={lead.id}
                  onClick={() => void handleOpenLead(lead)}
                  className="border-b border-border last:border-b-0 hover:bg-muted/30 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-3 font-medium text-foreground">{lead.fullName}</td>
                  <td className="px-6 py-3 text-muted-foreground">{lead.phone}</td>
                  <td className="px-6 py-3 text-muted-foreground truncate max-w-[150px]" title={lead.renovationTypes ? getRenovationTypesText(lead.renovationTypes) : lead.propertyType}>
                    {lead.renovationTypes ? getRenovationTypesText(lead.renovationTypes) : lead.propertyType}
                  </td>
                  <td className="px-6 py-3 text-muted-foreground">{getBudgetText(lead.budgetBracket || "")}</td>
                  <td className="px-6 py-3">
                    <select
                      value={lead.status}
                      onClick={(e) => e.stopPropagation()}
                      onChange={async (e) => {
                        const newStatus = e.target.value
                        const previous = lead.status

                        setAllLeads((prev) =>
                          prev.map((item) =>
                            item.id === lead.id ? { ...item, status: newStatus } : item,
                          ),
                        )

                        try {
                          const response = await api.admin.leads.updateStatus(lead.id, newStatus, token || "")
                          if (response.error) throw new Error(response.error)
                        } catch (error) {
                          console.error("Inline status update failed", error)
                          setAllLeads((prev) =>
                            prev.map((item) =>
                              item.id === lead.id ? { ...item, status: previous } : item,
                            ),
                          )
                          alert("Erreur lors de la mise a jour du statut.")
                        }
                      }}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium border border-transparent ${statusColors[lead.status] || "bg-muted text-muted-foreground"}`}
                    >
                      {statuses.filter((s) => s !== "Tous").map((status) => (
                        <option key={status} value={status}>{statusLabels[status] || status}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-3 text-muted-foreground">{getAssignedToText(lead)}</td>
                  <td className="px-6 py-3 text-muted-foreground">{formatDate(lead.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </div>
    </div>
  )
}

function InfoRow({ label, value, icon: Icon }: { label: string; value: string; icon?: React.ComponentType<{ size?: number; className?: string }> }) {
  return (
    <div className="flex items-center gap-3">
      {Icon && <Icon size={14} className="text-muted-foreground shrink-0" />}
      <div>
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="text-sm text-foreground">{value}</p>
      </div>
    </div>
  )
}
