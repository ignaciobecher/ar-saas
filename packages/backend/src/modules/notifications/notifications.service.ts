import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { QueryNotificationDto } from './dto/query-notification.dto';
import { NotificationsRepository } from './notifications.repository';

@Injectable()
export class NotificationsService {
  constructor(private readonly notificationsRepository: NotificationsRepository) {}

  findAll(workspaceId: string, userId: string, query: QueryNotificationDto) {
    const { page, limit, isRead } = query;
    const filter: Record<string, unknown> = { userId };
    if (isRead !== undefined) filter.isRead = isRead;

    return this.notificationsRepository.paginate(workspaceId, {
      page,
      limit,
      filter,
      sort: { createdAt: -1 },
    });
  }

  async findOne(workspaceId: string, id: string) {
    const notification = await this.notificationsRepository.findById(workspaceId, id);
    if (!notification) throw new NotFoundException('Notificación no encontrada');
    return notification;
  }

  create(workspaceId: string, userId: string, dto: CreateNotificationDto) {
    return this.notificationsRepository.create({
      ...dto,
      workspaceId: workspaceId as unknown as import('mongoose').Types.ObjectId,
      createdBy: userId as unknown as import('mongoose').Types.ObjectId,
      deletedAt: null,
    } as never);
  }

  async markAsRead(workspaceId: string, id: string) {
    const notification = await this.notificationsRepository.findById(workspaceId, id);
    if (!notification) throw new NotFoundException('Notificación no encontrada');
    return this.notificationsRepository.update(workspaceId, id, { isRead: true } as never);
  }

  async markAsUnread(workspaceId: string, id: string) {
    const notification = await this.notificationsRepository.findById(workspaceId, id);
    if (!notification) throw new NotFoundException('Notificación no encontrada');
    return this.notificationsRepository.update(workspaceId, id, { isRead: false } as never);
  }

  async markAllAsRead(workspaceId: string, userId: string) {
    await this.notificationsRepository.markAllAsRead(workspaceId, userId);
    return { message: 'Todas las notificaciones marcadas como leídas' };
  }

  async getUnreadCount(workspaceId: string, userId: string) {
    const count = await this.notificationsRepository.getUnreadCount(workspaceId, userId);
    return { count };
  }

  async remove(workspaceId: string, id: string) {
    await this.findOne(workspaceId, id);
    await this.notificationsRepository.softDelete(workspaceId, id);
  }
}
