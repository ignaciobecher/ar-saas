import { Injectable, NotFoundException } from '@nestjs/common';
import { TaskColumnsService } from '../task-columns/task-columns.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { MoveTaskDto } from './dto/move-task.dto';
import { QueryTaskDto } from './dto/query-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksRepository } from './tasks.repository';

@Injectable()
export class TasksService {
  constructor(
    private readonly tasksRepository: TasksRepository,
    private readonly taskColumnsService: TaskColumnsService,
  ) {}

  findAll(workspaceId: string, query: QueryTaskDto) {
    const { page, limit, search, status, priority, columnId } = query;
    const filter: Record<string, unknown> = {};

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (columnId !== undefined) filter.columnId = columnId;
    if (search) filter.title = { $regex: search, $options: 'i' };

    return this.tasksRepository.paginate(workspaceId, {
      page,
      limit,
      filter,
      sort: { columnId: 1, order: 1 },
    });
  }

  async findOne(workspaceId: string, id: string) {
    const task = await this.tasksRepository.findById(workspaceId, id);
    if (!task) throw new NotFoundException('Tarea no encontrada');
    return task;
  }

  async create(workspaceId: string, userId: string, dto: CreateTaskDto) {
    if (dto.columnId) {
      await this.taskColumnsService.findOne(workspaceId, dto.columnId);
    }
    return this.tasksRepository.create({
      ...dto,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      workspaceId: workspaceId as unknown as import('mongoose').Types.ObjectId,
      createdBy: userId as unknown as import('mongoose').Types.ObjectId,
      deletedAt: null,
    } as never);
  }

  async update(workspaceId: string, id: string, dto: UpdateTaskDto) {
    await this.findOne(workspaceId, id);
    if (dto.columnId) {
      await this.taskColumnsService.findOne(workspaceId, dto.columnId);
    }
    const task = await this.tasksRepository.update(workspaceId, id, dto as never);
    if (!task) throw new NotFoundException('Tarea no encontrada');
    return task;
  }

  async move(workspaceId: string, id: string, dto: MoveTaskDto) {
    await this.findOne(workspaceId, id);
    if (dto.columnId) {
      await this.taskColumnsService.findOne(workspaceId, dto.columnId);
    }
    const task = await this.tasksRepository.update(workspaceId, id, dto as never);
    if (!task) throw new NotFoundException('Tarea no encontrada');
    return task;
  }

  async remove(workspaceId: string, id: string) {
    await this.findOne(workspaceId, id);
    await this.tasksRepository.softDelete(workspaceId, id);
  }
}
