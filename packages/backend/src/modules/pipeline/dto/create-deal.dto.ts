import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateDealDto {
  @ApiProperty({ example: 'Proyecto de integración', maxLength: 200 })
  @IsString({ message: 'El título debe ser un texto' })
  @MaxLength(200, { message: 'El título no puede superar los 200 caracteres' })
  title!: string;

  @ApiPropertyOptional({ description: 'ID del cliente' })
  @IsOptional()
  @IsString({ message: 'El clientId debe ser un texto' })
  clientId?: string;

  @ApiPropertyOptional({ example: 5000, minimum: 0 })
  @IsOptional()
  @IsNumber({}, { message: 'El valor debe ser un número' })
  @Min(0, { message: 'El valor no puede ser negativo' })
  value?: number;

  @ApiPropertyOptional({ example: 'USD' })
  @IsOptional()
  @IsString({ message: 'La moneda debe ser un texto' })
  currency?: string;

  @ApiPropertyOptional({ enum: ['lead', 'contacted', 'proposal', 'won', 'lost'], default: 'lead' })
  @IsOptional()
  @IsEnum(['lead', 'contacted', 'proposal', 'won', 'lost'], { message: 'El stage no es válido' })
  stage?: 'lead' | 'contacted' | 'proposal' | 'won' | 'lost';

  @ApiPropertyOptional({ example: '2026-03-31' })
  @IsOptional()
  @IsDateString({}, { message: 'La fecha de cierre esperada debe ser una fecha válida' })
  expectedCloseDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ message: 'Las notas deben ser un texto' })
  notes?: string;
}
