import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePlannerBlockDto } from './dto/create-planner-block.dto';
import { QueryPlannerBlockDto } from './dto/query-planner-block.dto';
import { UpdateBlockStatusDto } from './dto/update-block-status.dto';
import { UpdatePlannerBlockDto } from './dto/update-planner-block.dto';
import { PlannerRepository } from './planner.repository';

@Injectable()
export class PlannerService {
  constructor(private readonly plannerRepository: PlannerRepository) {}

  async findAll(workspaceId: string, userId: string, query: QueryPlannerBlockDto) {
    const { date, dateFrom, dateTo, status, category, page, limit } = query;

    if (date) {
      const blocks = await this.plannerRepository.findByDate(workspaceId, userId, date);
      return { data: blocks, total: blocks.length, page: 1, limit: blocks.length };
    }

    if (dateFrom && dateTo) {
      const dayDiff = this.daysBetween(dateFrom, dateTo);
      if (dayDiff > 31) {
        throw new BadRequestException('El rango de fechas no puede superar los 31 días');
      }
      const blocks = await this.plannerRepository.findByDateRange(workspaceId, userId, dateFrom, dateTo);
      return { data: blocks, total: blocks.length, page: 1, limit: blocks.length };
    }

    const filter: Record<string, unknown> = { userId };
    if (status) filter.status = status;
    if (category) filter.category = category;

    return this.plannerRepository.paginate(workspaceId, {
      page,
      limit,
      filter,
      sort: { date: 1, order: 1 },
    });
  }

  async findOne(workspaceId: string, userId: string, id: string) {
    const block = await this.plannerRepository.findOne(workspaceId, { _id: this.plannerRepository['toObjectId'](id), userId });
    if (!block) throw new NotFoundException('Bloque no encontrado');
    return block;
  }

  create(workspaceId: string, userId: string, dto: CreatePlannerBlockDto) {
    return this.plannerRepository.create({
      ...dto,
      userId,
      workspaceId: workspaceId as unknown as import('mongoose').Types.ObjectId,
      createdBy: userId as unknown as import('mongoose').Types.ObjectId,
      deletedAt: null,
    } as never);
  }

  async update(workspaceId: string, userId: string, id: string, dto: UpdatePlannerBlockDto) {
    await this.findOne(workspaceId, userId, id);
    const block = await this.plannerRepository.update(workspaceId, id, dto as never);
    if (!block) throw new NotFoundException('Bloque no encontrado');
    return block;
  }

  async updateStatus(workspaceId: string, userId: string, id: string, dto: UpdateBlockStatusDto) {
    await this.findOne(workspaceId, userId, id);
    const block = await this.plannerRepository.update(workspaceId, id, { status: dto.status } as never);
    if (!block) throw new NotFoundException('Bloque no encontrado');
    return block;
  }

  async duplicate(workspaceId: string, userId: string, id: string, targetDate?: string) {
    const original = await this.findOne(workspaceId, userId, id);
    const orig = original as unknown as Record<string, unknown>;
    return this.plannerRepository.create({
      userId,
      date: targetDate ?? (orig.date as string),
      startTime: orig.startTime as string,
      endTime: orig.endTime as string,
      title: orig.title as string,
      description: orig.description as string,
      category: orig.category as string,
      priority: orig.priority as 'low' | 'medium' | 'high',
      color: orig.color as string,
      isFocusBlock: orig.isFocusBlock as boolean,
      tags: orig.tags as string[],
      order: ((orig.order as number) ?? 0) + 1,
      status: 'pending',
      workspaceId: workspaceId as unknown as import('mongoose').Types.ObjectId,
      createdBy: userId as unknown as import('mongoose').Types.ObjectId,
      deletedAt: null,
    } as never);
  }

  async remove(workspaceId: string, userId: string, id: string) {
    await this.findOne(workspaceId, userId, id);
    await this.plannerRepository.softDelete(workspaceId, id);
  }

  private daysBetween(from: string, to: string): number {
    const a = new Date(from).getTime();
    const b = new Date(to).getTime();
    return Math.abs(Math.round((b - a) / (1000 * 60 * 60 * 24)));
  }
}
