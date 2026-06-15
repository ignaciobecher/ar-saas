import apiClient from '@/lib/api/client'
import type { CreateInvoiceDto, Invoice, QueryInvoiceDto, UpdateInvoiceDto } from '@/types/invoices'
import type { PaginatedResult } from '@/types/clients'

export const getInvoices = (params?: QueryInvoiceDto): Promise<PaginatedResult<Invoice>> =>
  apiClient.get('/api/invoices', { params }) as Promise<PaginatedResult<Invoice>>

export const getInvoice = (id: string): Promise<Invoice> =>
  apiClient.get(`/api/invoices/${id}`) as Promise<Invoice>

export const createInvoice = (dto: CreateInvoiceDto): Promise<Invoice> =>
  apiClient.post('/api/invoices', dto) as Promise<Invoice>

export const updateInvoice = (id: string, dto: UpdateInvoiceDto): Promise<Invoice> =>
  apiClient.patch(`/api/invoices/${id}`, dto) as Promise<Invoice>

export const deleteInvoice = (id: string): Promise<void> =>
  apiClient.delete(`/api/invoices/${id}`) as Promise<void>
