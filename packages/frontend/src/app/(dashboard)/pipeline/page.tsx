'use client'

import { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { TrendingUp, Plus, Pencil, Trash2 } from 'lucide-react'
import { createDeal, deleteDeal, getDeals, updateDeal } from '@/lib/api/pipeline'
import { getClients } from '@/lib/api/clients'
import type { Client } from '@/types/clients'
import type { CreateDealDto, Deal, DealStage } from '@/types/pipeline'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'

const STAGES: { key: DealStage; label: string; color: string }[] = [
  { key: 'lead', label: 'Lead', color: '#6B7280' },
  { key: 'contacted', label: 'Contactado', color: '#3B82F6' },
  { key: 'proposal', label: 'Propuesta', color: '#F59E0B' },
  { key: 'won', label: 'Ganado', color: '#10B981' },
  { key: 'lost', label: 'Perdido', color: '#EF4444' },
]

export default function PipelinePage() {
  const { toast } = useToast()
  const [deals, setDeals] = useState<Deal[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState<Deal | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Deal | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)

  const form = useForm<CreateDealDto>({
    defaultValues: { title: '', clientId: '', value: 0, currency: 'USD', stage: 'lead', expectedCloseDate: '', notes: '' },
  })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [d, c] = await Promise.all([getDeals({ limit: 200 }), getClients({ limit: 100 })])
      setDeals(d.data)
      setClients(c.data)
    } catch { toast({ title: 'Error al cargar', variant: 'destructive' }) }
    finally { setLoading(false) }
  }, [toast])

  useEffect(() => { load() }, [load])

  const clientName = (id?: string) => clients.find(c => c._id === id)?.name

  const dealsByStage = (stage: DealStage) => deals.filter(d => d.stage === stage)

  const stageTotal = (stage: DealStage) => dealsByStage(stage).reduce((s, d) => s + d.value, 0)

  const totalPipeline = deals.filter(d => d.stage !== 'lost').reduce((s, d) => s + d.value, 0)
  const wonCount = deals.filter(d => d.stage === 'won').length
  const conversionRate = deals.length > 0 ? Math.round((wonCount / deals.length) * 100) : 0

  const openCreate = (stage: DealStage = 'lead') => {
    setEditing(null)
    form.reset({ title: '', clientId: '', value: 0, currency: 'USD', stage, expectedCloseDate: '', notes: '' })
    setSheetOpen(true)
  }

  const openEdit = (deal: Deal) => {
    setEditing(deal)
    form.reset({ title: deal.title, clientId: deal.clientId ?? '', value: deal.value, currency: deal.currency, stage: deal.stage, expectedCloseDate: deal.expectedCloseDate?.split('T')[0] ?? '', notes: deal.notes ?? '' })
    setSheetOpen(true)
  }

  const onSubmit = async (data: CreateDealDto) => {
    try {
      if (editing) { await updateDeal(editing._id, data); toast({ title: 'Deal actualizado' }) }
      else { await createDeal(data); toast({ title: 'Deal creado' }) }
      setSheetOpen(false)
      load()
    } catch { toast({ title: 'Error al guardar', variant: 'destructive' }) }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteDeal(deleteTarget._id)
      setDeleteTarget(null)
      toast({ title: 'Deal eliminado' })
      load()
    } catch { toast({ title: 'Error al eliminar', variant: 'destructive' }) }
  }

  const handleDrop = async (e: React.DragEvent, targetStage: DealStage) => {
    e.preventDefault()
    if (!draggingId) return
    const deal = deals.find(d => d._id === draggingId)
    if (!deal || deal.stage === targetStage) return
    setDeals(prev => prev.map(d => d._id === draggingId ? { ...d, stage: targetStage } : d))
    try {
      await updateDeal(draggingId, { stage: targetStage })
    } catch {
      toast({ title: 'Error al mover deal', variant: 'destructive' })
      load()
    }
    setDraggingId(null)
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="size-5" />
          <h1 className="text-xl font-semibold">Pipeline</h1>
        </div>
        <Button onClick={() => openCreate()}><Plus className="mr-2 size-4" />Nuevo deal</Button>
      </div>

      {/* KPI bar */}
      <div className="grid grid-cols-3 gap-4">
        <Card><CardHeader className="pb-1"><CardTitle className="text-sm font-medium text-muted-foreground">Pipeline total</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">${totalPipeline.toFixed(0)}</p></CardContent></Card>
        <Card><CardHeader className="pb-1"><CardTitle className="text-sm font-medium text-muted-foreground">Deals ganados</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-green-600">{wonCount}</p></CardContent></Card>
        <Card><CardHeader className="pb-1"><CardTitle className="text-sm font-medium text-muted-foreground">Tasa de conversión</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{conversionRate}%</p></CardContent></Card>
      </div>

      {/* Kanban */}
      {loading ? (
        <div className="grid grid-cols-5 gap-4">
          {STAGES.map(s => <Skeleton key={s.key} className="h-64 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-5 gap-4 overflow-x-auto">
          {STAGES.map(stage => (
            <div
              key={stage.key}
              className="flex flex-col gap-2 rounded-xl bg-muted/30 p-3 min-h-[200px]"
              onDragOver={e => e.preventDefault()}
              onDrop={e => handleDrop(e, stage.key)}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full" style={{ backgroundColor: stage.color }} />
                  <span className="text-xs font-semibold">{stage.label}</span>
                </div>
                <span className="text-xs text-muted-foreground">{dealsByStage(stage.key).length} · ${stageTotal(stage.key).toFixed(0)}</span>
              </div>
              {dealsByStage(stage.key).map(deal => (
                <div
                  key={deal._id}
                  draggable
                  onDragStart={() => setDraggingId(deal._id)}
                  onDragEnd={() => setDraggingId(null)}
                  className="rounded-lg border bg-card p-3 shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
                >
                  <p className="text-sm font-medium line-clamp-2">{deal.title}</p>
                  {deal.clientId && <p className="text-xs text-muted-foreground mt-1">{clientName(deal.clientId)}</p>}
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm font-semibold">{deal.currency} {deal.value.toFixed(0)}</span>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="size-6" onClick={() => openEdit(deal)}><Pencil className="size-3" /></Button>
                      <Button variant="ghost" size="icon" className="size-6" onClick={() => setDeleteTarget(deal)}><Trash2 className="size-3 text-destructive" /></Button>
                    </div>
                  </div>
                  {deal.expectedCloseDate && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Cierre: {new Date(deal.expectedCloseDate).toLocaleDateString('es-AR')}
                    </p>
                  )}
                </div>
              ))}
              <Button variant="ghost" size="sm" className="mt-auto text-xs text-muted-foreground" onClick={() => openCreate(stage.key)}>
                <Plus className="mr-1 size-3" />Agregar
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader><SheetTitle>{editing ? 'Editar deal' : 'Nuevo deal'}</SheetTitle></SheetHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-4">
              <FormField control={form.control} name="title" rules={{ required: 'El título es obligatorio' }} render={({ field }) => (
                <FormItem><FormLabel>Título *</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
              )} />
              <FormField control={form.control} name="clientId" render={({ field }) => (
                <FormItem><FormLabel>Cliente</FormLabel>
                  <Select value={field.value ?? ''} onValueChange={field.onChange}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Sin cliente" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="">Sin cliente</SelectItem>
                      {clients.map(c => <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select></FormItem>
              )} />
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="value" render={({ field }) => (
                  <FormItem><FormLabel>Valor</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(+e.target.value)} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="currency" render={({ field }) => (
                  <FormItem><FormLabel>Moneda</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                )} />
              </div>
              <FormField control={form.control} name="stage" render={({ field }) => (
                <FormItem><FormLabel>Stage</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>{STAGES.map(s => <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>)}</SelectContent>
                  </Select></FormItem>
              )} />
              <FormField control={form.control} name="expectedCloseDate" render={({ field }) => (
                <FormItem><FormLabel>Fecha cierre esperada</FormLabel><FormControl><Input type="date" {...field} /></FormControl></FormItem>
              )} />
              <FormField control={form.control} name="notes" render={({ field }) => (
                <FormItem><FormLabel>Notas</FormLabel><FormControl><textarea className="w-full rounded-md border px-3 py-2 text-sm" rows={3} {...field} /></FormControl></FormItem>
              )} />
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setSheetOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? 'Guardando...' : 'Guardar'}</Button>
              </div>
            </form>
          </Form>
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>¿Eliminar deal?</AlertDialogTitle>
            <AlertDialogDescription>Se eliminará <strong>{deleteTarget?.title}</strong>.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
