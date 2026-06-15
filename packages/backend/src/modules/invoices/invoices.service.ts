import { Injectable, NotFoundException } from '@nestjs/common';
import { ClientsService } from '../clients/clients.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { QueryInvoiceDto } from './dto/query-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { InvoiceItem } from './schemas/invoice.schema';
import { InvoicesRepository } from './invoices.repository';

@Injectable()
export class InvoicesService {
  constructor(
    private readonly invoicesRepository: InvoicesRepository,
    private readonly clientsService: ClientsService,
  ) {}

  findAll(workspaceId: string, query: QueryInvoiceDto) {
    const { page, limit, search, status, type, clientId } = query;
    const filter: Record<string, unknown> = {};

    if (status) filter.status = status;
    if (type) filter.type = type;
    if (clientId) filter.clientId = clientId;
    if (search) {
      filter.$or = [
        { number: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
      ];
    }

    return this.invoicesRepository.paginate(workspaceId, {
      page,
      limit,
      filter,
      sort: { createdAt: -1 },
    });
  }

  async findOne(workspaceId: string, id: string) {
    const invoice = await this.invoicesRepository.findById(workspaceId, id);
    if (!invoice) throw new NotFoundException('Factura no encontrada');
    return invoice;
  }

  async create(workspaceId: string, userId: string, dto: CreateInvoiceDto) {
    if (dto.clientId) {
      await this.clientsService.findOne(workspaceId, dto.clientId);
    }

    const items = dto.items ?? [];
    const totals = items.length > 0
      ? this.computeTotals(items, dto.taxRate ?? 0)
      : { subtotal: dto.total ?? 0, taxAmount: 0, total: dto.total ?? 0 };

    return this.invoicesRepository.create({
      ...dto,
      ...totals,
      issueDate: dto.issueDate ? new Date(dto.issueDate) : new Date(),
      dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      workspaceId: workspaceId as unknown as import('mongoose').Types.ObjectId,
      createdBy: userId as unknown as import('mongoose').Types.ObjectId,
      deletedAt: null,
    } as never);
  }

  async update(workspaceId: string, id: string, dto: UpdateInvoiceDto) {
    const current = await this.findOne(workspaceId, id);
    const clientId = dto.clientId ?? (current as unknown as { clientId: string }).clientId;

    if (clientId) {
      await this.clientsService.findOne(workspaceId, clientId);
    }

    const items = dto.items ?? (current as unknown as { items: InvoiceItem[] }).items ?? [];
    const taxRate = dto.taxRate ?? (current as unknown as { taxRate: number }).taxRate ?? 0;
    const extra: Record<string, unknown> = {};

    if (items.length > 0) {
      Object.assign(extra, this.computeTotals(items, taxRate));
    } else if (dto.total !== undefined) {
      extra.total = dto.total;
      extra.subtotal = dto.total;
      extra.taxAmount = 0;
    }

    const invoice = await this.invoicesRepository.update(workspaceId, id, { ...dto, ...extra } as never);
    if (!invoice) throw new NotFoundException('Factura no encontrada');
    return invoice;
  }

  async remove(workspaceId: string, id: string) {
    await this.findOne(workspaceId, id);
    await this.invoicesRepository.softDelete(workspaceId, id);
  }

  private computeTotals(
    items: { amount: number }[],
    taxRate: number,
  ): { subtotal: number; taxAmount: number; total: number } {
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const taxAmount = Math.round(subtotal * (taxRate / 100) * 100) / 100;
    const total = subtotal + taxAmount;
    return { subtotal, taxAmount, total };
  }
}
