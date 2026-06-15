import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseSchema } from '../../../common/base/base.schema';

export type PlannerBlockDocument = HydratedDocument<PlannerBlock>;

@Schema({ collection: 'planner_blocks', timestamps: true })
export class PlannerBlock extends BaseSchema {
  @Prop({ required: true })
  userId!: string;

  @Prop({ required: true })
  date!: string;

  @Prop({ required: true })
  startTime!: string;

  @Prop({ required: true })
  endTime!: string;

  @Prop({ required: true, trim: true, maxlength: 120 })
  title!: string;

  @Prop({ trim: true })
  description!: string;

  @Prop({ default: 'work' })
  category!: string;

  @Prop({ type: String, enum: ['low', 'medium', 'high'], default: 'medium' })
  priority!: 'low' | 'medium' | 'high';

  @Prop({
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'skipped'],
    default: 'pending',
  })
  status!: 'pending' | 'in-progress' | 'completed' | 'skipped';

  @Prop({ default: '#2563EB' })
  color!: string;

  @Prop({ default: false })
  isFocusBlock!: boolean;

  @Prop({ default: 0 })
  order!: number;

  @Prop({ type: [String], default: [] })
  tags!: string[];
}

export const PlannerBlockSchema = SchemaFactory.createForClass(PlannerBlock);

PlannerBlockSchema.index({ workspaceId: 1, userId: 1, date: 1 });
PlannerBlockSchema.index({ workspaceId: 1, userId: 1, date: 1, status: 1 });
