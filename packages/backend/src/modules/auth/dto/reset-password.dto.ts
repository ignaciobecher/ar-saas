import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ description: 'Token de reset recibido por email' })
  @IsString({ message: 'El token debe ser texto' })
  @IsNotEmpty({ message: 'El token es obligatorio' })
  token!: string;

  @ApiProperty({ minLength: 8 })
  @IsString({ message: 'La nueva contraseña debe ser texto' })
  @MinLength(8, {
    message: 'La nueva contraseña debe tener al menos 8 caracteres',
  })
  newPassword!: string;
}
