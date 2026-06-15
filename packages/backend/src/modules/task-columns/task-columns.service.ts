import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskColumnDto } from './dto/create-task-column.dto';
import { ReorderColumnsDto } from './dto/reorder-columns.dto';
import { UpdateTaskColumnDto } from './dto/update-task-column.dto';
import { TaskColumnsRepository } from './task-columns.repository';

@Injectable()
export class TaskColumnsService {
  constructor(private readonly taskColumnsRepository: TaskColumnsRepository) {}

  findAll(workspaceId: string) {
    return this.taskColumnsRepository.findAll(workspaceId, { sort: { order: 1 } });
  }

  async findOne(workspaceId: string, id: string) {
    const column = await this.taskColumnsRepository.findById(workspaceId, id);
    if (!column) throw new NotFoundException('Columna no encontrada');
    return column;
  }

  create(workspaceId: string, userId: string, dto: CreateTaskColumnDto) {
    return this.taskColumnsRepository.create({
      ...dto,
      workspaceId: workspaceId as unknown as import('mongoose').Types.ObjectId,
      createdBy: userId as unknown as import('mongoose').Types.ObjectId,
      deletedAt: null,
    } as never);
  }

  async update(workspaceId: string, id: string, dto: UpdateTaskColumnDto) {
    await this.findOne(workspaceId, id);
    const column = await this.taskColumnsRepository.update(workspaceId, id, dto as never);
    if (!column) throw new NotFoundException('Columna no encontrada');
    return column;
  }

  async reorder(workspaceId: string, dto: ReorderColumnsDto) {
    const updates = dto.ids.map((id, index) =>
      this.taskColumnsRepository.update(workspaceId, id, { order: index } as never),
    );
    await Promise.all(updates);
    return this.taskColumnsRepository.findAll(workspaceId, { sort: { order: 1 } });
  }

  async remove(workspaceId: string, id: string) {
    await this.findOne(workspaceId, id);
    await this.taskColumnsRepository.softDelete(workspaceId, id);
  }
}
