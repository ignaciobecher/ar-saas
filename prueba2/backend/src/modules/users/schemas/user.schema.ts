import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

export enum UserRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
}

@Schema({ collection: 'users', timestamps: true })
export class User {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email!: string;

  @Prop({ type: String, default: null, select: false })
  password!: string | null;

  @Prop({ required: true })
  workspaceId!: string;

  @Prop({ default: false })
  emailVerified!: boolean;

  @Prop({ type: String, default: null, select: false })
  emailVerificationToken!: string | null;

  @Prop({ type: Date, default: null })
  emailVerificationTokenExpiresAt!: Date | null;

  @Prop({ type: String, default: null, select: false })
  passwordResetToken!: string | null;

  @Prop({ type: Date, default: null })
  passwordResetTokenExpiresAt!: Date | null;

  @Prop({ type: String, default: null, select: false })
  refreshToken!: string | null;

  @Prop({ type: String, enum: Object.values(UserRole), default: UserRole.OWNER })
  role!: UserRole;

  @Prop({ type: Date, default: null })
  lastLoginAt!: Date | null;

  createdAt!: Date;
  updatedAt!: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
