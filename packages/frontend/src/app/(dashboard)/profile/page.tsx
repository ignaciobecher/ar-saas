'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '@/lib/hooks/use-auth'
import apiClient from '@/lib/api/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

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

interface ProfileForm {
  name: string
  email: string
}

interface PasswordForm {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export default function ProfilePage() {
  const { user } = useAuth()
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [passwordOpen, setPasswordOpen] = useState(false)

  const form = useForm<ProfileForm>({
    values: { name: user?.name ?? '', email: user?.email ?? '' },
  })

  const passwordForm = useForm<PasswordForm>({
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  })

  async function onSaveProfile(data: ProfileForm) {
    setError(null)
    try {
      await apiClient.patch('/api/users/me', data)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg ?? 'Error al guardar el perfil.')
    }
  }

  async function onChangePassword(data: PasswordForm) {
    if (data.newPassword !== data.confirmPassword) {
      passwordForm.setError('confirmPassword', { message: 'Las contraseñas no coinciden' })
      return
    }
    setPasswordOpen(false)
    passwordForm.reset()
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Avatar */}
      <Card>
        <CardHeader>
          <CardTitle>Foto de perfil</CardTitle>
          <CardDescription>Tu avatar se genera automáticamente con tus iniciales.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <Avatar className="size-16">
            <AvatarFallback className="text-lg">
              {user?.name ? getInitials(user.name) : 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{user?.name}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </CardContent>
      </Card>

      {/* Info */}
      <Card>
        <CardHeader>
          <CardTitle>Información personal</CardTitle>
          <CardDescription>Actualizá tu nombre y email de acceso.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSaveProfile)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                rules={{ required: 'El nombre es requerido' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre completo</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                rules={{ required: 'El email es requerido' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {saved ? 'Guardado' : 'Guardar cambios'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle>Seguridad</CardTitle>
          <CardDescription>Gestioná tu contraseña y métodos de acceso.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Contraseña</p>
              <p className="text-xs text-muted-foreground">Última actualización: desconocida</p>
            </div>
            <Dialog open={passwordOpen} onOpenChange={setPasswordOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">Cambiar contraseña</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Cambiar contraseña</DialogTitle>
                  <DialogDescription>
                    Ingresá tu contraseña actual y la nueva para continuar.
                  </DialogDescription>
                </DialogHeader>
                <Form {...passwordForm}>
                  <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-4">
                    <FormField
                      control={passwordForm.control}
                      name="currentPassword"
                      rules={{ required: 'Requerido' }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contraseña actual</FormLabel>
                          <FormControl><Input type="password" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={passwordForm.control}
                      name="newPassword"
                      rules={{ required: 'Requerido', minLength: { value: 8, message: 'Mínimo 8 caracteres' } }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nueva contraseña</FormLabel>
                          <FormControl><Input type="password" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={passwordForm.control}
                      name="confirmPassword"
                      rules={{ required: 'Requerido' }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirmar contraseña</FormLabel>
                          <FormControl><Input type="password" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button type="button" variant="ghost" onClick={() => setPasswordOpen(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={passwordForm.formState.isSubmitting}>
                        Guardar
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Eliminar cuenta</p>
              <p className="text-xs text-muted-foreground">
                Esta acción es permanente e irreversible.
              </p>
            </div>
            <Button variant="destructive" size="sm" disabled>
              Eliminar cuenta
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
