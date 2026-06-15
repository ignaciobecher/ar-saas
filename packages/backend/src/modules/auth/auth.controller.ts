import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { TokenPayload } from '../../common/decorators/current-user.decorator';
import { Cookie } from '../../common/decorators/cookie.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GithubAuthGuard } from '../../common/guards/github-auth.guard';
import { AuthService } from './auth.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { GithubProfile } from './strategies/github.strategy';

interface RequestWithGithubUser extends Request {
  user: GithubProfile;
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  private readonly refreshCookiePath: string;

  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    const prefix = this.configService.get<string>('API_PREFIX', 'api');
    this.refreshCookiePath = `/${prefix}/auth/refresh`;
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Registrar nuevo usuario y workspace' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Get('verify-email')
  @ApiOperation({ summary: 'Verificar email con token' })
  verifyEmail(@Query() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto.token);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Iniciar sesión' })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, accessToken, refreshToken } =
      await this.authService.login(dto);
    this.setTokenCookies(res, accessToken, refreshToken);
    return user;
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Renovar access token usando el refresh token' })
  async refresh(
    @Cookie('refresh_token') cookieToken: string | undefined,
    @Body() dto: RefreshTokenDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = cookieToken ?? dto.refreshToken;
    if (!token) {
      throw new UnauthorizedException('Refresh token no encontrado.');
    }
    const tokens = await this.authService.refresh(token);
    this.setTokenCookies(res, tokens.accessToken, tokens.refreshToken);
    return { message: 'Token refreshed' };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Cerrar sesión' })
  async logout(
    @CurrentUser() user: TokenPayload,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logout(user.userId);
    this.clearTokenCookies(res);
    return { message: 'Logged out' };
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @ApiOperation({ summary: 'Solicitar restablecimiento de contraseña' })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @ApiOperation({ summary: 'Restablecer contraseña con token del email' })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtener perfil del usuario autenticado' })
  getMe(@CurrentUser() user: TokenPayload) {
    return this.authService.getMe(user.userId);
  }

  @Get('github')
  @UseGuards(GithubAuthGuard)
  @ApiOperation({ summary: 'Iniciar autenticación con GitHub' })
  githubLogin(): void {}

  @Get('github/callback')
  @UseGuards(GithubAuthGuard)
  @ApiOperation({ summary: 'Callback de GitHub OAuth' })
  async githubCallback(
    @Req() req: RequestWithGithubUser,
    @Res() res: Response,
  ): Promise<void> {
    const frontendUrl = this.configService.getOrThrow<string>('FRONTEND_URL');
    try {
      const { code, alreadyExisted } = await this.authService.githubLogin(req.user);
      const info = alreadyExisted ? '&info=already_exists' : '';
      res.redirect(`${frontendUrl}/auth/github/callback?code=${code}${info}`);
    } catch {
      res.redirect(`${frontendUrl}/auth/github/callback?error=github_failed`);
    }
  }

  @Post('github/exchange')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Intercambiar código OAuth por sesión' })
  async githubExchange(
    @Body('code') code: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!code) {
      throw new UnauthorizedException('Código requerido.');
    }
    const { alreadyExisted, accessToken, refreshToken } =
      await this.authService.exchangeGithubCode(code);
    this.setTokenCookies(res, accessToken, refreshToken);
    return { success: true, alreadyExisted };
  }

  private setTokenCookies(
    res: Response,
    accessToken: string,
    refreshToken: string,
  ): void {
    const isProd = this.configService.get<string>('NODE_ENV') === 'production';
    const base = {
      httpOnly: true,
      secure: isProd,
      sameSite: (isProd ? 'none' : 'lax') as 'none' | 'lax',
      ...(isProd && { partitioned: true }),
    };

    res.cookie('access_token', accessToken, {
      ...base,
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refresh_token', refreshToken, {
      ...base,
      path: this.refreshCookiePath,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  private clearTokenCookies(res: Response): void {
    const isProd = this.configService.get<string>('NODE_ENV') === 'production';
    const base = {
      httpOnly: true,
      secure: isProd,
      sameSite: (isProd ? 'none' : 'lax') as 'none' | 'lax',
      ...(isProd && { partitioned: true }),
    };

    res.clearCookie('access_token', base);
    res.clearCookie('refresh_token', {
      ...base,
      path: this.refreshCookiePath,
    });
  }
}
