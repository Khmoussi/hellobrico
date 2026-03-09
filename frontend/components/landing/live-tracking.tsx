"use client"

import Link from "next/link"
import {
  Camera,
  FileBarChart,
  UserCheck,
  Clock,
  CheckCircle2,
  ArrowRight,
  Wifi,
  Play,
  BarChart3,
  MessageSquare,
} from "lucide-react"
import { useRef, useState, useEffect } from "react"

const features = [
  {
    icon: Camera,
    title: "Caméra sur chantier",
    desc: "Un regard permanent pour réduire l'incertitude. Accès en temps réel depuis votre téléphone.",
  },
  {
    icon: FileBarChart,
    title: "Compte-rendu régulier",
    desc: "Avancement, décisions, prochaines étapes — tout documenté et envoyé.",
  },
  {
    icon: UserCheck,
    title: "Un superviseur responsable",
    desc: "Un interlocuteur unique, clair et réactif. Pas de flou.",
  },
]

const trackingSteps = [
  { label: "Démolition", status: "done", progress: 100 },
  { label: "Plomberie", status: "done", progress: 100 },
  { label: "Électricité", status: "done", progress: 100 },
  { label: "Pose carrelage", status: "current", progress: 65 },
  { label: "Peinture", status: "upcoming", progress: 0 },
  { label: "Installation sanitaire", status: "upcoming", progress: 0 },
]

export function LiveTracking() {
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

  return (
    <section ref={sectionRef} className="bg-background py-20 md:py-28 overflow-hidden">
      <div className="mx-auto max-w-[1280px] px-6">
        {/* ━━━ Top: header ━━━ */}
        <div
          className={`text-center max-w-3xl mx-auto mb-14 md:mb-20 ${
            isVisible ? "animate-fade-up" : "opacity-0"
          }`}
        >
          <span className="inline-block text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-4">
            Suivi en temps réel
          </span>
          <h2 className="font-serif text-3xl md:text-[44px] md:leading-[1.12] font-bold text-foreground">
            {"Suivez votre chantier "}
            <span className="text-primary">en live</span>
          </h2>
          <p className="mt-5 text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            {"La confiance ne se demande pas — elle se prouve. Caméra sur site, reporting régulier, et un superviseur qui vous répond clairement."}
          </p>
        </div>

        {/* ━━━ Main content: text + dashboard mockup ━━━ */}
        <div className="flex flex-col lg:flex-row items-start gap-12 lg:gap-16">
          {/* Left: features + text */}
          <div className="flex-1 max-w-xl">
            {/* Feature cards — vertical list with left accent */}
            <div className="flex flex-col gap-4">
              {features.map((f, index) => {
                const Icon = f.icon
                return (
                  <div
                    key={f.title}
                    className={`group relative bg-card border border-border rounded-2xl p-5 hover:border-primary/20 hover:shadow-md transition-all duration-300 ${
                      isVisible ? "animate-fade-up" : "opacity-0"
                    }`}
                    style={{ animationDelay: `${100 + index * 80}ms` }}
                  >
                    {/* Left accent */}
                    <div className="absolute left-0 top-4 bottom-4 w-1 bg-primary/20 rounded-full group-hover:bg-primary transition-colors duration-300" />

                    <div className="flex items-start gap-4 pl-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                        <Icon
                          size={20}
                          className="text-primary"
                          strokeWidth={1.6}
                        />
                      </div>
                      <div>
                        <h3 className="text-[15px] font-semibold text-foreground mb-1">
                          {f.title}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {f.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Diaspora callout */}
            <div
              className={`mt-6 bg-primary/[0.03] border border-primary/10 rounded-2xl p-5 ${
                isVisible ? "animate-fade-up delay-400" : "opacity-0"
              }`}
            >
              <p className="text-sm text-foreground font-medium mb-1">
                {"🌍 Pensé pour la diaspora"}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {"Vous êtes à l'étranger ? Suivez, validez et restez serein grâce à un accès complet depuis votre téléphone ou ordinateur."}
              </p>
            </div>

            {/* CTAs */}
            <div
              className={`mt-8 flex flex-col sm:flex-row gap-3 ${
                isVisible ? "animate-fade-up delay-500" : "opacity-0"
              }`}
            >
              <Link
                href="/estimation"
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 bg-primary text-primary-foreground font-medium text-sm tracking-wide uppercase px-7 py-3.5 rounded-[10px] hover:bg-[#0A1F35] transition-all duration-300 shadow-lg shadow-primary/15"
              >
                Demander une estimation
                <ArrowRight size={16} />
              </Link>
            </div>
            <p
              className={`mt-2 text-xs text-muted-foreground ${
                isVisible ? "animate-fade-up delay-500" : "opacity-0"
              }`}
            >
              {"Réponse rapide • Sans engagement • Projets en Tunisie & à distance"}
            </p>
          </div>

          {/* Right: dashboard mockup — inspired by artisans-de-confiance */}
          <div
            className={`w-full lg:w-auto lg:flex-1 ${
              isVisible ? "animate-fade-up delay-300" : "opacity-0"
            }`}
          >
            {/* Browser chrome mockup */}
            <div className="bg-card rounded-2xl shadow-xl border border-border overflow-hidden max-w-[480px] mx-auto lg:mx-0">
              {/* Browser bar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400/70" />
                  <div className="w-3 h-3 rounded-full bg-amber-400/70" />
                  <div className="w-3 h-3 rounded-full bg-green-400/70" />
                </div>
                <div className="flex-1 mx-3">
                  <div className="bg-muted rounded-lg px-3 py-1.5 text-[11px] text-muted-foreground font-mono text-center">
                    app.hellobrico.com/suivi
                  </div>
                </div>
              </div>

              {/* Dashboard content */}
              <div className="p-5">
                {/* Header row */}
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h4 className="text-sm font-bold text-foreground">
                      Suivi de chantier
                    </h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Projet #2847 — Villa Carthage
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 border border-green-200 rounded-full">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-green-700">
                      En direct
                    </span>
                  </div>
                </div>

                {/* Global progress */}
                <div className="bg-[#f7f8fa] rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-foreground">
                      Avancement global
                    </span>
                    <span className="text-lg font-bold text-primary">
                      58%
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full w-[58%] bg-primary rounded-full transition-all duration-1000" />
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Clock size={10} />
                      <span>Mis à jour il y a 8 min</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      Fin estimée : 22 mars
                    </span>
                  </div>
                </div>

                {/* Step-by-step tracking */}
                <div className="space-y-2 mb-4">
                  {trackingSteps.map((step) => (
                    <div
                      key={step.label}
                      className="flex items-center gap-3"
                    >
                      {/* Status icon */}
                      {step.status === "done" ? (
                        <CheckCircle2
                          size={16}
                          className="text-green-500 shrink-0"
                          strokeWidth={2}
                        />
                      ) : step.status === "current" ? (
                        <div className="w-4 h-4 rounded-full border-2 border-primary bg-primary/10 shrink-0 flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        </div>
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-border shrink-0" />
                      )}

                      {/* Label */}
                      <span
                        className={`text-xs flex-1 ${
                          step.status === "done"
                            ? "text-muted-foreground line-through"
                            : step.status === "current"
                            ? "text-foreground font-semibold"
                            : "text-muted-foreground/60"
                        }`}
                      >
                        {step.label}
                      </span>

                      {/* Progress pill */}
                      {step.status === "current" && (
                        <span className="text-[10px] font-semibold text-primary bg-primary/8 px-2 py-0.5 rounded-full">
                          {step.progress}%
                        </span>
                      )}
                      {step.status === "done" && (
                        <span className="text-[10px] font-medium text-green-600">
                          ✓
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Quick action pills */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <button className="flex items-center gap-1.5 px-3 py-2 bg-primary/5 hover:bg-primary/10 rounded-xl text-[11px] font-medium text-primary transition-colors">
                    <Play size={12} />
                    Voir le live
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-2 bg-muted hover:bg-muted/80 rounded-xl text-[11px] font-medium text-foreground transition-colors">
                    <BarChart3 size={12} />
                    Rapports
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-2 bg-muted hover:bg-muted/80 rounded-xl text-[11px] font-medium text-foreground transition-colors">
                    <MessageSquare size={12} />
                    Contact
                  </button>
                </div>

                {/* Camera thumbnails */}
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2">
                    Caméra en direct
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {["Salon", "Cuisine", "SDB"].map((room) => (
                      <div
                        key={room}
                        className="relative aspect-video rounded-lg bg-gradient-to-br from-muted to-muted/50 overflow-hidden group cursor-pointer"
                      >
                        {/* Simulated camera feed */}
                        <div className="absolute inset-0 bg-[#1a2b3c] flex items-center justify-center">
                          <Wifi size={14} className="text-white/20" />
                        </div>
                        {/* Label */}
                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 px-1.5 py-1">
                          <span className="text-[9px] text-white font-medium">
                            {room}
                          </span>
                        </div>
                        {/* Live dot */}
                        <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
