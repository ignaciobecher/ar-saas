import { ConflictException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument, UserRole } from './schemas/user.schema';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(data: {
    name: string;
    email: string;
    password: string;
    workspaceId: string;
    role?: UserRole;
  }): Promise<UserDocument> {
    const existing = await this.usersRepository.findByEmail(data.email);
    if (existing) {
      throw new ConflictException('Este email ya está registrado.');
    }
    const hashedPassword = await bcrypt.hash(data.password, 12);
    return this.usersRepository.create({ ...data, password: hashedPassword });
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.usersRepository.findByEmail(email);
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.usersRepository.findById(id);
  }

  async updateRefreshToken(
    userId: string,
    refreshToken: string | null,
  ): Promise<void> {
    const hashed = refreshToken
      ? await bcrypt.hash(refreshToken, 10)
      : null;
    await this.usersRepository.update(userId, { refreshToken: hashed });
  }

  async validateRefreshToken(
    userId: string,
    token: string,
  ): Promise<UserDocument | null> {
    const user = await this.usersRepository.findByIdWithSecrets(userId);
    if (!user?.refreshToken) return null;
    const valid = await bcrypt.compare(token, user.refreshToken);
    return valid ? user : null;
  }

  async setEmailVerificationToken(
    userId: string,
    token: string,
    expiresAt: Date,
  ): Promise<void> {
    await this.usersRepository.update(userId, {
      emailVerificationToken: token,
      emailVerificationTokenExpiresAt: expiresAt,
    });
  }

  async findByVerificationToken(token: string): Promise<UserDocument | null> {
    return this.usersRepository.findByVerificationToken(token);
  }

  async markEmailVerified(userId: string): Promise<void> {
    await this.usersRepository.update(userId, {
      emailVerified: true,
      emailVerificationToken: null,
      emailVerificationTokenExpiresAt: null,
    });
  }

  async setPasswordResetToken(
    userId: string,
    token: string,
    expiresAt: Date,
  ): Promise<void> {
    await this.usersRepository.update(userId, {
      passwordResetToken: token,
      passwordResetTokenExpiresAt: expiresAt,
    });
  }

  async findByPasswordResetToken(token: string): Promise<UserDocument | null> {
    return this.usersRepository.findByPasswordResetToken(token);
  }

  async updatePassword(userId: string, password: string): Promise<void> {
    const hashed = await bcrypt.hash(password, 12);
    await this.usersRepository.update(userId, {
      password: hashed,
      passwordResetToken: null,
      passwordResetTokenExpiresAt: null,
      refreshToken: null,
    });
  }

  async updateLastLoginAt(userId: string): Promise<void> {
    await this.usersRepository.update(userId, { lastLoginAt: new Date() });
  }
}
