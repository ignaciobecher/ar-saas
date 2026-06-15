import apiClient from '@/lib/api/client'
import type { CreateDealDto, Deal, QueryDealDto, UpdateDealDto } from '@/types/pipeline'
import type { PaginatedResult } from '@/types/clients'

export const getDeals = (params?: QueryDealDto): Promise<PaginatedResult<Deal>> =>
  apiClient.get('/api/pipeline', { params }) as Promise<PaginatedResult<Deal>>

export const getDeal = (id: string): Promise<Deal> =>
  apiClient.get(`/api/pipeline/${id}`) as Promise<Deal>

export const createDeal = (dto: CreateDealDto): Promise<Deal> =>
  apiClient.post('/api/pipeline', dto) as Promise<Deal>

export const updateDeal = (id: string, dto: UpdateDealDto): Promise<Deal> =>
  apiClient.patch(`/api/pipeline/${id}`, dto) as Promise<Deal>

export const deleteDeal = (id: string): Promise<void> =>
  apiClient.delete(`/api/pipeline/${id}`) as Promise<void>
