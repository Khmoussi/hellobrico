import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { MobileCTA } from "@/components/mobile-cta"
import { ServicesHero } from "@/components/services/services-hero"
import { ServicesGrid } from "@/components/services/services-grid"
import { ServicesApproach } from "@/components/services/services-approach"
import { ServicesTeaser } from "@/components/services/services-teaser"

export const metadata = {
  title: "Nos Services — HelloBrico",
  description:
    "Rénovation salle de bain, cuisine, complète ou bureaux. Des services structurés, supervisés et transparents.",
}

export default function ServicesPage() {
  return (
    <>
      <Header forceSolid />
      <main>
        <ServicesHero />
        <ServicesGrid />
        <ServicesApproach />
        <ServicesTeaser />
      </main>
      <Footer />
      <MobileCTA />
    </>
  )
}
