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
import { GithubProfile } from './strategies/github.strategy';

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

interface OAuthCode {
  userId: string;
  alreadyExisted: boolean;
  expiresAt: number;
}

@Injectable()
export class AuthService {
  private readonly oauthCodes = new Map<string, OAuthCode>();

  constructor(
    private readonly usersService: UsersService,
    private readonly workspacesService: WorkspacesService,
    private readonly mailService: MailService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<{ message: string }> {
    const user = await this.usersService.create({
      name: dto.name,
      email: dto.email,
      password: dto.password,
      workspaceId: '',
    });
    const userId = String(user._id);

    try {
      const workspace = await this.workspacesService.create(userId, dto.name);
      const workspaceId = String(workspace._id);

      await this.usersService.updateWorkspaceId(userId, workspaceId);

      const token = this.generateSecureToken();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await this.usersService.setEmailVerificationToken(userId, token, expiresAt);
      await this.mailService.sendVerificationEmail(dto.email, dto.name, token);

      return { message: 'Verification email sent' };
    } catch (error) {
      await this.usersService.delete(userId);
      throw error;
    }
  }

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

  async login(
    dto: LoginDto,
  ): Promise<{ user: UserDocument } & TokenPair> {
    const user = await this.usersService.findByEmailWithPassword(dto.email);
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

    const cleanUser = await this.usersService.findById(userId);
    if (!cleanUser) {
      throw new InternalServerErrorException('Error al obtener el usuario.');
    }

    return { user: cleanUser, ...tokens };
  }

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

  async logout(userId: string): Promise<void> {
    await this.usersService.updateRefreshToken(userId, null);
  }

  async forgotPassword(
    dto: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    const user = await this.usersService.findByEmail(dto.email);

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

  async githubLogin(
    profile: GithubProfile,
  ): Promise<{ code: string; alreadyExisted: boolean }> {
    let alreadyExisted = false;
    let user = await this.usersService.findByGithubId(profile.githubId);

    if (!user) {
      const existingByEmail = await this.usersService.findByEmail(profile.email);
      if (existingByEmail) {
        const existingId = String(existingByEmail._id);
        await this.usersService.linkGithubId(existingId, profile.githubId);
        if (!existingByEmail.emailVerified) {
          await this.usersService.markEmailVerified(existingId);
        }
        user = await this.usersService.findById(existingId);
        alreadyExisted = true;
      } else {
        user = await this.usersService.createGithubUser({
          name: profile.name,
          email: profile.email,
          githubId: profile.githubId,
          workspaceId: '',
        });
        const userId = String(user._id);
        const workspace = await this.workspacesService.create(userId, profile.name);
        const workspaceId = String(workspace._id);
        await this.usersService.updateWorkspaceId(userId, workspaceId);
        user = await this.usersService.findById(userId);
      }
    } else {
      alreadyExisted = true;
    }

    if (!user) {
      throw new InternalServerErrorException('Error al obtener el usuario.');
    }

    const userId = String(user._id);
    await this.usersService.updateLastLoginAt(userId);

    const code = crypto.randomBytes(32).toString('hex');
    this.oauthCodes.set(code, {
      userId,
      alreadyExisted,
      expiresAt: Date.now() + 30_000,
    });

    return { code, alreadyExisted };
  }

  async exchangeGithubCode(
    code: string,
  ): Promise<{ alreadyExisted: boolean } & TokenPair> {
    const entry = this.oauthCodes.get(code);
    if (!entry || entry.expiresAt < Date.now()) {
      this.oauthCodes.delete(code);
      throw new UnauthorizedException('Código inválido o expirado.');
    }
    this.oauthCodes.delete(code);

    const user = await this.usersService.findById(entry.userId);
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado.');
    }

    const tokens = await this.generateTokens(
      entry.userId,
      user.email,
      user.workspaceId,
      user.role,
    );
    await this.usersService.updateRefreshToken(entry.userId, tokens.refreshToken);

    return { alreadyExisted: entry.alreadyExisted, ...tokens };
  }

  async getMe(userId: string): Promise<UserDocument> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado.');
    }
    return user;
  }

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
