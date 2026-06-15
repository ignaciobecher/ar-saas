import { Body, Controller, HttpCode, HttpStatus, Patch, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { TokenPayload } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UsersService } from './users.service';

class UpdateUserDto {
  name?: string;
  email?: string;
  phone?: string;
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
}
