export type BlockStatus = 'pending' | 'in-progress' | 'completed' | 'skipped'
export type BlockPriority = 'low' | 'medium' | 'high'

export interface PlannerBlock {
  _id: string
  userId: string
  date: string
  startTime: string
  endTime: string
  title: string
  description?: string
  category: string
  priority: BlockPriority
  status: BlockStatus
  color: string
  isFocusBlock: boolean
  order: number
  tags: string[]
  workspaceId: string
  createdAt: string
  updatedAt: string
}

export interface CreatePlannerBlockDto {
  date: string
  startTime: string
  endTime: string
  title: string
  description?: string
  category?: string
  priority?: BlockPriority
  status?: BlockStatus
  color?: string
  isFocusBlock?: boolean
  order?: number
  tags?: string[]
}

export type UpdatePlannerBlockDto = Partial<CreatePlannerBlockDto>

export interface QueryPlannerBlockDto {
  date?: string
  dateFrom?: string
  dateTo?: string
  status?: BlockStatus
  category?: string
  page?: number
  limit?: number
}
