'use client'

import { useAuth } from '@/lib/hooks/use-auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Rocket } from 'lucide-react'

export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Bienvenido, {user?.name}</h1>
        <p className="text-muted-foreground">{user?.email}</p>
      </div>
      <Card className="max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Rocket className="size-5" />
            <CardTitle>Tu SaaS está listo para construir</CardTitle>
          </div>
          <CardDescription>
            El backend y el frontend están configurados y funcionando. Agregá tus módulos de negocio.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Consultá la documentación en{' '}
            <span className="font-mono text-foreground">.ai-docs/</span> para ver los patrones
            disponibles.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
