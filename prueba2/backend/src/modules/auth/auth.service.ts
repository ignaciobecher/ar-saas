import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';
import type { StringValue } from 'ms';
import { MailService } from '../mail/mail.service';
import { UsersService } from '../users/users.service';
import { UserDocument } from '../users/schemas/user.schema';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly workspacesService: WorkspacesService,
    private readonly mailService: MailService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  // ─── Register ──────────────────────────────────────────────────────────────

  async register(dto: RegisterDto): Promise<{ message: string }> {
    // 1. Create workspace with placeholder ownerId (user doesn't exist yet)
    const workspace = await this.workspacesService.create('pending', dto.name);
    const workspaceId = String(workspace._id);

    // 2. Create user linked to the workspace
    const user = await this.usersService.create({
      name: dto.name,
      email: dto.email,
      password: dto.password,
      workspaceId,
    });
    const userId = String(user._id);

    // 3. Set the real ownerId on the workspace
    await this.workspacesService.update(workspaceId, { ownerId: userId });

    // 4. Generate email verification token (expires in 24h)
    const token = this.generateSecureToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await this.usersService.setEmailVerificationToken(userId, token, expiresAt);

    // 5. Send verification email
    await this.mailService.sendVerificationEmail(dto.email, dto.name, token);

    return { message: 'Verification email sent' };
  }

  // ─── Verify Email ───────────────────────────────────────────────────────────

  async verifyEmail(token: string): Promise<{ message: string }> {
    const user = await this.usersService.findByVerificationToken(token);
    if (!user) {
      throw new BadRequestException('Token inválido o expirado.');
    }
    if (
      user.emailVerificationTokenExpiresAt &&
      user.emailVerificationTokenExpiresAt < new Date()
    ) {
      throw new BadRequestException(
        'El enlace de verificación expiró. Solicitá uno nuevo.',
      );
    }
    await this.usersService.markEmailVerified(String(user._id));
    return { message: 'Email verified' };
  }

  // ─── Login ──────────────────────────────────────────────────────────────────

  async login(
    dto: LoginDto,
  ): Promise<{ user: UserDocument } & TokenPair> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user?.password) {
      throw new UnauthorizedException('Email o contraseña incorrectos.');
    }

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) {
      throw new UnauthorizedException('Email o contraseña incorrectos.');
    }

    if (!user.emailVerified) {
      throw new UnauthorizedException(
        'Por favor verificá tu email antes de ingresar.',
      );
    }

    const userId = String(user._id);
    const tokens = await this.generateTokens(
      userId,
      user.email,
      user.workspaceId,
      user.role,
    );

    await Promise.all([
      this.usersService.updateRefreshToken(userId, tokens.refreshToken),
      this.usersService.updateLastLoginAt(userId),
    ]);

    // Re-fetch without secrets for the response
    const cleanUser = await this.usersService.findById(userId);
    if (!cleanUser) {
      throw new InternalServerErrorException('Error al obtener el usuario.');
    }

    return { user: cleanUser, ...tokens };
  }

  // ─── Refresh Token ──────────────────────────────────────────────────────────

  async refresh(token: string): Promise<TokenPair> {
    let payload: { sub: string };
    try {
      payload = await this.jwtService.verifyAsync<{ sub: string }>(token, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Refresh token inválido.');
    }

    const user = await this.usersService.validateRefreshToken(
      payload.sub,
      token,
    );
    if (!user) {
      throw new UnauthorizedException('Refresh token inválido.');
    }

    const userId = String(user._id);
    const tokens = await this.generateTokens(
      userId,
      user.email,
      user.workspaceId,
      user.role,
    );

    await this.usersService.updateRefreshToken(userId, tokens.refreshToken);
    return tokens;
  }

  // ─── Logout ─────────────────────────────────────────────────────────────────

  async logout(userId: string): Promise<void> {
    await this.usersService.updateRefreshToken(userId, null);
  }

  // ─── Forgot Password ────────────────────────────────────────────────────────

  async forgotPassword(
    dto: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    const user = await this.usersService.findByEmail(dto.email);

    // Always return the same response to avoid leaking email existence
    if (user?.emailVerified) {
      const token = this.generateSecureToken();
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
      await this.usersService.setPasswordResetToken(
        String(user._id),
        token,
        expiresAt,
      );
      await this.mailService.sendPasswordResetEmail(
        dto.email,
        user.name,
        token,
      );
    }

    return { message: 'Reset email sent' };
  }

  // ─── Reset Password ─────────────────────────────────────────────────────────

  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    const user = await this.usersService.findByPasswordResetToken(dto.token);
    if (!user) {
      throw new BadRequestException('Token inválido o expirado.');
    }
    if (
      user.passwordResetTokenExpiresAt &&
      user.passwordResetTokenExpiresAt < new Date()
    ) {
      throw new BadRequestException(
        'El enlace de restablecimiento expiró. Solicitá uno nuevo.',
      );
    }

    await this.usersService.updatePassword(String(user._id), dto.newPassword);
    return { message: 'Password reset successful' };
  }

  // ─── Get Me ─────────────────────────────────────────────────────────────────

  async getMe(userId: string): Promise<UserDocument> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado.');
    }
    return user;
  }

  // ─── Private helpers ────────────────────────────────────────────────────────

  private generateSecureToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private async generateTokens(
    userId: string,
    email: string,
    workspaceId: string,
    role: string,
  ): Promise<TokenPair> {
    const accessPayload = { sub: userId, email, workspaceId, role };
    const refreshPayload = { sub: userId };

    const accessExpiresIn = (
      this.configService.get<string>('JWT_ACCESS_EXPIRES_IN') ?? '15m'
    ) as StringValue;
    const refreshExpiresIn = (
      this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') ?? '7d'
    ) as StringValue;

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(accessPayload, {
        secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
        expiresIn: accessExpiresIn,
      }),
      this.jwtService.signAsync(refreshPayload, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: refreshExpiresIn,
      }),
    ]);

    return { accessToken, refreshToken };
  }
}
