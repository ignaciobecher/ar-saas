import { Injectable, NotFoundException } from '@nestjs/common';
import { ClientsService } from '../clients/clients.service';
import { CreateDealDto } from './dto/create-deal.dto';
import { QueryDealDto } from './dto/query-deal.dto';
import { UpdateDealDto } from './dto/update-deal.dto';
import { PipelineRepository } from './pipeline.repository';

@Injectable()
export class PipelineService {
  constructor(
    private readonly pipelineRepository: PipelineRepository,
    private readonly clientsService: ClientsService,
  ) {}

  findAll(workspaceId: string, query: QueryDealDto) {
    const { page, limit, search, stage, clientId } = query;
    const filter: Record<string, unknown> = {};

    if (stage) filter.stage = stage;
    if (clientId) filter.clientId = clientId;
    if (search) filter.title = { $regex: search, $options: 'i' };

    return this.pipelineRepository.paginate(workspaceId, {
      page,
      limit,
      filter,
      sort: { createdAt: -1 },
    });
  }

  async findOne(workspaceId: string, id: string) {
    const deal = await this.pipelineRepository.findById(workspaceId, id);
    if (!deal) throw new NotFoundException('Deal no encontrado');
    return deal;
  }

  async create(workspaceId: string, userId: string, dto: CreateDealDto) {
    if (dto.clientId) {
      await this.clientsService.findOne(workspaceId, dto.clientId);
    }
    return this.pipelineRepository.create({
      ...dto,
      expectedCloseDate: dto.expectedCloseDate ? new Date(dto.expectedCloseDate) : undefined,
      workspaceId: workspaceId as unknown as import('mongoose').Types.ObjectId,
      createdBy: userId as unknown as import('mongoose').Types.ObjectId,
      deletedAt: null,
    } as never);
  }

  async update(workspaceId: string, id: string, dto: UpdateDealDto) {
    await this.findOne(workspaceId, id);
    if (dto.clientId) {
      await this.clientsService.findOne(workspaceId, dto.clientId);
    }
    const deal = await this.pipelineRepository.update(workspaceId, id, dto as never);
    if (!deal) throw new NotFoundException('Deal no encontrado');
    return deal;
  }

  async remove(workspaceId: string, id: string) {
    await this.findOne(workspaceId, id);
    await this.pipelineRepository.softDelete(workspaceId, id);
  }
}
