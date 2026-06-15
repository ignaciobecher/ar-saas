'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  User,
  Settings,
  LogOut,
  Building2,
  FileText,
  TrendingUp,
  CheckSquare,
  CalendarDays,
  Bell,
} from 'lucide-react'
import { siteConfig } from '@/config/site'
import { useAuth } from '@/lib/hooks/use-auth'
import { useUnreadNotifications } from '@/lib/hooks/use-unread-notifications'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Clientes', href: '/clients', icon: Building2 },
  { label: 'Facturas', href: '/invoices', icon: FileText },
  { label: 'Pipeline', href: '/pipeline', icon: TrendingUp },
  { label: 'Tareas', href: '/tasks', icon: CheckSquare },
  { label: 'Planner', href: '/planner', icon: CalendarDays },
  { label: 'Notificaciones', href: '/notifications', icon: Bell, badge: true },
  { label: 'Perfil', href: '/profile', icon: User },
  { label: 'Ajustes', href: '/settings', icon: Settings },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const { logout } = useAuth()
  const unreadCount = useUnreadNotifications()

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r bg-card">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/" className="text-sm font-bold tracking-tight">
          {siteConfig.name}
        </Link>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navItems.map(({ label, href, icon: Icon, badge }) => (
          <Button
            key={href}
            asChild
            variant={pathname === href ? 'secondary' : 'ghost'}
            className={cn(
              'w-full justify-start',
              pathname === href && 'font-medium',
            )}
          >
            <Link href={href}>
              <Icon className="mr-2 size-4 shrink-0" />
              <span className="flex-1 truncate">{label}</span>
              {badge && unreadCount > 0 && (
                <span className="ml-auto rounded-full bg-blue-500 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Link>
          </Button>
        ))}
      </nav>

      <div className="p-3">
        <Separator className="mb-3" />
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-foreground"
          onClick={logout}
        >
          <LogOut className="mr-2 size-4" />
          Cerrar sesión
        </Button>
      </div>
    </aside>
  )
}
