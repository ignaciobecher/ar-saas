import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateNotificationDto {
  @ApiProperty({ description: 'ID del usuario destinatario' })
  @IsString({ message: 'El userId debe ser un texto' })
  userId!: string;

  @ApiProperty({ example: 'Nueva factura recibida', maxLength: 120 })
  @IsString({ message: 'El título debe ser un texto' })
  @MaxLength(120, { message: 'El título no puede superar los 120 caracteres' })
  title!: string;

  @ApiProperty({ example: 'Se recibió una factura por $1200', maxLength: 500 })
  @IsString({ message: 'El mensaje debe ser un texto' })
  @MaxLength(500, { message: 'El mensaje no puede superar los 500 caracteres' })
  message!: string;

  @ApiPropertyOptional({ enum: ['info', 'warning', 'success', 'error'], default: 'info' })
  @IsOptional()
  @IsEnum(['info', 'warning', 'success', 'error'], {
    message: 'El tipo debe ser "info", "warning", "success" o "error"',
  })
  type?: 'info' | 'warning' | 'success' | 'error';

  @ApiPropertyOptional({ example: '/invoices/123' })
  @IsOptional()
  @IsString({ message: 'El link debe ser un texto' })
  link?: string;

  @ApiPropertyOptional({ example: '507f1f77bcf86cd799439011' })
  @IsOptional()
  @IsString({ message: 'El refId debe ser un texto' })
  refId?: string;

  @ApiPropertyOptional({ example: 'invoice' })
  @IsOptional()
  @IsString({ message: 'El refType debe ser un texto' })
  refType?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean({ message: 'isRead debe ser un booleano' })
  isRead?: boolean;
}
