import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async findByGithubId(githubId: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ githubId }).exec();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({ email: email.toLowerCase().trim() })
      .exec();
  }

  async findByEmailWithPassword(email: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({ email: email.toLowerCase().trim() })
      .select('+password')
      .exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async findByIdWithSecrets(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).select('+refreshToken').exec();
  }

  async findByVerificationToken(tokenHash: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({ emailVerificationToken: tokenHash })
      .select('+emailVerificationToken')
      .exec();
  }

  async findByPasswordResetToken(tokenHash: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({ passwordResetToken: tokenHash })
      .select('+passwordResetToken')
      .exec();
  }

  async create(data: Partial<User>): Promise<UserDocument> {
    const user = new this.userModel(data);
    return user.save();
  }

  async update(id: string, data: Partial<User>): Promise<UserDocument | null> {
    return this.userModel
      .findByIdAndUpdate(id, { $set: data }, { returnDocument: 'after' })
      .exec();
  }

  async delete(id: string): Promise<UserDocument | null> {
    return this.userModel.findByIdAndDelete(id).exec();
  }
}
