'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { CalendarDays, ChevronLeft, ChevronRight, Plus, Trash2, Copy } from 'lucide-react'
import {
  createPlannerBlock, deletePlannerBlock, duplicatePlannerBlock,
  getPlannerBlocks, updateBlockStatus, updatePlannerBlock
} from '@/lib/api/planner'
import type { BlockStatus, CreatePlannerBlockDto, PlannerBlock } from '@/types/planner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { useToast } from '@/hooks/use-toast'

const HOUR_HEIGHT = 64
const START_HOUR = 6
const END_HOUR = 23
const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i)

const STATUS_COLORS: Record<BlockStatus, string> = {
  pending: 'bg-blue-100 border-blue-300 text-blue-800',
  'in-progress': 'bg-yellow-100 border-yellow-300 text-yellow-800',
  completed: 'bg-green-100 border-green-300 text-green-700 opacity-70',
  skipped: 'bg-gray-100 border-gray-300 text-gray-500 opacity-60',
}
const STATUS_LABELS: Record<BlockStatus, string> = {
  pending: 'Pendiente', 'in-progress': 'En curso', completed: 'Completado', skipped: 'Omitido',
}

function toMinutes(time: string) {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

function blockTop(startTime: string) {
  const mins = toMinutes(startTime) - START_HOUR * 60
  return (mins / 60) * HOUR_HEIGHT
}

function blockHeight(startTime: string, endTime: string) {
  const dur = toMinutes(endTime) - toMinutes(startTime)
  return Math.max((dur / 60) * HOUR_HEIGHT, 20)
}

function dateToString(d: Date) {
  return d.toISOString().split('T')[0]
}

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })
}

export default function PlannerPage() {
  const { toast } = useToast()
  const [selectedDate, setSelectedDate] = useState(dateToString(new Date()))
  const [blocks, setBlocks] = useState<PlannerBlock[]>([])
  const [loading, setLoading] = useState(true)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState<PlannerBlock | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<PlannerBlock | null>(null)
  const timelineRef = useRef<HTMLDivElement>(null)

  const form = useForm<CreatePlannerBlockDto>({
    defaultValues: { title: '', date: selectedDate, startTime: '09:00', endTime: '10:00', status: 'pending', color: '#3B82F6', category: '', description: '' },
  })

  const load = useCallback(async (date: string) => {
    setLoading(true)
    try {
      const res = await getPlannerBlocks({ date })
      setBlocks(res.data)
    } catch { toast({ title: 'Error al cargar planner', variant: 'destructive' }) }
    finally { setLoading(false) }
  }, [toast])

  useEffect(() => { load(selectedDate) }, [load, selectedDate])

  const changeDate = (delta: number) => {
    const d = new Date(selectedDate + 'T12:00:00')
    d.setDate(d.getDate() + delta)
    setSelectedDate(dateToString(d))
  }

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('[data-block]')) return
    const rect = timelineRef.current?.getBoundingClientRect()
    if (!rect) return
    const y = e.clientY - rect.top
    const totalMins = (y / HOUR_HEIGHT) * 60 + START_HOUR * 60
    const h = Math.floor(totalMins / 60)
    const m = Math.floor((totalMins % 60) / 15) * 15
    const startTime = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
    const endH = h + 1 >= END_HOUR ? END_HOUR - 1 : h + 1
    const endTime = `${String(endH).padStart(2, '0')}:${String(m).padStart(2, '0')}`
    setEditing(null)
    form.reset({ title: '', date: selectedDate, startTime, endTime, status: 'pending', color: '#3B82F6', category: '', description: '' })
    setSheetOpen(true)
  }

  const openEdit = (block: PlannerBlock) => {
    setEditing(block)
    form.reset({ title: block.title, date: block.date, startTime: block.startTime, endTime: block.endTime, status: block.status, color: block.color ?? '#3B82F6', category: block.category ?? '', description: block.description ?? '' })
    setSheetOpen(true)
  }

  const onSubmit = async (data: CreatePlannerBlockDto) => {
    try {
      if (editing) {
        const updated = await updatePlannerBlock(editing._id, data)
        setBlocks(prev => prev.map(b => b._id === editing._id ? updated : b))
        toast({ title: 'Bloque actualizado' })
      } else {
        const created = await createPlannerBlock(data)
        setBlocks(prev => [...prev, created])
        toast({ title: 'Bloque creado' })
      }
      setSheetOpen(false)
    } catch { toast({ title: 'Error al guardar', variant: 'destructive' }) }
  }

  const handleCycleStatus = async (block: PlannerBlock) => {
    const order: BlockStatus[] = ['pending', 'in-progress', 'completed', 'skipped']
    const nextStatus = order[(order.indexOf(block.status) + 1) % order.length]
    try {
      const updated = await updateBlockStatus(block._id, nextStatus)
      setBlocks(prev => prev.map(b => b._id === block._id ? updated : b))
    } catch { toast({ title: 'Error', variant: 'destructive' }) }
  }

  const handleDuplicate = async (block: PlannerBlock) => {
    try {
      const dup = await duplicatePlannerBlock(block._id)
      setBlocks(prev => [...prev, dup])
      toast({ title: 'Bloque duplicado' })
    } catch { toast({ title: 'Error al duplicar', variant: 'destructive' }) }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deletePlannerBlock(deleteTarget._id)
      setBlocks(prev => prev.filter(b => b._id !== deleteTarget._id))
      setDeleteTarget(null)
      toast({ title: 'Bloque eliminado' })
    } catch { toast({ title: 'Error al eliminar', variant: 'destructive' }) }
  }

  const totalHeight = (END_HOUR - START_HOUR) * HOUR_HEIGHT

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarDays className="size-5" />
          <h1 className="text-xl font-semibold">Planner</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => changeDate(-1)}><ChevronLeft className="size-4" /></Button>
          <span className="text-sm font-medium capitalize min-w-[200px] text-center">{formatDate(selectedDate)}</span>
          <Button variant="outline" size="icon" onClick={() => changeDate(1)}><ChevronRight className="size-4" /></Button>
          <Button variant="outline" size="sm" onClick={() => setSelectedDate(dateToString(new Date()))}>Hoy</Button>
          <Button size="sm" onClick={() => { setEditing(null); form.reset({ title: '', date: selectedDate, startTime: '09:00', endTime: '10:00', status: 'pending', color: '#3B82F6', category: '', description: '' }); setSheetOpen(true) }}>
            <Plus className="mr-2 size-4" />Nuevo bloque
          </Button>
        </div>
      </div>

      {/* Timeline */}
      <div className="rounded-xl border overflow-hidden">
        <div className="flex">
          {/* Hour labels */}
          <div className="w-16 shrink-0 border-r bg-muted/20">
            {HOURS.map(h => (
              <div key={h} className="flex items-start justify-end pr-2 text-xs text-muted-foreground" style={{ height: HOUR_HEIGHT }}>
                <span className="mt-1">{String(h).padStart(2, '0')}:00</span>
              </div>
            ))}
          </div>

          {/* Blocks area */}
          <div
            ref={timelineRef}
            className="relative flex-1 cursor-pointer"
            style={{ height: totalHeight }}
            onClick={handleTimelineClick}
          >
            {/* Hour grid lines */}
            {HOURS.map(h => (
              <div key={h} className="absolute left-0 right-0 border-t border-muted/50" style={{ top: (h - START_HOUR) * HOUR_HEIGHT }} />
            ))}

            {/* Blocks */}
            {loading ? null : blocks.map(block => (
              <div
                key={block._id}
                data-block
                className={`absolute left-2 right-2 rounded-lg border p-2 overflow-hidden select-none ${STATUS_COLORS[block.status]}`}
                style={{ top: blockTop(block.startTime), height: blockHeight(block.startTime, block.endTime) }}
                onClick={e => { e.stopPropagation(); openEdit(block) }}
              >
                <p className="text-xs font-semibold line-clamp-1">{block.title}</p>
                <p className="text-xs opacity-70">{block.startTime} – {block.endTime}</p>
                <div className="absolute right-1 top-1 flex gap-0.5" onClick={e => e.stopPropagation()}>
                  <button
                    className="rounded px-1 py-0.5 text-xs font-medium hover:bg-black/10"
                    onClick={() => handleCycleStatus(block)}
                    title="Cambiar estado"
                  >
                    {STATUS_LABELS[block.status].slice(0, 3)}
                  </button>
                  <button className="rounded px-1 py-0.5 hover:bg-black/10" onClick={() => handleDuplicate(block)} title="Duplicar">
                    <Copy className="size-3" />
                  </button>
                  <button className="rounded px-1 py-0.5 hover:bg-black/10" onClick={() => setDeleteTarget(block)} title="Eliminar">
                    <Trash2 className="size-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader><SheetTitle>{editing ? 'Editar bloque' : 'Nuevo bloque'}</SheetTitle></SheetHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-4">
              <FormField control={form.control} name="title" rules={{ required: 'Requerido' }} render={({ field }) => (
                <FormItem><FormLabel>Título *</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
              )} />
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="startTime" render={({ field }) => (
                  <FormItem><FormLabel>Inicio</FormLabel><FormControl><Input type="time" {...field} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="endTime" render={({ field }) => (
                  <FormItem><FormLabel>Fin</FormLabel><FormControl><Input type="time" {...field} /></FormControl></FormItem>
                )} />
              </div>
              <FormField control={form.control} name="status" render={({ field }) => (
                <FormItem><FormLabel>Estado</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      {(Object.entries(STATUS_LABELS) as [BlockStatus, string][]).map(([v, l]) => (
                        <SelectItem key={v} value={v}>{l}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select></FormItem>
              )} />
              <FormField control={form.control} name="category" render={({ field }) => (
                <FormItem><FormLabel>Categoría</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
              )} />
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem><FormLabel>Descripción</FormLabel><FormControl>
                  <textarea className="w-full rounded-md border px-3 py-2 text-sm" rows={3} {...field} />
                </FormControl></FormItem>
              )} />
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setSheetOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? 'Guardando...' : 'Guardar'}
                </Button>
              </div>
            </form>
          </Form>
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>¿Eliminar bloque?</AlertDialogTitle>
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
