'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/use-auth'
import { siteConfig } from '@/config/site'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/dashboard')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/40">
        <div className="text-sm text-muted-foreground">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/40 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight">{siteConfig.name}</h1>
        <p className="text-sm text-muted-foreground mt-1">{siteConfig.tagline}</p>
      </div>
      <div className="w-full max-w-md">{children}</div>
    </div>
  )
}
