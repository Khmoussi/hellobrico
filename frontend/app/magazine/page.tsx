import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { MobileCTA } from "@/components/mobile-cta"
import { MagazineHero } from "@/components/magazine/magazine-hero"
import { MagazineFeatured } from "@/components/magazine/magazine-featured"
import { MagazineGrid } from "@/components/magazine/magazine-grid"
import { MagazineCTA } from "@/components/magazine/magazine-cta"
import { MagazineNewsletter } from "@/components/magazine/magazine-newsletter"

export const metadata = {
  title: "HelloBrico Magazine — Conseils, réalisations et expertise",
  description:
    "Conseils techniques, études de cas, transformations réelles et bonnes pratiques pour rénover avec méthode et sérénité.",
}

export default function MagazinePage() {
  return (
    <>
      <Header forceSolid />
      <main>
        <MagazineHero />
        <MagazineFeatured />
        <MagazineGrid />
        <MagazineNewsletter />
        <MagazineCTA />
      </main>
      <Footer />
      <MobileCTA />
    </>
  )
}
