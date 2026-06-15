import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { siteConfig } from '@/config/site'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function LandingHero() {
  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      {/* Background gradient */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,hsl(var(--primary)/0.12),transparent)]" />

      <div className="mx-auto max-w-6xl px-4 text-center">
        <Badge variant="outline" className="mb-6 px-4 py-1.5 text-sm">
          Listo para producción en minutos
        </Badge>

        <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
          {siteConfig.hero.headline}
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
          {siteConfig.hero.description}
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button size="lg" asChild className="gap-2">
            <Link href={siteConfig.hero.cta.href}>
              {siteConfig.hero.cta.label}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href={siteConfig.hero.ctaSecondary.href}>
              {siteConfig.hero.ctaSecondary.label}
            </Link>
          </Button>
        </div>

        {/* Social proof */}
        <p className="mt-8 text-sm text-muted-foreground">
          Sin tarjeta de crédito &middot; Cancelá cuando quieras &middot; Soporte en español
        </p>

        {/* App mockup placeholder */}
        <div className="mx-auto mt-16 max-w-4xl overflow-hidden rounded-xl border bg-muted/50 shadow-2xl">
          <div className="flex h-8 items-center gap-2 border-b bg-muted px-4">
            <div className="size-3 rounded-full bg-red-400" />
            <div className="size-3 rounded-full bg-yellow-400" />
            <div className="size-3 rounded-full bg-green-400" />
            <div className="mx-2 h-4 flex-1 rounded bg-muted-foreground/20" />
          </div>
          <div className="grid grid-cols-[200px_1fr] divide-x" style={{ minHeight: 320 }}>
            <div className="space-y-2 bg-card p-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-7 rounded-md bg-muted" />
              ))}
            </div>
            <div className="space-y-4 p-6">
              <div className="grid grid-cols-3 gap-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-20 rounded-lg border bg-card" />
                ))}
              </div>
              <div className="h-40 rounded-lg border bg-card" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
