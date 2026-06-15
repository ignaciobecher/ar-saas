'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { authApi } from '@/lib/api/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

type Status = 'loading' | 'success' | 'error' | 'no-token'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<Status>(token ? 'loading' : 'no-token')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) return
    authApi
      .verifyEmail(token)
      .then(() => setStatus('success'))
      .catch((err: unknown) => {
        const msg = (err as { message?: string })?.message ?? 'Error al verificar el email'
        setError(msg)
        setStatus('error')
      })
  }, [token])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verificación de email</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {status === 'loading' && (
          <CardDescription>Verificando tu email...</CardDescription>
        )}
        {status === 'success' && (
          <>
            <CardDescription>
              ✓ Email verificado correctamente. Ya podés iniciar sesión.
            </CardDescription>
            <Button asChild className="w-full">
              <Link href="/login">Ir al inicio de sesión</Link>
            </Button>
          </>
        )}
        {status === 'error' && (
          <>
            <CardDescription className="text-destructive">{error}</CardDescription>
            <Button asChild variant="outline" className="w-full">
              <Link href="/login">Volver al inicio de sesión</Link>
            </Button>
          </>
        )}
        {status === 'no-token' && (
          <>
            <CardDescription className="text-destructive">
              Link de verificación inválido o faltante.
            </CardDescription>
            <Button asChild variant="outline" className="w-full">
              <Link href="/login">Volver al inicio de sesión</Link>
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<Card><CardHeader><CardTitle>Verificando...</CardTitle></CardHeader></Card>}>
      <VerifyEmailContent />
    </Suspense>
  )
}
