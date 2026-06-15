import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateClientDto {
  @ApiProperty({ example: 'Empresa SA', maxLength: 200 })
  @IsString({ message: 'El nombre debe ser un texto' })
  @MaxLength(200, { message: 'El nombre no puede superar los 200 caracteres' })
  name!: string;

  @ApiPropertyOptional({ example: 'empresa@ejemplo.com' })
  @IsOptional()
  @IsEmail({}, { message: 'El email no tiene un formato válido' })
  email?: string;

  @ApiPropertyOptional({ example: '+54 11 1234-5678' })
  @IsOptional()
  @IsString({ message: 'El teléfono debe ser un texto' })
  phone?: string;

  @ApiPropertyOptional({ example: 'Av. Corrientes 1234, CABA' })
  @IsOptional()
  @IsString({ message: 'La dirección debe ser un texto' })
  address?: string;

  @ApiPropertyOptional({ example: 'Cliente VIP', })
  @IsOptional()
  @IsString({ message: 'Las notas deben ser un texto' })
  notes?: string;

  @ApiPropertyOptional({ enum: ['active', 'archived'], default: 'active' })
  @IsOptional()
  @IsEnum(['active', 'archived'], { message: 'El estado debe ser "active" o "archived"' })
  status?: 'active' | 'archived';
}
