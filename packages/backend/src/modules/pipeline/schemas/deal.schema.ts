import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseSchema } from '../../../common/base/base.schema';

export type DealDocument = HydratedDocument<Deal>;

@Schema({ collection: 'deals', timestamps: true })
export class Deal extends BaseSchema {
  @Prop({ required: true, trim: true, maxlength: 200 })
  title!: string;

  @Prop()
  clientId!: string;

  @Prop({ default: 0 })
  value!: number;

  @Prop({ default: 'USD', trim: true, uppercase: true })
  currency!: string;

  @Prop({
    type: String,
    enum: ['lead', 'contacted', 'proposal', 'won', 'lost'],
    default: 'lead',
  })
  stage!: 'lead' | 'contacted' | 'proposal' | 'won' | 'lost';

  @Prop({ type: Date })
  expectedCloseDate!: Date;

  @Prop({ trim: true })
  notes!: string;
}

export const DealSchema = SchemaFactory.createForClass(Deal);

DealSchema.index({ workspaceId: 1, stage: 1 });
DealSchema.index({ workspaceId: 1, clientId: 1 });
DealSchema.index({ workspaceId: 1, createdAt: -1 });
