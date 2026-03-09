import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { MobileCTA } from "@/components/mobile-cta"

export default function MentionsLegalesPage() {
  return (
    <>
      <Header forceSolid />
      <main className="bg-background pt-28 pb-20">
        <div className="mx-auto max-w-[900px] px-6">
          <h1 className="font-serif text-3xl md:text-[44px] md:leading-[1.12] font-bold text-foreground">
            Mentions légales
          </h1>
          <div className="mt-8 space-y-6 text-sm md:text-base text-muted-foreground leading-relaxed">
            <p>
              Le présent site est édité par HelloBrico. Les informations présentées
              sont fournies à titre informatif et peuvent être mises à jour à tout
              moment.
            </p>
            <p>
              Pour toute demande relative au site ou aux services, vous pouvez
              nous contacter à l&apos;adresse: contact@hellobrico.tn.
            </p>
            <p>
              Les contenus (textes, visuels, éléments graphiques) sont protégés
              et ne peuvent être reproduits sans autorisation préalable.
            </p>
          </div>
        </div>
      </main>
      <Footer />
      <MobileCTA />
    </>
  )
}
