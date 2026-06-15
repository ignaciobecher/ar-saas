'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { useAuth } from '@/lib/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { GitHubButton } from '@/components/auth/github-button'

interface RegisterForm {
  name: string
  email: string
  password: string
  terms: boolean
}

export default function RegisterPage() {
  const { register } = useAuth()
  const [success, setSuccess] = useState(false)
  const [apiError, setApiError] = useState('')

  const form = useForm<RegisterForm>({
    defaultValues: { name: '', email: '', password: '', terms: false },
  })

  async function onSubmit(data: RegisterForm) {
    setApiError('')
    try {
      await register(data.name, data.email, data.password)
      setSuccess(true)
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : (err as { message?: string })?.message ?? 'Error al crear la cuenta'
      setApiError(msg)
    }
  }

  if (success) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>¡Revisá tu email!</CardTitle>
          <CardDescription>
            Te enviamos un link de verificación. Hacé click en el link para activar tu cuenta.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Crear cuenta</CardTitle>
        <CardDescription>Completá tus datos para empezar</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              rules={{
                required: 'El nombre es requerido',
                minLength: { value: 2, message: 'Mínimo 2 caracteres' },
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Juan Pérez" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                    <Input type="email" placeholder="juan@empresa.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              rules={{
                required: 'La contraseña es requerida',
                minLength: { value: 8, message: 'Mínimo 8 caracteres' },
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contraseña</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Mínimo 8 caracteres" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="terms"
              rules={{ validate: (v) => v || 'Debés aceptar los términos para continuar' }}
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm font-normal">
                      Acepto los{' '}
                      <Link href="/terms" target="_blank" className="underline underline-offset-4 hover:text-foreground">
                        Términos y Condiciones
                      </Link>{' '}
                      y la{' '}
                      <Link href="/privacy" target="_blank" className="underline underline-offset-4 hover:text-foreground">
                        Política de Privacidad
                      </Link>
                    </FormLabel>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            {apiError && <p className="text-sm text-destructive">{apiError}</p>}
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
            </Button>
          </form>
        </Form>
        <div className="mt-4 space-y-3">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">o continuá con</span>
            </div>
          </div>
          <GitHubButton />
        </div>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          ¿Ya tenés cuenta?{' '}
          <Link href="/login" className="underline underline-offset-4 hover:text-foreground">
            Iniciá sesión
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
