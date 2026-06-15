import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type WorkspaceDocument = HydratedDocument<Workspace>;

@Schema({ collection: 'workspaces', timestamps: true })
export class Workspace {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  slug!: string;

  @Prop({ required: true })
  ownerId!: string;

  @Prop({ type: String, enum: ['active', 'suspended'], default: 'active' })
  status!: 'active' | 'suspended';

  createdAt!: Date;
  updatedAt!: Date;
}

export const WorkspaceSchema = SchemaFactory.createForClass(Workspace);

WorkspaceSchema.index({ ownerId: 1 });
