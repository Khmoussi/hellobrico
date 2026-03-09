"use client"

import { useState } from "react"
import { Check, Upload, ArrowLeft, Loader2, X } from "lucide-react"
import Link from "next/link"
import { API_BASE_URL } from "@/lib/api"

const typologies = ["Appartement", "Villa", "Bureau", "Local commercial"]
const renovationTypes = [
  "Salle de bain",
  "Cuisine",
  "Rénovation complète",
  "Bureau / Local",
]
const budgetOptions = [
  "Moins de 20 000 DT",
  "20 000 – 50 000 DT",
  "50 000 DT +",
  "À définir",
]

const stepsLabels = ["Le projet", "Les détails", "Vos coordonnées"]

export function EstimationWizard() {
  const [step, setStep] = useState(0)

  // Step 1
  const [address, setAddress] = useState("")
  const [typology, setTypology] = useState("")
  const [renovations, setRenovations] = useState<string[]>([])

  // Step 2
  const [surface, setSurface] = useState("")
  const [budget, setBudget] = useState("")
  const [description, setDescription] = useState("")

  // Step 3
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [abroad, setAbroad] = useState(false)

  const [files, setFiles] = useState<{ id: string; name: string }[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [apiError, setApiError] = useState<string | null>(null)

  const [submitted, setSubmitted] = useState(false)

  const toggleRenovation = (item: string) => {
    setRenovations((prev) =>
      prev.includes(item) ? prev.filter((r) => r !== item) : [...prev, item]
    )
  }

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {}
    if (!address.trim()) newErrors.address = "L'adresse est requise"
    if (!typology) newErrors.typology = "Veuillez sélectionner une typologie"
    if (renovations.length === 0) newErrors.renovations = "Veuillez sélectionner au moins un type de rénovation"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep3 = () => {
    const newErrors: Record<string, string> = {}
    if (!name.trim()) newErrors.name = "Le nom est requis"
    
    // Strict phone validation for +216 or general international format to satisfy backend @IsPhoneNumber()
    const phoneRegex = /^\+[1-9]\d{6,14}$/
    if (!phone.trim()) {
      newErrors.phone = "Le téléphone est requis"
    } else if (!phoneRegex.test(phone.replace(/\s+/g, ""))) {
      newErrors.phone = "Le téléphone doit être au format international (ex: +216 20 123 456)"
    }
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email.trim() || !emailRegex.test(email)) newErrors.email = "Un email valide est requis"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNextStep1 = () => {
    if (validateStep1()) {
      setErrors({})
      setStep(1)
    }
  }

  const handleNextStep2 = () => {
    setErrors({})
    setStep(2)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
    if (!selectedFiles || selectedFiles.length === 0) return

    setIsUploading(true)
    const formData = new FormData()
    Array.from(selectedFiles).forEach((file) => {
      formData.append("files", file)
    })

    try {
      const response = await fetch(`${API_BASE_URL}/files/upload-multiple`, {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const contentType = response.headers.get("content-type")
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json()
          setFiles((prev) => [
            ...prev,
            ...data.map((f: any) => ({
              id: f.id,
              name: f.filename || f.originalname || "Fichier",
            })),
          ])
        } else {
          console.error("Upload succeeded but returned non-JSON response")
          // If we can't parse the response, we might not have the IDs
          setApiError("Fichiers envoyés mais la réponse serveur est invalide.")
        }
      } else {
        console.error("Failed to upload files, status:", response.status)
        setApiError("Erreur lors de l'envoi des fichiers.")
      }
    } catch (error) {
      console.error("Upload error:", error)
    } finally {
      setIsUploading(false)
    }
  }

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }

  const getPropertyTypeMap = (type: string) => {
    switch (type) {
      case "Appartement":
        return "APPARTEMENT"
      case "Villa":
        return "VILLA"
      case "Bureau":
        return "BUREAU"
      case "Local commercial":
        return "LOCAL_COMMERCIAL"
      default:
        return "APPARTEMENT"
    }
  }

  const getRenovationTypeMap = (type: string) => {
    switch (type) {
      case "Salle de bain":
        return "SALLE_DE_BAIN"
      case "Cuisine":
        return "CUISINE"
      case "Rénovation complète":
        return "RENOVATION_COMPLETE"
      case "Bureau / Local":
        return "BUREAU_LOCAL"
      default:
        return undefined
    }
  }

  const getBudgetBracketMap = (bg: string) => {
    switch (bg) {
      case "Moins de 20 000 DT":
        return "MOINS_20000"
      case "20 000 – 50 000 DT":
        return "BETWEEN_20000_50000"
      case "50 000 DT +":
        return "PLUS_50000"
      case "À définir":
        return "A_DEFINIR"
      default:
        return "A_DEFINIR"
    }
  }

  const handleSubmit = async () => {
    if (!validateStep3()) return

    setIsSubmitting(true)
    setApiError(null)

    const payload = {
      projectAddress: address,
      propertyType: getPropertyTypeMap(typology),
      renovationTypes: renovations.map(getRenovationTypeMap).filter(Boolean),
      surfaceM2: surface ? parseInt(surface, 10) : undefined,
      budgetBracket: budget ? getBudgetBracketMap(budget) : undefined,
      description: description || undefined,
      fullName: name,
      phone: phone.replace(/\s+/g, ""), // strip spaces for backend
      email: email,
      isAbroad: abroad,
      fileIds: files.map((f) => f.id),
    }

    try {
      const response = await fetch(`${API_BASE_URL}/leads`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        setSubmitted(true)
      } else {
        const contentType = response.headers.get("content-type")
        let errorMessage = "Une erreur s'est produite lors de l'envoi de votre demande."
        
        if (contentType && contentType.includes("application/json")) {
          try {
            const errorData = await response.json()
            if (Array.isArray(errorData.message)) {
              // Parse nested constraint objects if they exist
              errorMessage = errorData.message.map((err: any) => {
                if (typeof err === "string") return err;
                if (err && typeof err === "object" && err.constraints) {
                  return Object.values(err.constraints).join(", ")
                }
                if (err && typeof err === "object" && err.property) {
                  return `Erreur sur le champ: ${err.property}`
                }
                return JSON.stringify(err)
              }).join("; ")
            } else {
              errorMessage = errorData.message || errorMessage
            }
          } catch (e) {
            console.error("Failed to parse error JSON", e)
          }
        } else {
          console.error("Received non-JSON error response from server", await response.text().catch(() => ""))
        }
        
        setApiError(errorMessage)
      }
    } catch (error) {
      console.error("Submit error:", error)
      setApiError("Erreur de connexion au serveur. Veuillez réessayer plus tard.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
            <Check size={28} className="text-green-600" />
          </div>
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground">
            Demande envoyée
          </h2>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            {"Merci pour votre confiance. Notre équipe vous contactera rapidement avec une estimation structurée et détaillée."}
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center justify-center bg-primary text-primary-foreground font-medium text-sm tracking-wide px-6 py-3 rounded-[10px] hover:bg-[#0A1F35] transition-all duration-300"
          >
            {"Retour à l'accueil"}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-12 md:py-20">
      <div className="mx-auto max-w-[720px] px-6">
        {/* Hero text */}
        <div className="text-center mb-10">
          <h1 className="font-serif text-3xl md:text-[40px] md:leading-[1.15] font-bold text-foreground text-balance">
            Parlez-nous de votre projet.
          </h1>
          <p className="mt-3 text-base text-muted-foreground leading-relaxed max-w-lg mx-auto">
            {"Plus nous comprenons votre besoin, plus notre estimation sera précise. Toutes les informations partagées restent confidentielles."}
          </p>
        </div>

        {/* Progress bar */}
        <div className="flex items-center justify-between mb-10 relative">
          {stepsLabels.map((label, i) => (
            <div key={label} className="flex flex-col items-center relative z-10 flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                  i <= step
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {i < step ? <Check size={14} /> : i + 1}
              </div>
              <span
                className={`mt-2 text-xs transition-colors ${
                  i <= step ? "text-primary font-medium" : "text-muted-foreground"
                }`}
              >
                {label}
              </span>
            </div>
          ))}
          {/* Connecting line */}
          <div className="absolute top-4 left-[16%] right-[16%] h-px bg-border -z-0" />
          <div
            className="absolute top-4 left-[16%] h-px bg-primary transition-all duration-500 -z-0"
            style={{ width: `${(step / 2) * 68}%` }}
          />
        </div>

        {/* Step content */}
        <div className="bg-card rounded-2xl border border-border p-6 md:p-10">
          {/* STEP 1 */}
          {step === 0 && (
            <div className="space-y-6 animate-fade-up">
              <h2 className="font-serif text-xl md:text-2xl font-semibold text-foreground">
                Informations générales
              </h2>

              {/* Address */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">
                  Adresse du logement ou local <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value)
                    if (errors.address) setErrors({ ...errors, address: "" })
                  }}
                  placeholder="Ville, quartier, résidence..."
                  className={`w-full px-4 py-3 bg-card border ${
                    errors.address ? "border-red-500 focus:ring-red-500" : "border-input focus:border-primary focus:ring-primary"
                  } rounded-xl text-foreground text-base placeholder:text-muted-foreground/50 focus:ring-1 outline-none transition-all`}
                />
                {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address}</p>}
              </div>

              {/* Typology */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">
                  Typologie <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {typologies.map((t) => (
                    <button
                      key={t}
                      onClick={() => {
                        setTypology(t)
                        if (errors.typology) setErrors({ ...errors, typology: "" })
                      }}
                      className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200 ${
                        typology === t
                          ? "border-primary bg-primary/5 text-primary"
                          : errors.typology
                          ? "border-red-500/50 text-foreground hover:border-red-500"
                          : "border-input text-foreground hover:border-primary/30"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                {errors.typology && <p className="mt-1 text-xs text-red-500">{errors.typology}</p>}
              </div>

              {/* Renovation type */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">
                  Type de rénovation <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {renovationTypes.map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        toggleRenovation(r)
                        if (errors.renovations) setErrors({ ...errors, renovations: "" })
                      }}
                      className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm transition-all duration-200 ${
                        renovations.includes(r)
                          ? "border-primary bg-primary/5 text-primary"
                          : errors.renovations
                          ? "border-red-500/50 text-foreground hover:border-red-500"
                          : "border-input text-foreground hover:border-primary/30"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                          renovations.includes(r)
                            ? "border-primary bg-primary"
                            : "border-input"
                        }`}
                      >
                        {renovations.includes(r) && (
                          <Check size={10} className="text-primary-foreground" />
                        )}
                      </div>
                      {r}
                    </button>
                  ))}
                </div>
                {errors.renovations && <p className="mt-1 text-xs text-red-500">{errors.renovations}</p>}
              </div>

              <button
                onClick={handleNextStep1}
                className="w-full bg-primary text-primary-foreground font-medium text-sm tracking-wide py-3.5 rounded-[10px] hover:bg-[#0A1F35] transition-all duration-300"
              >
                Continuer →
              </button>
            </div>
          )}

          {/* STEP 2 */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-up">
              <h2 className="font-serif text-xl md:text-2xl font-semibold text-foreground">
                Décrivez votre projet.
              </h2>

              {/* Surface */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">
                  {"Surface approximative (optionnel)"}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={surface}
                    onChange={(e) => setSurface(e.target.value)}
                    placeholder="Ex: 80"
                    className="w-full px-4 py-3 pr-12 bg-card border border-input rounded-xl text-foreground text-base placeholder:text-muted-foreground/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    {"m²"}
                  </span>
                </div>
              </div>

              {/* Budget */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">
                  Budget estimatif
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {budgetOptions.map((b) => (
                    <button
                      key={b}
                      onClick={() => setBudget(b)}
                      className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200 ${
                        budget === b
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-input text-foreground hover:border-primary/30"
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              {/* Upload */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">
                  Fichiers
                </label>
                <div className="relative border-2 border-dashed border-input rounded-xl p-8 text-center bg-secondary/30 hover:bg-secondary/50 hover:border-primary/30 transition-all duration-200 cursor-pointer">
                  <input
                    type="file"
                    multiple
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                  />
                  {isUploading ? (
                    <div className="flex flex-col items-center justify-center">
                      <Loader2 className="animate-spin text-primary mb-2" size={24} />
                      <p className="text-sm text-foreground">Téléchargement...</p>
                    </div>
                  ) : (
                    <>
                      <Upload size={24} className="mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        {"Ajoutez des plans, photos ou vidéos de l'espace actuel"}
                      </p>
                      <p className="text-xs text-muted-foreground/60 mt-1">
                        {"Glissez-déposez ou cliquez pour parcourir"}
                      </p>
                    </>
                  )}
                </div>

                {files.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {files.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-3 bg-secondary/30 border border-border rounded-lg"
                      >
                        <span className="text-sm text-foreground truncate max-w-[200px] md:max-w-[300px]">
                          {file.name}
                        </span>
                        <button
                          onClick={() => removeFile(file.id)}
                          className="text-muted-foreground hover:text-red-500 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">
                  Description libre
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Décrivez les travaux souhaités, contraintes, délais souhaités..."
                  rows={5}
                  className="w-full px-4 py-3 bg-card border border-input rounded-xl text-foreground text-base placeholder:text-muted-foreground/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(0)}
                  className="flex items-center gap-2 px-5 py-3 rounded-[10px] border border-border text-foreground text-sm font-medium hover:bg-muted transition-all duration-200"
                >
                  <ArrowLeft size={14} />
                  Retour
                </button>
                <button
                  onClick={handleNextStep2}
                  className="flex-1 bg-primary text-primary-foreground font-medium text-sm tracking-wide py-3.5 rounded-[10px] hover:bg-[#0A1F35] transition-all duration-300"
                >
                  Continuer →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-up">
              <h2 className="font-serif text-xl md:text-2xl font-semibold text-foreground">
                Comment pouvons-nous vous contacter ?
              </h2>

              <div>
                <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">
                  Nom complet <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    if (errors.name) setErrors({ ...errors, name: "" })
                  }}
                  placeholder="Votre nom"
                  className={`w-full px-4 py-3 bg-card border ${
                    errors.name ? "border-red-500 focus:ring-red-500" : "border-input focus:border-primary focus:ring-primary"
                  } rounded-xl text-foreground text-base placeholder:text-muted-foreground/50 focus:ring-1 outline-none transition-all`}
                />
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">
                  Téléphone / WhatsApp <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value)
                    if (errors.phone) setErrors({ ...errors, phone: "" })
                  }}
                  placeholder="+216 XX XXX XXX"
                  className={`w-full px-4 py-3 bg-card border ${
                    errors.phone ? "border-red-500 focus:ring-red-500" : "border-input focus:border-primary focus:ring-primary"
                  } rounded-xl text-foreground text-base placeholder:text-muted-foreground/50 focus:ring-1 outline-none transition-all`}
                />
                {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (errors.email) setErrors({ ...errors, email: "" })
                  }}
                  placeholder="votre@email.com"
                  className={`w-full px-4 py-3 bg-card border ${
                    errors.email ? "border-red-500 focus:ring-red-500" : "border-input focus:border-primary focus:ring-primary"
                  } rounded-xl text-foreground text-base placeholder:text-muted-foreground/50 focus:ring-1 outline-none transition-all`}
                />
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
              </div>

              {/* Abroad checkbox */}
              <div>
                <button
                  onClick={() => setAbroad(!abroad)}
                  className="flex items-center gap-3"
                >
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                      abroad
                        ? "border-primary bg-primary"
                        : "border-input"
                    }`}
                  >
                    {abroad && (
                      <Check size={12} className="text-primary-foreground" />
                    )}
                  </div>
                  <span className="text-sm text-foreground">
                    {"Je suis actuellement à l'étranger"}
                  </span>
                </button>
                {abroad && (
                  <p className="mt-2 text-xs text-muted-foreground bg-secondary/50 rounded-lg px-3 py-2">
                    {"Nous proposons un suivi live pour les clients à distance."}
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center gap-2 px-5 py-3 rounded-[10px] border border-border text-foreground text-sm font-medium hover:bg-muted transition-all duration-200"
                >
                  <ArrowLeft size={14} />
                  Retour
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 bg-primary text-primary-foreground font-medium text-sm tracking-wide py-3.5 rounded-[10px] hover:bg-[#0A1F35] transition-all duration-300 disabled:opacity-50 flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin mr-2" />
                      Envoi en cours...
                    </>
                  ) : (
                    "Recevoir mon estimation"
                  )}
                </button>
              </div>

              {apiError && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm text-center">
                  {apiError}
                </div>
              )}
              <p className="text-xs text-center text-muted-foreground">
                {"Réponse rapide • Sans engagement • Étude structurée"}
              </p>
            </div>
          )}
        </div>

        {/* Bottom reassurance */}
        <div className="mt-10 text-center">
          <h3 className="text-sm font-semibold text-foreground">
            {"Pourquoi cette demande est-elle structurée ?"}
          </h3>
          <p className="mt-2 text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
            {"Parce qu'une estimation sérieuse repose sur des informations précises. Notre objectif est de vous fournir une réponse claire et adaptée à votre projet."}
          </p>
        </div>
      </div>
    </div>
  )
}
