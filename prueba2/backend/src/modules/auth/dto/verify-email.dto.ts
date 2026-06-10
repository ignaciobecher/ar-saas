import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyEmailDto {
  @ApiProperty({ description: 'Token de verificación recibido por email' })
  @IsString({ message: 'El token debe ser texto' })
  @IsNotEmpty({ message: 'El token es obligatorio' })
  token!: string;
}
