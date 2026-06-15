'use client'

import { CreditCard, ArrowUpRight } from 'lucide-react'
import { siteConfig } from '@/config/site'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

const currentPlan = siteConfig.pricing[0]

const invoiceHistory: Array<{ id: string; date: string; amount: string; status: string; plan: string }> = []

export default function BillingPage() {
  return (
    <div className="max-w-2xl space-y-6">
      {/* Current plan */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Plan actual</CardTitle>
              <CardDescription>Tus beneficios y límites vigentes.</CardDescription>
            </div>
            <Badge variant="secondary">{currentPlan.name}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-end gap-1">
            <span className="text-3xl font-bold">{currentPlan.price}</span>
            {currentPlan.period && (
              <span className="mb-1 text-sm text-muted-foreground">{currentPlan.period}</span>
            )}
          </div>

          <ul className="space-y-2">
            {currentPlan.features.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm">
                <span className="size-4 text-primary flex items-center justify-center">&#x2713;</span>
                {f}
              </li>
            ))}
          </ul>

          <Separator />

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button className="gap-2">
              <ArrowUpRight className="size-4" />
              Actualizar a Pro
            </Button>
            <Button variant="outline" disabled>
              Cancelar suscripción
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payment method */}
      <Card>
        <CardHeader>
          <CardTitle>Método de pago</CardTitle>
          <CardDescription>Administrá tus tarjetas guardadas.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <CreditCard className="size-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Sin método de pago</p>
                <p className="text-xs text-muted-foreground">Agregá una tarjeta para actualizar tu plan</p>
              </div>
            </div>
            <Button variant="outline" size="sm" disabled>
              Agregar tarjeta
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* History */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de facturación</CardTitle>
          <CardDescription>Tus últimas facturas generadas.</CardDescription>
        </CardHeader>
        <CardContent>
          {invoiceHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay facturas todavía.</p>
          ) : (
            <div className="space-y-2">
              {invoiceHistory.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between rounded-md border p-3 text-sm">
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-xs text-muted-foreground">{inv.id}</span>
                    <span>{inv.date}</span>
                    <Badge variant="outline">{inv.plan}</Badge>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-medium">{inv.amount}</span>
                    <Badge variant="secondary" className="text-xs">{inv.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
