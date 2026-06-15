import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiPropertyOptional({
    description:
      'Refresh token (opcional — se lee de la cookie refresh_token si no se provee)',
  })
  @IsString({ message: 'El token debe ser texto' })
  @IsOptional()
  refreshToken?: string;
}
