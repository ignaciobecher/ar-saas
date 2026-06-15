'use client'

import { Users, BarChart3, TrendingUp, Activity } from 'lucide-react'
import { useAuth } from '@/lib/hooks/use-auth'
import { StatCard } from '@/components/dashboard/stat-card'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

const stats = [
  {
    title: 'Usuarios activos',
    value: '—',
    description: 'Total de cuentas registradas',
    icon: Users,
    trend: { value: '0%', positive: true },
  },
  {
    title: 'Ingresos del mes',
    value: '$—',
    description: 'Facturación del período actual',
    icon: TrendingUp,
    trend: { value: '0%', positive: true },
  },
  {
    title: 'Eventos totales',
    value: '—',
    description: 'Acciones registradas hoy',
    icon: Activity,
    trend: { value: '0%', positive: true },
  },
  {
    title: 'Conversión',
    value: '—%',
    description: 'Free → plan de pago',
    icon: BarChart3,
    trend: { value: '0 pts', positive: true },
  },
]

const quickStart = [
  { step: '1', title: 'Configurá el backend', description: 'Completá las variables en /backend/.env con tu cadena de MongoDB y las keys de JWT.' },
  { step: '2', title: 'Personalizá la landing', description: 'Editá src/config/site.ts para cambiar nombre, tagline, precios y contenido.' },
  { step: '3', title: 'Conectá tu dominio', description: 'Apuntá tu DNS al servidor y configurá SSL. Consultá la guía de deploy.' },
  { step: '4', title: 'Activá los pagos', description: 'Integrá Stripe u otro procesador en el módulo de facturación.' },
]

export default function DashboardPage() {
  const { user } = useAuth()

  if (!user) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Bienvenido, {user.name}</h2>
        <p className="text-sm text-muted-foreground">{user.email}</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Quick start */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle className="text-base">Primeros pasos</CardTitle>
            <Badge variant="secondary" className="text-xs">Checklist</Badge>
          </div>
          <CardDescription>
            Seguí estos pasos para tener tu SaaS listo para producción.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-4">
            {quickStart.map((item) => (
              <li key={item.step} className="flex gap-4">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {item.step}
                </span>
                <div>
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{item.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}
