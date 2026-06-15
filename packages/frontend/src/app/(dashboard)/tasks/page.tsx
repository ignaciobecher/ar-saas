'use client'

import { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { CheckSquare, Plus, Trash2, X } from 'lucide-react'
import { createTaskColumn as createColumn, deleteTaskColumn as deleteColumn, getTaskColumns as getColumns } from '@/lib/api/task-columns'
import { createTask, deleteTask, getTask, getTasks, moveTask, updateTask } from '@/lib/api/tasks'
import type { TaskColumn } from '@/types/tasks'
import type { Task, CreateTaskDto } from '@/types/tasks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'

const PRIORITY_COLORS: Record<string, 'secondary' | 'default' | 'destructive' | 'outline'> = {
  low: 'secondary', medium: 'default', high: 'destructive', urgent: 'destructive',
}
const PRIORITY_LABELS: Record<string, string> = {
  low: 'Baja', medium: 'Media', high: 'Alta', urgent: 'Urgente',
}

export default function TasksPage() {
  const { toast } = useToast()
  const [columns, setColumns] = useState<TaskColumn[]>([])
  const [tasksByColumn, setTasksByColumn] = useState<Record<string, Task[]>>({})
  const [loading, setLoading] = useState(true)
  const [newColName, setNewColName] = useState('')
  const [addingCol, setAddingCol] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'col' | 'task'; id: string; name: string } | null>(null)
  const [draggingTask, setDraggingTask] = useState<{ id: string; fromCol: string } | null>(null)

  const form = useForm<CreateTaskDto>({
    defaultValues: { title: '', columnId: '', description: '', priority: 'medium', dueDate: '', labels: [], checklist: [] },
  })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const cols = await getColumns()
      setColumns(cols)
      const entries = await Promise.all(
        cols.map(async (col) => {
          const res = await getTasks({ columnId: col._id, limit: 200 })
          return [col._id, res.data] as [string, Task[]]
        })
      )
      setTasksByColumn(Object.fromEntries(entries))
    } catch { toast({ title: 'Error al cargar tareas', variant: 'destructive' }) }
    finally { setLoading(false) }
  }, [toast])

  useEffect(() => { load() }, [load])

  const handleAddColumn = async () => {
    if (!newColName.trim()) return
    try {
      const col = await createColumn({ name: newColName.trim(), order: columns.length })
      setColumns(prev => [...prev, col])
      setTasksByColumn(prev => ({ ...prev, [col._id]: [] }))
      setNewColName('')
      setAddingCol(false)
    } catch { toast({ title: 'Error al crear columna', variant: 'destructive' }) }
  }

  const handleDeleteColumn = async () => {
    if (!deleteTarget || deleteTarget.type !== 'col') return
    try {
      await deleteColumn(deleteTarget.id)
      setColumns(prev => prev.filter(c => c._id !== deleteTarget.id))
      setTasksByColumn(prev => { const n = { ...prev }; delete n[deleteTarget.id]; return n })
      setDeleteTarget(null)
    } catch { toast({ title: 'Error al eliminar columna', variant: 'destructive' }) }
  }

  const handleDeleteTask = async () => {
    if (!deleteTarget || deleteTarget.type !== 'task') return
    try {
      await deleteTask(deleteTarget.id)
      setTasksByColumn(prev => {
        const n = { ...prev }
        for (const colId of Object.keys(n)) n[colId] = n[colId].filter(t => t._id !== deleteTarget.id)
        return n
      })
      setDeleteTarget(null)
      if (selectedTask?._id === deleteTarget.id) { setSelectedTask(null); setSheetOpen(false) }
    } catch { toast({ title: 'Error al eliminar tarea', variant: 'destructive' }) }
  }

  const openTask = async (task: Task) => {
    try {
      const full = await getTask(task._id)
      setSelectedTask(full)
      form.reset({ title: full.title, columnId: full.columnId ?? '', description: full.description ?? '', priority: full.priority ?? 'medium', dueDate: full.dueDate?.split('T')[0] ?? '', labels: full.labels ?? [], checklist: full.checklist ?? [] })
      setSheetOpen(true)
    } catch { toast({ title: 'Error', variant: 'destructive' }) }
  }

  const openCreate = (columnId: string) => {
    setSelectedTask(null)
    form.reset({ title: '', columnId, description: '', priority: 'medium', dueDate: '', labels: [], checklist: [] })
    setSheetOpen(true)
  }

  const onSubmit = async (data: CreateTaskDto) => {
    try {
      if (selectedTask) {
        const updated = await updateTask(selectedTask._id, data)
        setTasksByColumn(prev => {
          const n = { ...prev }
          for (const colId of Object.keys(n)) n[colId] = n[colId].map(t => t._id === selectedTask._id ? updated : t)
          return n
        })
        toast({ title: 'Tarea actualizada' })
      } else {
        const task = await createTask(data)
        const colId = data.columnId ?? ''
        if (colId) setTasksByColumn(prev => ({ ...prev, [colId]: [...(prev[colId] ?? []), task] }))
        toast({ title: 'Tarea creada' })
      }
      setSheetOpen(false)
    } catch { toast({ title: 'Error al guardar', variant: 'destructive' }) }
  }

  const handleDrop = async (e: React.DragEvent, targetCol: string) => {
    e.preventDefault()
    if (!draggingTask || draggingTask.fromCol === targetCol) return
    const { id, fromCol } = draggingTask
    const task = tasksByColumn[fromCol]?.find(t => t._id === id)
    if (!task) return
    setTasksByColumn(prev => ({
      ...prev,
      [fromCol]: prev[fromCol].filter(t => t._id !== id),
      [targetCol]: [...(prev[targetCol] ?? []), { ...task, columnId: targetCol }],
    }))
    try {
      await moveTask(id, { columnId: targetCol })
    } catch {
      toast({ title: 'Error al mover tarea', variant: 'destructive' })
      load()
    }
    setDraggingTask(null)
  }

  const toggleCheckItem = async (taskId: string, checklist: Task['checklist']) => {
    try {
      const updated = await updateTask(taskId, { checklist } as Partial<CreateTaskDto>)
      setTasksByColumn(prev => {
        const n = { ...prev }
        for (const colId of Object.keys(n)) n[colId] = n[colId].map(t => t._id === taskId ? updated : t)
        return n
      })
      setSelectedTask(updated)
    } catch { toast({ title: 'Error', variant: 'destructive' }) }
  }

  const checklistFields = form.watch('checklist') ?? []

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckSquare className="size-5" />
          <h1 className="text-xl font-semibold">Tareas</h1>
        </div>
      </div>

      {loading ? (
        <div className="flex gap-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-64 w-64 shrink-0 rounded-xl" />)}
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map(col => (
            <div
              key={col._id}
              className="flex flex-col gap-2 rounded-xl bg-muted/30 p-3 w-64 shrink-0 min-h-[200px]"
              onDragOver={e => e.preventDefault()}
              onDrop={e => handleDrop(e, col._id)}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold">{col.name}</span>
                <div className="flex gap-1">
                  <span className="text-xs text-muted-foreground">{(tasksByColumn[col._id] ?? []).length}</span>
                  <Button variant="ghost" size="icon" className="size-5" onClick={() => setDeleteTarget({ type: 'col', id: col._id, name: col.name })}>
                    <X className="size-3 text-muted-foreground" />
                  </Button>
                </div>
              </div>

              {(tasksByColumn[col._id] ?? []).map(task => {
                const done = (task.checklist ?? []).filter(i => i.completed).length
                const total = (task.checklist ?? []).length
                return (
                  <div
                    key={task._id}
                    draggable
                    onDragStart={() => setDraggingTask({ id: task._id, fromCol: col._id })}
                    onDragEnd={() => setDraggingTask(null)}
                    className="rounded-lg border bg-card p-3 shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
                    onClick={() => openTask(task)}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <p className="text-sm font-medium line-clamp-2 flex-1">{task.title}</p>
                      <Button variant="ghost" size="icon" className="size-5 shrink-0" onClick={e => { e.stopPropagation(); setDeleteTarget({ type: 'task', id: task._id, name: task.title }) }}>
                        <Trash2 className="size-3 text-destructive" />
                      </Button>
                    </div>
                    {task.priority && (
                      <Badge variant={PRIORITY_COLORS[task.priority]} className="mt-1 text-xs">
                        {PRIORITY_LABELS[task.priority]}
                      </Badge>
                    )}
                    {total > 0 && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                          <span>Checklist</span><span>{done}/{total}</span>
                        </div>
                        <div className="h-1 rounded-full bg-muted">
                          <div className="h-1 rounded-full bg-primary transition-all" style={{ width: `${total > 0 ? (done / total) * 100 : 0}%` }} />
                        </div>
                      </div>
                    )}
                    {task.dueDate && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Vence: {new Date(task.dueDate).toLocaleDateString('es-AR')}
                      </p>
                    )}
                  </div>
                )
              })}

              <Button variant="ghost" size="sm" className="mt-auto text-xs text-muted-foreground" onClick={() => openCreate(col._id)}>
                <Plus className="mr-1 size-3" />Nueva tarea
              </Button>
            </div>
          ))}

          {/* Agregar columna */}
          <div className="w-56 shrink-0">
            {addingCol ? (
              <div className="rounded-xl border bg-card p-3 flex flex-col gap-2">
                <Input placeholder="Nombre de la columna" value={newColName} onChange={e => setNewColName(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleAddColumn(); if (e.key === 'Escape') setAddingCol(false) }} autoFocus />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleAddColumn}>Crear</Button>
                  <Button size="sm" variant="outline" onClick={() => setAddingCol(false)}>Cancelar</Button>
                </div>
              </div>
            ) : (
              <Button variant="outline" className="w-full" onClick={() => setAddingCol(true)}>
                <Plus className="mr-2 size-4" />Columna
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Sheet detalle tarea */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{selectedTask ? 'Detalle de tarea' : 'Nueva tarea'}</SheetTitle>
          </SheetHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-4">
              <FormField control={form.control} name="title" rules={{ required: 'Requerido' }} render={({ field }) => (
                <FormItem><FormLabel>Título *</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
              )} />
              <FormField control={form.control} name="columnId" render={({ field }) => (
                <FormItem><FormLabel>Columna</FormLabel>
                  <Select value={field.value ?? ''} onValueChange={field.onChange}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>{columns.map(c => <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>)}</SelectContent>
                  </Select></FormItem>
              )} />
              <FormField control={form.control} name="priority" render={({ field }) => (
                <FormItem><FormLabel>Prioridad</FormLabel>
                  <Select value={field.value ?? 'medium'} onValueChange={field.onChange}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="low">Baja</SelectItem>
                      <SelectItem value="medium">Media</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                    </SelectContent>
                  </Select></FormItem>
              )} />
              <FormField control={form.control} name="dueDate" render={({ field }) => (
                <FormItem><FormLabel>Fecha límite</FormLabel><FormControl><Input type="date" {...field} /></FormControl></FormItem>
              )} />
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem><FormLabel>Descripción</FormLabel><FormControl>
                  <textarea className="w-full rounded-md border px-3 py-2 text-sm" rows={3} {...field} />
                </FormControl></FormItem>
              )} />

              {/* Checklist */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Checklist</p>
                  <Button type="button" variant="outline" size="sm" onClick={() => {
                    const curr = form.getValues('checklist') ?? []
                    form.setValue('checklist', [...curr, { text: '', completed: false }])
                  }}>
                    <Plus className="mr-1 size-3" />Ítem
                  </Button>
                </div>
                {checklistFields.map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Checkbox
                      checked={item.completed}
                      onCheckedChange={checked => {
                        form.setValue(`checklist.${i}.completed`, !!checked)
                        if (selectedTask) {
                          const curr = form.getValues('checklist') ?? []
                          const updated = curr.map((c, j) => j === i ? { ...c, completed: !!checked } : c)
                          toggleCheckItem(selectedTask._id, updated)
                        }
                      }}
                    />
                    <FormField control={form.control} name={`checklist.${i}.text`} render={({ field }) => (
                      <FormItem className="flex-1"><FormControl><Input className={item.completed ? 'line-through text-muted-foreground' : ''} {...field} /></FormControl></FormItem>
                    )} />
                    <Button type="button" variant="ghost" size="icon" className="size-7" onClick={() => {
                      const curr = form.getValues('checklist') ?? []
                      form.setValue('checklist', curr.filter((_, j) => j !== i))
                    }}><X className="size-3" /></Button>
                  </div>
                ))}
              </div>

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
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar {deleteTarget?.type === 'col' ? 'columna' : 'tarea'}?</AlertDialogTitle>
            <AlertDialogDescription>Se eliminará <strong>{deleteTarget?.name}</strong>.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteTarget?.type === 'col' ? handleDeleteColumn : handleDeleteTask}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
