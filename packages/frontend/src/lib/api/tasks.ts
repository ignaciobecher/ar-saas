import apiClient from '@/lib/api/client'
import type { CreateTaskDto, MoveTaskDto, Task, UpdateTaskDto } from '@/types/tasks'
import type { PaginatedResult } from '@/types/clients'

export const getTasks = (params?: Record<string, unknown>): Promise<PaginatedResult<Task>> =>
  apiClient.get('/api/tasks', { params }) as Promise<PaginatedResult<Task>>

export const getTask = (id: string): Promise<Task> =>
  apiClient.get(`/api/tasks/${id}`) as Promise<Task>

export const createTask = (dto: CreateTaskDto): Promise<Task> =>
  apiClient.post('/api/tasks', dto) as Promise<Task>

export const updateTask = (id: string, dto: UpdateTaskDto): Promise<Task> =>
  apiClient.patch(`/api/tasks/${id}`, dto) as Promise<Task>

export const moveTask = (id: string, dto: MoveTaskDto): Promise<Task> =>
  apiClient.patch(`/api/tasks/${id}/move`, dto) as Promise<Task>

export const deleteTask = (id: string): Promise<void> =>
  apiClient.delete(`/api/tasks/${id}`) as Promise<void>
