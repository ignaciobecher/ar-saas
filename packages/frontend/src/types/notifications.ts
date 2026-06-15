export interface Notification {
  _id: string
  userId: string
  title: string
  message: string
  type: 'info' | 'warning' | 'success' | 'error'
  link?: string
  isRead: boolean
  refId?: string
  refType?: string
  workspaceId: string
  createdAt: string
  updatedAt: string
}

export interface CreateNotificationDto {
  userId: string
  title: string
  message: string
  type?: 'info' | 'warning' | 'success' | 'error'
  link?: string
  refId?: string
  refType?: string
}

export interface QueryNotificationDto {
  isRead?: boolean
  page?: number
  limit?: number
}
