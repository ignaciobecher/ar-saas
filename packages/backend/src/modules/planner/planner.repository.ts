import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../../common/base/base.repository';
import { PlannerBlock, PlannerBlockDocument } from './schemas/planner-block.schema';

@Injectable()
export class PlannerRepository extends BaseRepository<PlannerBlockDocument> {
  constructor(
    @InjectModel(PlannerBlock.name)
    private readonly plannerBlockModel: Model<PlannerBlockDocument>,
  ) {
    super(plannerBlockModel);
  }

  async findByDate(
    workspaceId: string,
    userId: string,
    date: string,
  ): Promise<PlannerBlockDocument[]> {
    return this.plannerBlockModel
      .find({ workspaceId, userId, date, deletedAt: null })
      .sort({ order: 1 })
      .lean()
      .exec() as unknown as PlannerBlockDocument[];
  }

  async findByDateRange(
    workspaceId: string,
    userId: string,
    dateFrom: string,
    dateTo: string,
  ): Promise<PlannerBlockDocument[]> {
    return this.plannerBlockModel
      .find({
        workspaceId,
        userId,
        date: { $gte: dateFrom, $lte: dateTo },
        deletedAt: null,
      })
      .sort({ date: 1, order: 1 })
      .lean()
      .exec() as unknown as PlannerBlockDocument[];
  }
}
