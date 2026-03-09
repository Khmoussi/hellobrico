import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { MobileCTA } from "@/components/mobile-cta"

export default function PolitiqueConfidentialitePage() {
  return (
    <>
      <Header forceSolid />
      <main className="bg-background pt-28 pb-20">
        <div className="mx-auto max-w-[900px] px-6">
          <h1 className="font-serif text-3xl md:text-[44px] md:leading-[1.12] font-bold text-foreground">
            Politique de confidentialité
          </h1>
          <div className="mt-8 space-y-6 text-sm md:text-base text-muted-foreground leading-relaxed">
            <p>
              HelloBrico collecte uniquement les données nécessaires au traitement
              des demandes d&apos;estimation et au suivi de la relation client.
            </p>
            <p>
              Les données transmises via les formulaires ne sont utilisées que
              dans le cadre du service demandé et ne sont pas revendues à des
              tiers.
            </p>
            <p>
              Vous pouvez demander l&apos;accès, la rectification ou la suppression
              de vos données en nous contactant à: contact@hellobrico.tn.
            </p>
          </div>
        </div>
      </main>
      <Footer />
      <MobileCTA />
    </>
  )
}
