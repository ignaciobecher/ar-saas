import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseSchema } from '../../../common/base/base.schema';

export type TaskDocument = HydratedDocument<Task>;

export interface ChecklistItem {
  text: string;
  completed: boolean;
}

export interface TaskLabel {
  name: string;
  color: string;
}

@Schema({ collection: 'tasks', timestamps: true })
export class Task extends BaseSchema {
  @Prop({ required: true, trim: true, maxlength: 200 })
  title!: string;

  @Prop({ trim: true })
  description!: string;

  @Prop({
    type: String,
    enum: ['todo', 'in-progress', 'done', 'cancelled'],
    default: 'todo',
  })
  status!: 'todo' | 'in-progress' | 'done' | 'cancelled';

  @Prop({
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  })
  priority!: 'low' | 'medium' | 'high' | 'urgent';

  @Prop({ type: Date })
  dueDate!: Date;

  @Prop({ type: String, default: null })
  columnId!: string | null;

  @Prop({ default: 0 })
  order!: number;

  @Prop({
    type: [{ text: { type: String, required: true }, completed: { type: Boolean, default: false } }],
    default: [],
  })
  checklist!: ChecklistItem[];

  @Prop({
    type: [{ name: { type: String, required: true }, color: { type: String, required: true } }],
    default: [],
  })
  labels!: TaskLabel[];
}

export const TaskSchema = SchemaFactory.createForClass(Task);

TaskSchema.index({ workspaceId: 1, status: 1 });
TaskSchema.index({ workspaceId: 1, columnId: 1, order: 1 });
TaskSchema.index({ workspaceId: 1, priority: 1 });
TaskSchema.index({ workspaceId: 1, dueDate: 1 });
