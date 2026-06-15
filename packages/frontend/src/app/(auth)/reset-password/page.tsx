'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { authApi } from '@/lib/api/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'

interface ResetPasswordForm {
  newPassword: string
  confirmPassword: string
}

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [apiError, setApiError] = useState('')

  const form = useForm<ResetPasswordForm>({
    defaultValues: { newPassword: '', confirmPassword: '' },
  })

  async function onSubmit(data: ResetPasswordForm) {
    if (!token) {
      setApiError('Token inválido o faltante.')
      return
    }
    setApiError('')
    try {
      await authApi.resetPassword(token, data.newPassword)
      router.push('/login')
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? 'Error al restablecer la contraseña'
      setApiError(msg)
    }
  }

  if (!token) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Link inválido</CardTitle>
          <CardDescription>El link de restablecimiento es inválido o expiró.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline" className="w-full">
            <Link href="/forgot-password">Solicitar nuevo link</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nueva contraseña</CardTitle>
        <CardDescription>Elegí una nueva contraseña para tu cuenta.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="newPassword"
              rules={{
                required: 'La contraseña es requerida',
                minLength: { value: 8, message: 'Mínimo 8 caracteres' },
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nueva contraseña</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Mínimo 8 caracteres" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              rules={{
                required: 'Confirmá la contraseña',
                validate: (val) =>
                  val === form.getValues('newPassword') || 'Las contraseñas no coinciden',
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmar contraseña</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Repetí la contraseña" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {apiError && <p className="text-sm text-destructive">{apiError}</p>}
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Guardando...' : 'Guardar nueva contraseña'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<Card><CardHeader><CardTitle>Cargando...</CardTitle></CardHeader></Card>}>
      <ResetPasswordContent />
    </Suspense>
  )
}
