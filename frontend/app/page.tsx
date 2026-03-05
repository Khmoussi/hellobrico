import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Hero } from "@/components/landing/hero"
import { Partners } from "@/components/landing/partners"
import { Process } from "@/components/landing/process"
import { LiveTracking } from "@/components/landing/live-tracking"
import { Problems } from "@/components/landing/problems"
import { CTAFinal } from "@/components/landing/cta-final"
import { MobileCTA } from "@/components/mobile-cta"

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Partners />
        <Process />
        <LiveTracking />
        <Problems />
        <CTAFinal />
      </main>
      <Footer />
      <MobileCTA />
    </>
  )
}
