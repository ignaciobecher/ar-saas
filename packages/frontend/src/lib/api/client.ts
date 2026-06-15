import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import type { ApiError } from '@/types/api'

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000',
  withCredentials: true,
})

let isRefreshing = false
let failedQueue: Array<{
  resolve: (value: unknown) => void
  reject: (reason?: unknown) => void
}> = []

function processQueue(error: unknown) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error)
    } else {
      resolve(undefined)
    }
  })
  failedQueue = []
}

apiClient.interceptors.response.use(
  (response) => response.data,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error.response?.data ?? error)
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      })
        .then(() => apiClient(originalRequest))
        .catch((err) => Promise.reject(err))
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'}/api/auth/refresh`,
        {},
        { withCredentials: true },
      )
      processQueue(null)
      return apiClient(originalRequest)
    } catch (refreshError) {
      processQueue(refreshError)
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.replace('/login')
      }
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)

export default apiClient
