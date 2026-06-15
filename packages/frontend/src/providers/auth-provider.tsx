'use client'

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authApi } from '@/lib/api/auth'
import type { AuthState, User } from '@/types/auth'

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  register: (name: string, email: string, password: string) => Promise<{ message: string }>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  })

  useEffect(() => {
    authApi
      .getMe()
      .then((user: User) => setState({ user, isLoading: false, isAuthenticated: true }))
      .catch(() => setState({ user: null, isLoading: false, isAuthenticated: false }))
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const user = await authApi.login({ email, password })
    setState({ user, isLoading: false, isAuthenticated: true })
    router.push('/dashboard')
  }, [router])

  const logout = useCallback(async () => {
    await authApi.logout()
    setState({ user: null, isLoading: false, isAuthenticated: false })
    router.push('/login')
  }, [router])

  const register = useCallback(
    (name: string, email: string, password: string) =>
      authApi.register({ name, email, password }),
    [],
  )

  const refreshUser = useCallback(async () => {
    const user = await authApi.getMe()
    setState({ user, isLoading: false, isAuthenticated: true })
  }, [])

  return (
    <AuthContext.Provider value={{ ...state, login, logout, register, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
