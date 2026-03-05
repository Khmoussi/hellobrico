"use client"

import { useRef, useState, useEffect } from "react"
import Link from "next/link"
import {
  ClipboardList,
  FileText,
  Calendar,
  ShieldCheck,
  Search,
  Handshake,
  ArrowRight,
  CheckCircle2,
} from "lucide-react"

const steps = [
  {
    number: "01",
    title: "Visite Technique",
    impact: "On part du réel, pas des suppositions.",
    chips: ["État existant", "Contraintes techniques", "Photos / mesures"],
    detail:
      "Ce que vous recevez : un diagnostic clair des travaux nécessaires et des priorités. Ce que nous verrouillons : les risques (humidité, plomberie, électricité, structure).",
    icon: ClipboardList,
  },
  {
    number: "02",
    title: "Devis Détaillé",
    impact: "Un budget clair, ligne par ligne.",
    chips: ["Postes détaillés", "Quantités & matériaux", "Conditions claires"],
    detail:
      'Devis structuré et transparent, conçu pour éviter les "surprises chantier". Ce devis sert de référence pour piloter l\'exécution.',
    icon: FileText,
  },
  {
    number: "03",
    title: "Planification",
    impact: "Un planning réaliste, validé avant de commencer.",
    chips: ["Calendrier", "Séquence interventions", "Délais validés"],
    detail:
      "Nous organisons l'ordre des interventions pour éviter retards et improvisations. Vous connaissez la date de démarrage, les jalons, et la date cible.",
    icon: Calendar,
  },
  {
    number: "04",
    title: "Exécution Supervisée",
    impact: "Chaque jour, quelqu'un contrôle.",
    chips: ["Superviseur dédié", "Contrôle qualité", "Coordination équipes"],
    detail:
      "Le superviseur coordonne les intervenants et vérifie l'avancement + conformité. Objectif : une exécution propre, stable, et conforme au devis.",
    icon: ShieldCheck,
  },
  {
    number: "05",
    title: "Finitions & Vérification",
    impact: "Les détails font le premium.",
    chips: ["Check-list", "Corrections", "Validation qualité"],
    detail:
      'Contrôle des finitions, corrections si nécessaire, validation des points sensibles. On ne livre pas "à peu près".',
    icon: Search,
  },
  {
    number: "06",
    title: "Livraison & Garantie",
    impact: "Vous recevez un projet terminé, validé.",
    chips: ["Réception finale", "Dossier chantier", "Garantie"],
    detail:
      "Remise officielle, récapitulatif des travaux réalisés, garanties selon périmètre. Vous avez une clôture claire.",
    icon: Handshake,
  },
]

export function Process() {
  const [activeStep, setActiveStep] = useState<number>(0)
  const sectionRef = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true)
      },
      { threshold: 0.1 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  const ActiveIcon = steps[activeStep].icon

  return (
    <section ref={sectionRef} className="bg-[#f7f8fa] py-20 md:py-28 overflow-hidden">
      <div className="mx-auto max-w-[1280px] px-6">
        {/* Header — inspired by artisans-de-confiance clean style */}
        <div
          className={`text-center max-w-3xl mx-auto mb-14 md:mb-20 ${
            isVisible ? "animate-fade-up" : "opacity-0"
          }`}
        >
          <span className="inline-block text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-4">
            Notre méthode
          </span>
          <h2 className="font-serif text-3xl md:text-[44px] md:leading-[1.12] font-bold text-foreground">
            {"Une rénovation maîtrisée en "}
            <span className="text-primary">6 étapes</span>
          </h2>
          <p className="mt-5 text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            {"Chaque étape est pensée pour réduire l'incertitude : budget, délais, qualité, et visibilité. Vous savez où vous en êtes, ce qui est validé, et ce qui arrive ensuite."}
          </p>
        </div>

        {/* ━━━ Desktop: left steps + right detail ━━━ */}
        <div className="hidden md:grid md:grid-cols-[1fr_1fr] gap-10 lg:gap-16 items-start">
          {/* Left column: 2×3 grid of step cards */}
          <div className="grid grid-cols-2 gap-3">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = activeStep === index

              return (
                <button
                  key={step.number}
                  onClick={() => setActiveStep(index)}
                  className={`group relative text-left rounded-2xl p-5 transition-all duration-300 ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                      : "bg-card border border-border hover:border-primary/25 hover:shadow-md"
                  } ${isVisible ? "animate-fade-up" : "opacity-0"}`}
                  style={{ animationDelay: `${index * 60}ms` }}
                  aria-expanded={isActive}
                >
                  {/* Number + icon row */}
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`text-2xl font-bold font-serif ${
                        isActive ? "text-primary-foreground/30" : "text-foreground/10"
                      }`}
                    >
                      {step.number}
                    </span>
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 ${
                        isActive
                          ? "bg-primary-foreground/15"
                          : "bg-primary/5 group-hover:bg-primary/10"
                      }`}
                    >
                      <Icon
                        size={18}
                        strokeWidth={1.8}
                        className={isActive ? "text-primary-foreground" : "text-primary"}
                      />
                    </div>
                  </div>

                  {/* Title */}
                  <h3
                    className={`text-[15px] font-semibold mb-1 transition-colors ${
                      isActive ? "text-primary-foreground" : "text-foreground"
                    }`}
                  >
                    {step.title}
                  </h3>

                  {/* Short impact */}
                  <p
                    className={`text-xs leading-snug transition-colors ${
                      isActive
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground"
                    }`}
                  >
                    {step.impact}
                  </p>
                </button>
              )
            })}
          </div>

          {/* Right column: detail panel — travaux.com-inspired left border accent */}
          <div className="sticky top-28">
            <div
              key={activeStep}
              className="animate-fade-up"
            >
              {/* Card */}
              <div className="relative bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
                {/* Accent left bar */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-2xl" />

                <div className="p-8 lg:p-10 pl-9 lg:pl-11">
                  {/* Step badge */}
                  <div className="flex items-center gap-3 mb-6">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground text-sm font-bold">
                      {steps[activeStep].number}
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">
                      Étape {steps[activeStep].number} sur 06
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-serif text-2xl lg:text-[28px] font-bold text-foreground mb-2 leading-tight">
                    {steps[activeStep].title}
                  </h3>

                  {/* Impact — bold accent */}
                  <p className="text-sm font-medium text-primary mb-5">
                    {steps[activeStep].impact}
                  </p>

                  {/* Detail paragraph */}
                  <p className="text-[15px] text-muted-foreground leading-[1.75] mb-6">
                    {steps[activeStep].detail}
                  </p>

                  {/* Chips as checklist items */}
                  <div className="flex flex-col gap-2 mb-8">
                    {steps[activeStep].chips.map((chip) => (
                      <div key={chip} className="flex items-center gap-2.5">
                        <CheckCircle2
                          size={16}
                          className="text-primary shrink-0"
                          strokeWidth={2}
                        />
                        <span className="text-sm text-foreground font-medium">
                          {chip}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Progress bar */}
                  <div className="mb-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                      <span>Progression dans le processus</span>
                      <span className="font-medium text-foreground">
                        {Math.round(((activeStep + 1) / steps.length) * 100)}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                        style={{
                          width: `${((activeStep + 1) / steps.length) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation arrows */}
              <div className="flex items-center justify-between mt-5">
                <button
                  onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                  disabled={activeStep === 0}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                >
                  <ArrowRight size={14} className="rotate-180" />
                  Précédent
                </button>

                {/* Step dots */}
                <div className="flex items-center gap-1.5">
                  {steps.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveStep(i)}
                      className={`rounded-full transition-all duration-300 ${
                        activeStep === i
                          ? "w-6 h-2 bg-primary"
                          : "w-2 h-2 bg-border hover:bg-primary/30"
                      }`}
                      aria-label={`Étape ${i + 1}`}
                    />
                  ))}
                </div>

                <button
                  onClick={() =>
                    setActiveStep(Math.min(steps.length - 1, activeStep + 1))
                  }
                  disabled={activeStep === steps.length - 1}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                >
                  Suivant
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ━━━ Mobile: vertical timeline ━━━ */}
        <div className="md:hidden">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-[15px] top-0 bottom-0 w-px bg-border" />

            <div className="flex flex-col gap-0">
              {steps.map((step, index) => {
                const Icon = step.icon
                const isOpen = activeStep === index

                return (
                  <div
                    key={step.number}
                    className={`relative ${isVisible ? "animate-fade-up" : "opacity-0"}`}
                    style={{ animationDelay: `${index * 60}ms` }}
                  >
                    {/* Connector to dot */}
                    <button
                      onClick={() => setActiveStep(index)}
                      className="w-full flex items-start gap-4 py-4 text-left"
                      aria-expanded={isOpen}
                    >
                      {/* Timeline dot */}
                      <div
                        className={`relative z-10 w-[30px] h-[30px] rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                          isOpen
                            ? "bg-primary text-primary-foreground shadow-md shadow-primary/25 scale-110"
                            : index < activeStep
                            ? "bg-primary/15 text-primary"
                            : "bg-card text-muted-foreground border border-border"
                        }`}
                      >
                        {index < activeStep ? (
                          <CheckCircle2 size={14} strokeWidth={2} />
                        ) : (
                          <Icon size={14} strokeWidth={1.8} />
                        )}
                      </div>

                      {/* Text */}
                      <div className="flex-1 min-w-0 pt-0.5">
                        <span
                          className={`text-[10px] uppercase tracking-[0.15em] font-medium ${
                            isOpen ? "text-primary" : "text-muted-foreground/50"
                          }`}
                        >
                          Étape {step.number}
                        </span>
                        <h3
                          className={`text-sm font-semibold mt-0.5 ${
                            isOpen ? "text-foreground" : "text-foreground/70"
                          }`}
                        >
                          {step.title}
                        </h3>
                        {!isOpen && (
                          <p className="text-xs text-muted-foreground/60 mt-0.5">
                            {step.impact}
                          </p>
                        )}
                      </div>
                    </button>

                    {/* Expanded detail */}
                    <div
                      className={`overflow-hidden transition-all duration-300 ${
                        isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                      }`}
                    >
                      <div className="ml-[46px] pb-4">
                        {/* Left accent bar */}
                        <div className="border-l-2 border-primary pl-4">
                          <p className="text-xs font-medium text-primary mb-2">
                            {step.impact}
                          </p>
                          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                            {step.detail}
                          </p>
                          <div className="flex flex-col gap-1.5">
                            {step.chips.map((chip) => (
                              <div key={chip} className="flex items-center gap-2">
                                <CheckCircle2
                                  size={13}
                                  className="text-primary shrink-0"
                                  strokeWidth={2}
                                />
                                <span className="text-xs font-medium text-foreground">
                                  {chip}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div
          className={`mt-14 md:mt-20 text-center ${
            isVisible ? "animate-fade-up delay-500" : "opacity-0"
          }`}
        >
          <Link
            href="/estimation"
            className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-medium text-sm tracking-wide uppercase px-8 py-3.5 rounded-[10px] hover:bg-[#0A1F35] transition-all duration-300 shadow-lg shadow-primary/15"
          >
            Estimer mes travaux
            <ArrowRight size={16} />
          </Link>
          <p className="mt-3 text-xs text-muted-foreground">
            {"Réponse rapide • Sans engagement"}
          </p>
        </div>
      </div>
    </section>
  )
}
