import apiClient from '@/lib/api/client'
import type { CreateNotificationDto, Notification, QueryNotificationDto } from '@/types/notifications'
import type { PaginatedResult } from '@/types/clients'

export const getNotifications = (params?: QueryNotificationDto): Promise<PaginatedResult<Notification>> =>
  apiClient.get('/api/notifications', { params }) as Promise<PaginatedResult<Notification>>

export const getNotification = (id: string): Promise<Notification> =>
  apiClient.get(`/api/notifications/${id}`) as Promise<Notification>

export const createNotification = (dto: CreateNotificationDto): Promise<Notification> =>
  apiClient.post('/api/notifications', dto) as Promise<Notification>

export const markAsRead = (id: string): Promise<Notification> =>
  apiClient.patch(`/api/notifications/${id}/read`) as Promise<Notification>

export const markAsUnread = (id: string): Promise<Notification> =>
  apiClient.patch(`/api/notifications/${id}/unread`) as Promise<Notification>

export const markAllAsRead = (): Promise<{ message: string }> =>
  apiClient.post('/api/notifications/mark-all-read') as Promise<{ message: string }>

export const getUnreadCount = (): Promise<{ count: number }> =>
  apiClient.get('/api/notifications/unread-count') as Promise<{ count: number }>

export const deleteNotification = (id: string): Promise<void> =>
  apiClient.delete(`/api/notifications/${id}`) as Promise<void>
