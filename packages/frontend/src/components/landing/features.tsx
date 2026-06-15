import {
  Zap,
  Shield,
  BarChart3,
  Users,
  Globe,
  Headphones,
  type LucideIcon,
} from 'lucide-react'
import { siteConfig } from '@/config/site'

const iconMap: Record<string, LucideIcon> = {
  Zap,
  Shield,
  BarChart3,
  Users,
  Globe,
  Headphones,
}

export function LandingFeatures() {
  return (
    <section id="features" className="py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Todo lo que necesitás para lanzar
          </h2>
          <p className="mt-4 text-muted-foreground">
            Funcionalidades pensadas para que te enfoques en el negocio, no en la infraestructura.
          </p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {siteConfig.features.map((feature) => {
            const Icon = iconMap[feature.icon] ?? Zap
            return (
              <div
                key={feature.title}
                className="group rounded-xl border bg-card p-6 transition-shadow hover:shadow-md"
              >
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </div>
                <h3 className="font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
