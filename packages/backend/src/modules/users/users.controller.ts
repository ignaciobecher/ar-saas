import { BadRequestException, Body, Controller, HttpCode, HttpStatus, Patch, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { TokenPayload } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UsersService } from './users.service';
import * as bcrypt from 'bcryptjs';

class UpdateUserDto {
  name?: string;
  email?: string;
  phone?: string;
}

class ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch('me')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Actualizar perfil del usuario autenticado' })
  async updateMe(
    @CurrentUser() user: TokenPayload,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.updateMe(user.userId, dto);
  }

  @Patch('me/password')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Cambiar contraseña del usuario autenticado' })
  async changePassword(
    @CurrentUser() user: TokenPayload,
    @Body() dto: ChangePasswordDto,
  ) {
    const existingUser = await this.usersService.findByIdWithPassword(user.userId);
    if (!existingUser?.password) {
      throw new BadRequestException('No se puede cambiar la contraseña de esta cuenta.');
    }
    const valid = await bcrypt.compare(dto.currentPassword, existingUser.password);
    if (!valid) {
      throw new BadRequestException('La contraseña actual es incorrecta.');
    }
    await this.usersService.updatePassword(user.userId, dto.newPassword);
    return { message: 'Contraseña actualizada correctamente.' };
  }
}
