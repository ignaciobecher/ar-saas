'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { UserPlus, MoreHorizontal, Crown, User } from 'lucide-react'
import { useAuth } from '@/lib/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'U'
}

interface InviteForm {
  email: string
}

export default function TeamPage() {
  const { user } = useAuth()
  const [inviteOpen, setInviteOpen] = useState(false)

  const members = [
    { name: user?.name ?? 'Vos', email: user?.email ?? '', role: 'owner' as const },
  ]

  const form = useForm<InviteForm>({ defaultValues: { email: '' } })

  function onInvite(data: InviteForm) {
    setInviteOpen(false)
    form.reset()
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
        <p className="text-xs text-amber-800 font-medium">Próximamente</p>
        <p className="text-xs text-amber-700 mt-0.5">La gestión de equipo estará disponible en la próxima actualización.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Miembros del equipo</CardTitle>
              <CardDescription>
                Gestioná quién tiene acceso a tu workspace.
              </CardDescription>
            </div>
            <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2" disabled>
                  <UserPlus className="size-4" />
                  Invitar
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invitar miembro</DialogTitle>
                  <DialogDescription>
                    Ingresá el email de la persona que querés agregar al workspace.
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onInvite)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="email"
                      rules={{
                        required: 'El email es requerido',
                        pattern: { value: /\S+@\S+\.\S+/, message: 'Email inválido' },
                      }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="colaborador@empresa.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button type="button" variant="ghost" onClick={() => setInviteOpen(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit" disabled>
                        Próximamente
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {members.map((member) => (
              <div
                key={member.email}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="size-8">
                    <AvatarFallback className="text-xs">{getInitials(member.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{member.name}</p>
                    <p className="text-xs text-muted-foreground">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={member.role === 'owner' ? 'default' : 'secondary'} className="gap-1 text-xs">
                    {member.role === 'owner' ? (
                      <><Crown className="size-3" /> Owner</>
                    ) : (
                      <><User className="size-3" /> Miembro</>
                    )}
                  </Badge>
                  {member.role !== 'owner' && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="size-7 p-0">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="text-destructive focus:text-destructive">
                          Eliminar miembro
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pending invitations placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Invitaciones pendientes</CardTitle>
          <CardDescription>Invitaciones enviadas que aún no fueron aceptadas.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No hay invitaciones pendientes.</p>
        </CardContent>
      </Card>
    </div>
  )
}
