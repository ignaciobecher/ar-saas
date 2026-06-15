'use client'

import { useCallback, useEffect, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { FileText, Plus, Pencil, Trash2 } from 'lucide-react'
import { createInvoice, deleteInvoice, getInvoices, updateInvoice } from '@/lib/api/invoices'
import { getClients } from '@/lib/api/clients'
import type { Client } from '@/types/clients'
import type { CreateInvoiceDto, Invoice } from '@/types/invoices'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { useToast } from '@/hooks/use-toast'

const STATUS_LABELS: Record<string, string> = {
  draft: 'Borrador', pending: 'Pendiente', paid: 'Pagada', overdue: 'Vencida', cancelled: 'Cancelada',
}
const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  draft: 'outline', pending: 'secondary', paid: 'default', overdue: 'destructive', cancelled: 'secondary',
}

const PAGE_SIZE = 20

export default function InvoicesPage() {
  const { toast } = useToast()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [kpiIncome, setKpiIncome] = useState(0)
  const [kpiExpense, setKpiExpense] = useState(0)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'income' | 'expense'>('income')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState<Invoice | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Invoice | null>(null)

  const form = useForm<CreateInvoiceDto>({
    defaultValues: { type: 'income', number: '', clientId: '', status: 'draft', issueDate: '', dueDate: '', items: [], taxRate: 0, currency: 'USD', notes: '' },
  })
  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'items' as never })
  const watchItems = form.watch('items') ?? []
  const watchTax = form.watch('taxRate') ?? 0
  const subtotal = (watchItems as { amount: number }[]).reduce((s, i) => s + (i.amount || 0), 0)
  const taxAmount = Math.round(subtotal * ((watchTax as number) / 100) * 100) / 100
  const total = subtotal + taxAmount

  const loadKpis = useCallback(async () => {
    try {
      const [inc, exp] = await Promise.all([
        getInvoices({ type: 'income', limit: 500 }),
        getInvoices({ type: 'expense', limit: 500 }),
      ])
      setKpiIncome(inc.data.reduce((s, i) => s + i.total, 0))
      setKpiExpense(exp.data.reduce((s, i) => s + i.total, 0))
    } catch { /* silent — KPIs are non-critical */ }
  }, [])

  const load = useCallback(async (type: 'income' | 'expense' = activeTab, status?: string, p: number = page) => {
    setLoading(true)
    try {
      const [inv, cli] = await Promise.all([
        getInvoices({ type, status: status && status !== 'all' ? status : undefined, page: p, limit: PAGE_SIZE }),
        getClients({ limit: 100 }),
      ])
      setInvoices(inv.data)
      setTotalPages(inv.totalPages ?? 1)
      setClients(cli.data)
    } catch {
      toast({ title: 'Error al cargar facturas', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [activeTab, page, toast])

  useEffect(() => { load(activeTab, statusFilter, page) }, [load, activeTab, statusFilter, page])
  useEffect(() => { loadKpis() }, [loadKpis])

  const clientName = (id?: string) => clients.find(c => c._id === id)?.name ?? '—'

  const balance = kpiIncome - kpiExpense

  const openCreate = () => {
    setEditing(null)
    form.reset({ type: activeTab, number: '', clientId: '', status: 'draft', issueDate: new Date().toISOString().split('T')[0], items: [], taxRate: 0, currency: 'USD', notes: '', total: 0 })
    setSheetOpen(true)
  }

  const openEdit = (inv: Invoice) => {
    setEditing(inv)
    form.reset({
      type: inv.type, number: inv.number ?? '', clientId: inv.clientId ?? '',
      status: inv.status, issueDate: inv.issueDate?.split('T')[0] ?? '',
      dueDate: inv.dueDate?.split('T')[0] ?? '', items: inv.items,
      taxRate: inv.taxRate, currency: inv.currency, notes: inv.notes ?? '', total: inv.total,
    })
    setSheetOpen(true)
  }

  const onSubmit = async (data: CreateInvoiceDto) => {
    try {
      if (editing) { await updateInvoice(editing._id, data); toast({ title: 'Factura actualizada' }) }
      else { await createInvoice(data); toast({ title: 'Factura creada' }) }
      setSheetOpen(false)
      load(activeTab, statusFilter, page)
      loadKpis()
    } catch {
      toast({ title: 'Error al guardar', variant: 'destructive' })
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteInvoice(deleteTarget._id)
      setDeleteTarget(null)
      toast({ title: 'Factura eliminada' })
      load(activeTab, statusFilter, page)
      loadKpis()
    } catch {
      toast({ title: 'Error al eliminar', variant: 'destructive' })
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="size-5" />
          <h1 className="text-xl font-semibold">Facturas</h1>
        </div>
        <Button onClick={openCreate}><Plus className="mr-2 size-4" />Nueva factura</Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <Card><CardHeader className="pb-1"><CardTitle className="text-sm font-medium text-muted-foreground">Total ingresos</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-green-600">${kpiIncome.toFixed(2)}</p></CardContent></Card>
        <Card><CardHeader className="pb-1"><CardTitle className="text-sm font-medium text-muted-foreground">Total gastos</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-red-600">${kpiExpense.toFixed(2)}</p></CardContent></Card>
        <Card><CardHeader className="pb-1"><CardTitle className="text-sm font-medium text-muted-foreground">Balance</CardTitle></CardHeader>
          <CardContent><p className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>${balance.toFixed(2)}</p></CardContent></Card>
      </div>

      <Tabs value={activeTab} onValueChange={v => { setActiveTab(v as 'income' | 'expense'); setStatusFilter('all') }}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="income" onClick={() => setPage(1)}>Ingresos</TabsTrigger>
            <TabsTrigger value="expense" onClick={() => setPage(1)}>Gastos</TabsTrigger>
          </TabsList>
          <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(1) }}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Estado" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {Object.entries(STATUS_LABELS).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {(['income', 'expense'] as const).map(tab => (
          <TabsContent key={tab} value={tab} className="mt-4">
            <div className="rounded-lg border">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/40">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Número</th>
                    <th className="px-4 py-3 text-left font-medium">Cliente</th>
                    <th className="px-4 py-3 text-left font-medium">Estado</th>
                    <th className="px-4 py-3 text-left font-medium">Fecha</th>
                    <th className="px-4 py-3 text-right font-medium">Total</th>
                    <th className="px-4 py-3 text-right font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="border-b"><td colSpan={6} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td></tr>
                  )) : invoices.length === 0 ? (
                    <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">No hay facturas.</td></tr>
                  ) : invoices.map(inv => (
                    <tr key={inv._id} className="border-b last:border-0 hover:bg-muted/20">
                      <td className="px-4 py-3 font-mono text-xs">{inv.number || '—'}</td>
                      <td className="px-4 py-3">{clientName(inv.clientId)}</td>
                      <td className="px-4 py-3"><Badge variant={STATUS_VARIANTS[inv.status]}>{STATUS_LABELS[inv.status]}</Badge></td>
                      <td className="px-4 py-3 text-muted-foreground">{new Date(inv.issueDate).toLocaleDateString('es-AR')}</td>
                      <td className="px-4 py-3 text-right font-medium">{inv.currency} {inv.total.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(inv)}><Pencil className="size-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(inv)}><Trash2 className="size-4 text-destructive" /></Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
        ))}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-4">
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1 || loading}>
              Anterior
            </Button>
            <span className="text-sm text-muted-foreground">Página {page} de {totalPages}</span>
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages || loading}>
              Siguiente
            </Button>
          </div>
        )}
      </Tabs>

      {/* Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader><SheetTitle>{editing ? 'Editar factura' : 'Nueva factura'}</SheetTitle></SheetHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="type" render={({ field }) => (
                  <FormItem><FormLabel>Tipo</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent><SelectItem value="income">Ingreso</SelectItem><SelectItem value="expense">Gasto</SelectItem></SelectContent>
                    </Select></FormItem>
                )} />
                <FormField control={form.control} name="number" render={({ field }) => (
                  <FormItem><FormLabel>Número</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                )} />
              </div>
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
                <FormField control={form.control} name="issueDate" render={({ field }) => (
                  <FormItem><FormLabel>Fecha emisión</FormLabel><FormControl><Input type="date" {...field} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="dueDate" render={({ field }) => (
                  <FormItem><FormLabel>Fecha vencimiento</FormLabel><FormControl><Input type="date" {...field} /></FormControl></FormItem>
                )} />
              </div>
              <FormField control={form.control} name="status" render={({ field }) => (
                <FormItem><FormLabel>Estado</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>{Object.entries(STATUS_LABELS).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent>
                  </Select></FormItem>
              )} />

              {/* Items */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Ítems</p>
                  <Button type="button" variant="outline" size="sm" onClick={() => append({ description: '', quantity: 1, unitPrice: 0, amount: 0 })}>
                    <Plus className="mr-1 size-3" />Agregar
                  </Button>
                </div>
                {fields.map((f, i) => (
                  <div key={f.id} className="grid grid-cols-[1fr_80px_80px_80px_32px] gap-2 items-end">
                    <FormField control={form.control} name={`items.${i}.description`} render={({ field }) => (
                      <FormItem><FormLabel className={i > 0 ? 'sr-only' : ''}>Descripción</FormLabel><FormControl><Input placeholder="Descripción" {...field} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name={`items.${i}.quantity`} render={({ field }) => (
                      <FormItem><FormLabel className={i > 0 ? 'sr-only' : ''}>Cant.</FormLabel><FormControl><Input type="number" {...field} onChange={e => { field.onChange(+e.target.value); const u = form.getValues(`items.${i}.unitPrice`) ?? 0; form.setValue(`items.${i}.amount`, +e.target.value * u) }} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name={`items.${i}.unitPrice`} render={({ field }) => (
                      <FormItem><FormLabel className={i > 0 ? 'sr-only' : ''}>P. unit</FormLabel><FormControl><Input type="number" {...field} onChange={e => { field.onChange(+e.target.value); const q = form.getValues(`items.${i}.quantity`) ?? 0; form.setValue(`items.${i}.amount`, q * +e.target.value) }} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name={`items.${i}.amount`} render={({ field }) => (
                      <FormItem><FormLabel className={i > 0 ? 'sr-only' : ''}>Total</FormLabel><FormControl><Input type="number" readOnly {...field} className="bg-muted/30" /></FormControl></FormItem>
                    )} />
                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(i)}><Trash2 className="size-4 text-destructive" /></Button>
                  </div>
                ))}
              </div>

              {/* Totales */}
              {fields.length > 0 && (
                <div className="rounded-lg border bg-muted/20 p-3 space-y-1 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                  <FormField control={form.control} name="taxRate" render={({ field }) => (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-muted-foreground">IVA (%)</span>
                      <Input type="number" className="w-20 h-7 text-right" {...field} onChange={e => field.onChange(+e.target.value)} />
                    </div>
                  )} />
                  <div className="flex justify-between"><span className="text-muted-foreground">Impuesto</span><span>${taxAmount.toFixed(2)}</span></div>
                  <div className="flex justify-between font-semibold"><span>Total</span><span>${total.toFixed(2)}</span></div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="currency" render={({ field }) => (
                  <FormItem><FormLabel>Moneda</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                )} />
              </div>
              <FormField control={form.control} name="notes" render={({ field }) => (
                <FormItem><FormLabel>Notas</FormLabel><FormControl><textarea className="w-full rounded-md border px-3 py-2 text-sm" rows={2} {...field} /></FormControl></FormItem>
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
          <AlertDialogHeader><AlertDialogTitle>¿Eliminar factura?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer fácilmente.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
