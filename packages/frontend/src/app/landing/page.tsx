import { LandingNavbar } from '@/components/landing/navbar'
import { LandingHero } from '@/components/landing/hero'
import { LandingFeatures } from '@/components/landing/features'
import { LandingPricing } from '@/components/landing/pricing'
import { LandingFaq } from '@/components/landing/faq'
import { LandingFooter } from '@/components/landing/footer'

export default function LandingPage() {
  return (
    <>
      <LandingNavbar />
      <main>
        <LandingHero />
        <LandingFeatures />
        <LandingPricing />
        <LandingFaq />
      </main>
      <LandingFooter />
    </>
  )
}
