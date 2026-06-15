import apiClient from '@/lib/api/client'
import type { CreatePlannerBlockDto, PlannerBlock, QueryPlannerBlockDto, UpdatePlannerBlockDto } from '@/types/planner'
import type { BlockStatus } from '@/types/planner'

export const getPlannerBlocks = (params?: QueryPlannerBlockDto): Promise<{ data: PlannerBlock[]; total: number }> =>
  apiClient.get('/api/planner-blocks', { params }) as Promise<{ data: PlannerBlock[]; total: number }>

export const getPlannerBlock = (id: string): Promise<PlannerBlock> =>
  apiClient.get(`/api/planner-blocks/${id}`) as Promise<PlannerBlock>

export const createPlannerBlock = (dto: CreatePlannerBlockDto): Promise<PlannerBlock> =>
  apiClient.post('/api/planner-blocks', dto) as Promise<PlannerBlock>

export const updatePlannerBlock = (id: string, dto: UpdatePlannerBlockDto): Promise<PlannerBlock> =>
  apiClient.patch(`/api/planner-blocks/${id}`, dto) as Promise<PlannerBlock>

export const updateBlockStatus = (id: string, status: BlockStatus): Promise<PlannerBlock> =>
  apiClient.patch(`/api/planner-blocks/${id}/status`, { status }) as Promise<PlannerBlock>

export const duplicatePlannerBlock = (id: string, targetDate?: string): Promise<PlannerBlock> =>
  apiClient.post(`/api/planner-blocks/${id}/duplicate`, null, {
    params: targetDate ? { targetDate } : undefined,
  }) as Promise<PlannerBlock>

export const deletePlannerBlock = (id: string): Promise<void> =>
  apiClient.delete(`/api/planner-blocks/${id}`) as Promise<void>
