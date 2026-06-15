'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { authApi } from '@/lib/api/auth'
import { useAuth } from '@/lib/hooks/use-auth'

type Status = 'loading' | 'error'

function GithubCallbackInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { refreshUser } = useAuth()
  const [status, setStatus] = useState<Status>('loading')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (error || !code) {
      setErrorMsg('No pudimos completar el inicio de sesión con GitHub. Intentá de nuevo.')
      setStatus('error')
      return
    }

    authApi
      .exchangeGithubCode(code)
      .then(() => refreshUser())
      .then(() => router.replace('/dashboard'))
      .catch(() => {
        setErrorMsg('El código expiró o es inválido. Intentá iniciar sesión nuevamente.')
        setStatus('error')
      })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (status === 'error') {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="max-w-sm space-y-4 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10">
            <svg className="size-6 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-lg font-semibold">Error al autenticar</h1>
          <p className="text-sm text-muted-foreground">{errorMsg}</p>
          <button
            onClick={() => router.replace('/login')}
            className="text-sm underline underline-offset-4 hover:text-foreground text-muted-foreground"
          >
            Volver al login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="space-y-4 text-center">
        <div className="mx-auto size-8 animate-spin rounded-full border-4 border-muted border-t-foreground" />
        <p className="text-sm text-muted-foreground">Autenticando con GitHub...</p>
      </div>
    </div>
  )
}

export default function GithubCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="space-y-4 text-center">
          <div className="mx-auto size-8 animate-spin rounded-full border-4 border-muted border-t-foreground" />
          <p className="text-sm text-muted-foreground">Cargando...</p>
        </div>
      </div>
    }>
      <GithubCallbackInner />
    </Suspense>
  )
}
