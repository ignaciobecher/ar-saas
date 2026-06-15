import apiClient from '@/lib/api/client'
import type { CreateTaskColumnDto, TaskColumn, UpdateTaskColumnDto } from '@/types/tasks'

export const getTaskColumns = (): Promise<TaskColumn[]> =>
  apiClient.get('/api/task-columns') as Promise<TaskColumn[]>

export const createTaskColumn = (dto: CreateTaskColumnDto): Promise<TaskColumn> =>
  apiClient.post('/api/task-columns', dto) as Promise<TaskColumn>

export const updateTaskColumn = (id: string, dto: UpdateTaskColumnDto): Promise<TaskColumn> =>
  apiClient.patch(`/api/task-columns/${id}`, dto) as Promise<TaskColumn>

export const reorderTaskColumns = (ids: string[]): Promise<TaskColumn[]> =>
  apiClient.patch('/api/task-columns/reorder', { ids }) as Promise<TaskColumn[]>

export const deleteTaskColumn = (id: string): Promise<void> =>
  apiClient.delete(`/api/task-columns/${id}`) as Promise<void>
