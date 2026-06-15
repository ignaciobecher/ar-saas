export interface InvoiceItem {
  description: string
  quantity: number
  unitPrice: number
  amount: number
}

export interface Invoice {
  _id: string
  type: 'income' | 'expense'
  number?: string
  clientId?: string
  status: 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled'
  issueDate: string
  dueDate?: string
  items: InvoiceItem[]
  subtotal: number
  taxRate: number
  taxAmount: number
  total: number
  currency: string
  notes?: string
  workspaceId: string
  createdAt: string
  updatedAt: string
}

export interface CreateInvoiceDto {
  type?: 'income' | 'expense'
  number?: string
  clientId?: string
  status?: 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled'
  issueDate?: string
  dueDate?: string
  items?: InvoiceItem[]
  taxRate?: number
  currency?: string
  notes?: string
  total?: number
}

export type UpdateInvoiceDto = Partial<CreateInvoiceDto>

export interface QueryInvoiceDto {
  search?: string
  status?: string
  type?: 'income' | 'expense'
  clientId?: string
  page?: number
  limit?: number
}
