"use client"

const partners = [
  "Remax",
  "Club Rendement+",
  "Westerwelle Foundation",
  "Magasin Général",
  "Actia Engineering",
  "UNFT",
  "Be Softilys",
  "GMG",
  "Cosmitto",
]

function PartnerLogo({ name }: { name: string }) {
  return (
    <div className="flex items-center justify-center px-7 shrink-0 group cursor-default">
      <span className="text-sm font-semibold tracking-wide text-muted-foreground/60 group-hover:text-foreground transition-all duration-300 whitespace-nowrap uppercase">
        {name}
      </span>
    </div>
  )
}

export function Partners() {
  return (
    <section className="bg-background border-t border-border border-b border-b-border overflow-hidden py-6 md:py-7">
      <div className="mx-auto max-w-[1280px] px-6 mb-4">
        <p className="text-xs md:text-sm uppercase tracking-[0.15em] text-muted-foreground text-center">
          Ils nous font confiance
        </p>
      </div>

      <div
        className="relative overflow-hidden"
        style={{ scrollbarWidth: "none" }}
      >
        {/* Left fade */}
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        {/* Right fade */}
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

        <div className="animate-marquee flex w-max will-change-transform">
          {[...partners, ...partners, ...partners].map((name, index) => (
            <PartnerLogo key={`${name}-${index}`} name={name} />
          ))}
        </div>
      </div>
    </section>
  )
}
