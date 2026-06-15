'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, CheckCheck, Info, AlertTriangle, CheckCircle, XCircle, Trash2 } from 'lucide-react'
import { deleteNotification, getNotifications, markAllAsRead, markAsRead } from '@/lib/api/notifications'
import type { Notification } from '@/types/notifications'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'

const TYPE_ICON = {
  info: <Info className="size-4 text-blue-500" />,
  warning: <AlertTriangle className="size-4 text-yellow-500" />,
  success: <CheckCircle className="size-4 text-green-500" />,
  error: <XCircle className="size-4 text-red-500" />,
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'ahora'
  if (mins < 60) return `hace ${mins} min`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `hace ${hrs} h`
  const days = Math.floor(hrs / 24)
  return `hace ${days} d`
}

const PAGE_SIZE = 20

export default function NotificationsPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [all, setAll] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [deleteTarget, setDeleteTarget] = useState<Notification | null>(null)

  const load = useCallback(async (p: number = 1) => {
    setLoading(true)
    try {
      const res = await getNotifications({ limit: PAGE_SIZE, page: p })
      setAll(res.data)
      setTotalPages(res.totalPages ?? 1)
    } catch {
      toast({ title: 'Error al cargar notificaciones', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => { load(page) }, [load, page])

  const handleClick = async (n: Notification) => {
    if (!n.isRead) {
      await markAsRead(n._id).catch(() => null)
      setAll(prev => prev.map(x => x._id === n._id ? { ...x, isRead: true } : x))
    }
    if (n.link) router.push(n.link)
  }

  const handleMarkAll = async () => {
    try {
      await markAllAsRead()
      setAll(prev => prev.map(x => ({ ...x, isRead: true })))
      toast({ title: 'Todas marcadas como leídas' })
    } catch {
      toast({ title: 'Error', variant: 'destructive' })
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteNotification(deleteTarget._id)
      setAll(prev => prev.filter(x => x._id !== deleteTarget._id))
      setDeleteTarget(null)
      toast({ title: 'Notificación eliminada' })
    } catch {
      toast({ title: 'Error al eliminar', variant: 'destructive' })
    }
  }

  const unread = all.filter(n => !n.isRead)

  const NotificationList = ({ items }: { items: Notification[] }) => {
    if (loading) return (
      <div className="flex flex-col gap-2 p-4">
        {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
      </div>
    )
    if (items.length === 0) return (
      <div className="flex flex-col items-center gap-2 py-16 text-muted-foreground">
        <Bell className="size-8 opacity-30" />
        <p>No hay notificaciones</p>
      </div>
    )
    return (
      <ul className="divide-y">
        {items.map(n => (
          <li
            key={n._id}
            className="flex cursor-pointer items-start gap-3 px-4 py-3 hover:bg-muted/30 transition-colors"
            onClick={() => handleClick(n)}
          >
            <div className="mt-0.5 shrink-0">{TYPE_ICON[n.type]}</div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm ${!n.isRead ? 'font-semibold' : 'font-normal'}`}>{n.title}</p>
              <p className="text-xs text-muted-foreground line-clamp-2">{n.message}</p>
              <p className="mt-1 text-xs text-muted-foreground">{timeAgo(n.createdAt)}</p>
            </div>
            {!n.isRead && <span className="mt-2 size-2 shrink-0 rounded-full bg-blue-500" />}
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0"
              onClick={e => { e.stopPropagation(); setDeleteTarget(n) }}
            >
              <Trash2 className="size-4 text-muted-foreground" />
            </Button>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="size-5" />
          <h1 className="text-xl font-semibold">Notificaciones</h1>
          {unread.length > 0 && (
            <span className="rounded-full bg-blue-500 px-2 py-0.5 text-xs font-medium text-white">
              {unread.length}
            </span>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={handleMarkAll} disabled={unread.length === 0}>
          <CheckCheck className="mr-2 size-4" />
          Marcar todas como leídas
        </Button>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">Todas ({all.length})</TabsTrigger>
          <TabsTrigger value="unread">No leídas ({unread.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-4 rounded-lg border">
          <NotificationList items={all} />
        </TabsContent>
        <TabsContent value="unread" className="mt-4 rounded-lg border">
          <NotificationList items={unread} />
        </TabsContent>
      </Tabs>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1 || loading}>
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground">Página {page} de {totalPages}</span>
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages || loading}>
            Siguiente
          </Button>
        </div>
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar notificación?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
