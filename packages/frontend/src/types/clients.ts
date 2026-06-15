export interface Client {
  _id: string
  name: string
  email?: string
  phone?: string
  address?: string
  status: 'active' | 'archived'
  notes?: string
  workspaceId: string
  createdAt: string
  updatedAt: string
}

export interface CreateClientDto {
  name: string
  email?: string
  phone?: string
  address?: string
  notes?: string
  status?: 'active' | 'archived'
}

export type UpdateClientDto = Partial<CreateClientDto>

export interface QueryClientDto {
  search?: string
  status?: 'active' | 'archived'
  page?: number
  limit?: number
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}
