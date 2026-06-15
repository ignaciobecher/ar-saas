import { ConflictException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
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

  async findByGithubId(githubId: string): Promise<UserDocument | null> {
    return this.usersRepository.findByGithubId(githubId);
  }

  async createGithubUser(data: {
    name: string;
    email: string;
    githubId: string;
    workspaceId: string;
    role?: UserRole;
  }): Promise<UserDocument> {
    const existing = await this.usersRepository.findByEmail(data.email);
    if (existing) {
      throw new ConflictException('Este email ya está registrado.');
    }
    return this.usersRepository.create({
      ...data,
      password: null,
      emailVerified: true,
    });
  }

  async linkGithubId(userId: string, githubId: string): Promise<void> {
    await this.usersRepository.update(userId, { githubId });
  }

  async findByEmailWithPassword(email: string): Promise<UserDocument | null> {
    return this.usersRepository.findByEmailWithPassword(email);
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.usersRepository.findById(id);
  }

  async findByIdWithPassword(id: string): Promise<UserDocument | null> {
    return this.usersRepository.findByIdWithPassword(id);
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
    const tokenHash = this.hashToken(token);
    await this.usersRepository.update(userId, {
      emailVerificationToken: tokenHash,
      emailVerificationTokenExpiresAt: expiresAt,
    });
  }

  async findByVerificationToken(token: string): Promise<UserDocument | null> {
    const tokenHash = this.hashToken(token);
    return this.usersRepository.findByVerificationToken(tokenHash);
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
    const tokenHash = this.hashToken(token);
    await this.usersRepository.update(userId, {
      passwordResetToken: tokenHash,
      passwordResetTokenExpiresAt: expiresAt,
    });
  }

  async findByPasswordResetToken(token: string): Promise<UserDocument | null> {
    const tokenHash = this.hashToken(token);
    return this.usersRepository.findByPasswordResetToken(tokenHash);
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

  async updateWorkspaceId(userId: string, workspaceId: string): Promise<void> {
    await this.usersRepository.update(userId, { workspaceId });
  }

  async delete(userId: string): Promise<void> {
    await this.usersRepository.delete(userId);
  }

  async updateMe(
    userId: string,
    data: { name?: string; email?: string; phone?: string },
  ): Promise<UserDocument | null> {
    if (data.email) {
      const existing = await this.usersRepository.findByEmail(data.email);
      if (existing && String(existing._id) !== userId) {
        throw new ConflictException('Este email ya está registrado.');
      }
    }
    return this.usersRepository.update(userId, data);
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
