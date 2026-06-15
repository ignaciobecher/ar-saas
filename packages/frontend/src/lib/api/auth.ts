import apiClient from './client'
import type { User } from '@/types/auth'

export const authApi = {
  register(data: { name: string; email: string; password: string }) {
    return apiClient.post<never, { message: string }>('/api/auth/register', data)
  },

  login(data: { email: string; password: string }) {
    return apiClient.post<never, User>('/api/auth/login', data)
  },

  logout() {
    return apiClient.post<never, { message: string }>('/api/auth/logout')
  },

  refresh() {
    return apiClient.post<never, { message: string }>('/api/auth/refresh')
  },

  verifyEmail(token: string) {
    return apiClient.get<never, { message: string }>(`/api/auth/verify-email?token=${token}`)
  },

  forgotPassword(email: string) {
    return apiClient.post<never, { message: string }>('/api/auth/forgot-password', { email })
  },

  resetPassword(token: string, newPassword: string) {
    return apiClient.post<never, { message: string }>('/api/auth/reset-password', {
      token,
      newPassword,
    })
  },

  getMe() {
    return apiClient.get<never, User>('/api/auth/me')
  },

  exchangeGithubCode(code: string) {
    return apiClient.post<never, { success: boolean; alreadyExisted: boolean }>(
      '/api/auth/github/exchange',
      { code },
    )
  },
}
