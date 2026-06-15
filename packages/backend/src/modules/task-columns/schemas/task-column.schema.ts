import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseSchema } from '../../../common/base/base.schema';

export type TaskColumnDocument = HydratedDocument<TaskColumn>;

@Schema({ collection: 'task_columns', timestamps: true })
export class TaskColumn extends BaseSchema {
  @Prop({ required: true, trim: true, maxlength: 100 })
  name!: string;

  @Prop({ default: '#6B7280' })
  color!: string;

  @Prop({ default: 0 })
  order!: number;
}

export const TaskColumnSchema = SchemaFactory.createForClass(TaskColumn);

TaskColumnSchema.index({ workspaceId: 1, order: 1 });
