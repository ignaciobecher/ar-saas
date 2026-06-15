import Link from 'next/link'
import { Check } from 'lucide-react'
import { siteConfig } from '@/config/site'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export function LandingPricing() {
  return (
    <section id="pricing" className="py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Precios claros y sin sorpresas
          </h2>
          <p className="mt-4 text-muted-foreground">
            Elegí el plan que mejor se adapte a tu equipo. Cambiá cuando quieras.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {siteConfig.pricing.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                'relative flex flex-col rounded-xl border p-8',
                plan.highlight
                  ? 'border-primary bg-primary text-primary-foreground shadow-lg'
                  : 'bg-card',
              )}
            >
              {plan.highlight && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-background text-foreground shadow">
                  Más popular
                </Badge>
              )}

              <div>
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <p
                  className={cn(
                    'mt-1 text-sm',
                    plan.highlight ? 'text-primary-foreground/80' : 'text-muted-foreground',
                  )}
                >
                  {plan.description}
                </p>
                <div className="mt-4 flex items-end gap-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.period && (
                    <span
                      className={cn(
                        'mb-1 text-sm',
                        plan.highlight ? 'text-primary-foreground/70' : 'text-muted-foreground',
                      )}
                    >
                      {plan.period}
                    </span>
                  )}
                </div>
              </div>

              <ul className="my-8 flex-1 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm">
                    <Check
                      className={cn(
                        'size-4 shrink-0',
                        plan.highlight ? 'text-primary-foreground' : 'text-primary',
                      )}
                    />
                    {f}
                  </li>
                ))}
              </ul>

              <Button
                asChild
                variant={plan.highlight ? 'secondary' : 'outline'}
                className="w-full"
              >
                <Link href={plan.href}>{plan.cta}</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
