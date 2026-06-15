import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../../common/base/base.repository';
import { Notification, NotificationDocument } from './schemas/notification.schema';

@Injectable()
export class NotificationsRepository extends BaseRepository<NotificationDocument> {
  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,
  ) {
    super(notificationModel);
  }

  async markAllAsRead(workspaceId: string, userId: string): Promise<void> {
    await this.notificationModel.updateMany(
      { workspaceId, userId, isRead: false, deletedAt: null },
      { $set: { isRead: true } },
    );
  }

  async getUnreadCount(workspaceId: string, userId: string): Promise<number> {
    return this.notificationModel.countDocuments({
      workspaceId,
      userId,
      isRead: false,
      deletedAt: null,
    });
  }
}
