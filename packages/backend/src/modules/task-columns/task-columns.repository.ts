import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../../common/base/base.repository';
import { TaskColumn, TaskColumnDocument } from './schemas/task-column.schema';

@Injectable()
export class TaskColumnsRepository extends BaseRepository<TaskColumnDocument> {
  constructor(
    @InjectModel(TaskColumn.name)
    private readonly taskColumnModel: Model<TaskColumnDocument>,
  ) {
    super(taskColumnModel);
  }
}
