import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsEnum, IsInt, IsOptional, IsString, Matches, MaxLength, Min } from 'class-validator';

export class CreatePlannerBlockDto {
  @ApiProperty({ example: '2026-06-15', description: 'Fecha en formato YYYY-MM-DD' })
  @IsString({ message: 'La fecha debe ser un texto' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'La fecha debe tener el formato YYYY-MM-DD' })
  date!: string;

  @ApiProperty({ example: '09:00', description: 'Hora de inicio en formato HH:mm' })
  @IsString({ message: 'La hora de inicio debe ser un texto' })
  @Matches(/^\d{2}:\d{2}$/, { message: 'La hora de inicio debe tener el formato HH:mm' })
  startTime!: string;

  @ApiProperty({ example: '10:30', description: 'Hora de fin en formato HH:mm' })
  @IsString({ message: 'La hora de fin debe ser un texto' })
  @Matches(/^\d{2}:\d{2}$/, { message: 'La hora de fin debe tener el formato HH:mm' })
  endTime!: string;

  @ApiProperty({ example: 'Reunión con cliente', maxLength: 120 })
  @IsString({ message: 'El título debe ser un texto' })
  @MaxLength(120, { message: 'El título no puede superar los 120 caracteres' })
  title!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ message: 'La descripción debe ser un texto' })
  description?: string;

  @ApiPropertyOptional({ example: 'work', default: 'work' })
  @IsOptional()
  @IsString({ message: 'La categoría debe ser un texto' })
  category?: string;

  @ApiPropertyOptional({ enum: ['low', 'medium', 'high'], default: 'medium' })
  @IsOptional()
  @IsEnum(['low', 'medium', 'high'], { message: 'La prioridad no es válida' })
  priority?: 'low' | 'medium' | 'high';

  @ApiPropertyOptional({ enum: ['pending', 'in-progress', 'completed', 'skipped'], default: 'pending' })
  @IsOptional()
  @IsEnum(['pending', 'in-progress', 'completed', 'skipped'], { message: 'El estado no es válido' })
  status?: 'pending' | 'in-progress' | 'completed' | 'skipped';

  @ApiPropertyOptional({ example: '#2563EB' })
  @IsOptional()
  @IsString({ message: 'El color debe ser un texto' })
  color?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean({ message: 'isFocusBlock debe ser un booleano' })
  isFocusBlock?: boolean;

  @ApiPropertyOptional({ example: 0, minimum: 0 })
  @IsOptional()
  @IsInt({ message: 'El orden debe ser un número entero' })
  @Min(0, { message: 'El orden no puede ser negativo' })
  order?: number;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray({ message: 'Los tags deben ser un array' })
  @IsString({ each: true, message: 'Cada tag debe ser un texto' })
  tags?: string[];
}
