'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Settings, User, Lock, Building2 } from 'lucide-react'
import apiClient from '@/lib/api/client'
import { useAuth } from '@/lib/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'

interface ProfileForm {
  name: string
  phone: string
}

interface WorkspaceForm {
  name: string
}

interface PasswordForm {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export default function SettingsPage() {
  const { toast } = useToast()
  const { user, refreshUser } = useAuth()

  const profileForm = useForm<ProfileForm>({
    defaultValues: { name: '', phone: '' },
  })

  const workspaceForm = useForm<WorkspaceForm>({
    defaultValues: { name: '' },
  })

  const passwordForm = useForm<PasswordForm>({
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  })

  useEffect(() => {
    if (user) {
      profileForm.reset({ name: user.name ?? '', phone: user.phone ?? '' })
    }
  }, [user, profileForm])

  useEffect(() => {
    const fetchWorkspace = async () => {
      try {
        const ws = await apiClient.get('/api/workspaces/me') as { name: string }
        workspaceForm.reset({ name: ws.name ?? '' })
      } catch { /* workspace may not exist yet */ }
    }
    fetchWorkspace()
  }, [workspaceForm])

  const onProfileSubmit = async (data: ProfileForm) => {
    try {
      await apiClient.patch('/api/users/me', data)
      await refreshUser()
      toast({ title: 'Perfil actualizado' })
    } catch {
      toast({ title: 'Error al actualizar perfil', variant: 'destructive' })
    }
  }

  const onWorkspaceSubmit = async (data: WorkspaceForm) => {
    try {
      await apiClient.patch('/api/workspaces/me', data)
      toast({ title: 'Workspace actualizado' })
    } catch {
      toast({ title: 'Error al actualizar workspace', variant: 'destructive' })
    }
  }

  const onPasswordSubmit = async (data: PasswordForm) => {
    if (data.newPassword !== data.confirmPassword) {
      passwordForm.setError('confirmPassword', { message: 'Las contraseñas no coinciden' })
      return
    }
    try {
      await apiClient.patch('/api/users/me', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      })
      passwordForm.reset()
      toast({ title: 'Contraseña actualizada' })
    } catch {
      toast({ title: 'Error al cambiar contraseña', variant: 'destructive' })
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-2xl">
      <div className="flex items-center gap-2">
        <Settings className="size-5" />
        <h1 className="text-xl font-semibold">Configuración</h1>
      </div>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">
            <User className="mr-2 size-4" />Perfil
          </TabsTrigger>
          <TabsTrigger value="security">
            <Lock className="mr-2 size-4" />Seguridad
          </TabsTrigger>
          <TabsTrigger value="workspace">
            <Building2 className="mr-2 size-4" />Workspace
          </TabsTrigger>
        </TabsList>

        {/* Perfil */}
        <TabsContent value="profile" className="mt-6">
          <div className="rounded-xl border p-6">
            <h2 className="text-base font-semibold mb-4">Información de perfil</h2>
            <Form {...profileForm}>
              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="flex flex-col gap-4">
                <FormField control={profileForm.control} name="name" rules={{ required: 'El nombre es obligatorio' }} render={({ field }) => (
                  <FormItem><FormLabel>Nombre</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <Input value={user?.email ?? ''} readOnly className="bg-muted/40 cursor-not-allowed" />
                  <p className="text-xs text-muted-foreground">El email no se puede modificar.</p>
                </FormItem>
                <FormField control={profileForm.control} name="phone" render={({ field }) => (
                  <FormItem><FormLabel>Teléfono</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                )} />
                <div className="flex justify-end">
                  <Button type="submit" disabled={profileForm.formState.isSubmitting}>
                    {profileForm.formState.isSubmitting ? 'Guardando...' : 'Guardar cambios'}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </TabsContent>

        {/* Seguridad */}
        <TabsContent value="security" className="mt-6">
          <div className="rounded-xl border p-6">
            <h2 className="text-base font-semibold mb-4">Cambiar contraseña</h2>
            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="flex flex-col gap-4">
                <FormField control={passwordForm.control} name="currentPassword" rules={{ required: 'Requerida' }} render={({ field }) => (
                  <FormItem><FormLabel>Contraseña actual</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <Separator />
                <FormField control={passwordForm.control} name="newPassword" rules={{ required: 'Requerida', minLength: { value: 8, message: 'Mínimo 8 caracteres' } }} render={({ field }) => (
                  <FormItem><FormLabel>Nueva contraseña</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={passwordForm.control} name="confirmPassword" rules={{ required: 'Requerida' }} render={({ field }) => (
                  <FormItem><FormLabel>Confirmar contraseña</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <div className="flex justify-end">
                  <Button type="submit" disabled={passwordForm.formState.isSubmitting}>
                    {passwordForm.formState.isSubmitting ? 'Actualizando...' : 'Cambiar contraseña'}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </TabsContent>

        {/* Workspace */}
        <TabsContent value="workspace" className="mt-6">
          <div className="rounded-xl border p-6">
            <h2 className="text-base font-semibold mb-4">Configuración del workspace</h2>
            <Form {...workspaceForm}>
              <form onSubmit={workspaceForm.handleSubmit(onWorkspaceSubmit)} className="flex flex-col gap-4">
                <FormField control={workspaceForm.control} name="name" rules={{ required: 'El nombre es obligatorio' }} render={({ field }) => (
                  <FormItem><FormLabel>Nombre del workspace</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <div className="flex justify-end">
                  <Button type="submit" disabled={workspaceForm.formState.isSubmitting}>
                    {workspaceForm.formState.isSubmitting ? 'Guardando...' : 'Guardar cambios'}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
