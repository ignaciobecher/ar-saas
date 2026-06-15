import apiClient from '@/lib/api/client'
import type { Client, CreateClientDto, PaginatedResult, QueryClientDto, UpdateClientDto } from '@/types/clients'

export const getClients = (params?: QueryClientDto): Promise<PaginatedResult<Client>> =>
  apiClient.get('/api/clients', { params }) as Promise<PaginatedResult<Client>>

export const getClient = (id: string): Promise<Client> =>
  apiClient.get(`/api/clients/${id}`) as Promise<Client>

export const createClient = (dto: CreateClientDto): Promise<Client> =>
  apiClient.post('/api/clients', dto) as Promise<Client>

export const updateClient = (id: string, dto: UpdateClientDto): Promise<Client> =>
  apiClient.patch(`/api/clients/${id}`, dto) as Promise<Client>

export const deleteClient = (id: string): Promise<void> =>
  apiClient.delete(`/api/clients/${id}`) as Promise<void>
