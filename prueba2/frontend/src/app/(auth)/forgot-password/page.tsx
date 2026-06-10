'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { authApi } from '@/lib/api/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'

interface ForgotPasswordForm {
  email: string
}

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)

  const form = useForm<ForgotPasswordForm>({
    defaultValues: { email: '' },
  })

  async function onSubmit(data: ForgotPasswordForm) {
    await authApi.forgotPassword(data.email).catch(() => null)
    setSent(true)
  }

  if (sent) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Revisá tu email</CardTitle>
          <CardDescription>
            Si el email está registrado, te enviamos un link para restablecer tu contraseña.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline" className="w-full">
            <Link href="/login">Volver al inicio de sesión</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Olvidé mi contraseña</CardTitle>
        <CardDescription>
          Ingresá tu email y te enviamos el link de restablecimiento.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              rules={{ required: 'El email es requerido', pattern: { value: /\S+@\S+\.\S+/, message: 'Email inválido' } }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="juan@empresa.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Enviando...' : 'Enviar link de restablecimiento'}
            </Button>
          </form>
        </Form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          <Link href="/login" className="underline underline-offset-4 hover:text-foreground">
            Volver al inicio de sesión
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
