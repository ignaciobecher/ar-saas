export type DealStage = 'lead' | 'contacted' | 'proposal' | 'won' | 'lost'

export interface Deal {
  _id: string
  title: string
  clientId?: string
  value: number
  currency: string
  stage: DealStage
  expectedCloseDate?: string
  notes?: string
  workspaceId: string
  createdAt: string
  updatedAt: string
}

export interface CreateDealDto {
  title: string
  clientId?: string
  value?: number
  currency?: string
  stage?: DealStage
  expectedCloseDate?: string
  notes?: string
}

export type UpdateDealDto = Partial<CreateDealDto>

export interface QueryDealDto {
  search?: string
  stage?: DealStage
  clientId?: string
  page?: number
  limit?: number
}
