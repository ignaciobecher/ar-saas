import { Prop, Schema } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class BaseSchema {
  @Prop({
    type: Types.ObjectId,
    required: true,
    index: true,
  })
  workspaceId!: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    required: true,
  })
  createdBy!: Types.ObjectId;

  @Prop({
    type: Date,
    default: null,
  })
  deletedAt!: Date | null;
}
