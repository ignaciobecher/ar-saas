import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { ChecklistItemDto } from './checklist-item.dto';
import { LabelDto } from './label.dto';

export class CreateTaskDto {
  @ApiProperty({ example: 'Implementar login', maxLength: 200 })
  @IsString({ message: 'El título debe ser un texto' })
  @MaxLength(200, { message: 'El título no puede superar los 200 caracteres' })
  title!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ message: 'La descripción debe ser un texto' })
  description?: string;

  @ApiPropertyOptional({ enum: ['todo', 'in-progress', 'done', 'cancelled'], default: 'todo' })
  @IsOptional()
  @IsEnum(['todo', 'in-progress', 'done', 'cancelled'], { message: 'El estado no es válido' })
  status?: 'todo' | 'in-progress' | 'done' | 'cancelled';

  @ApiPropertyOptional({ enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' })
  @IsOptional()
  @IsEnum(['low', 'medium', 'high', 'urgent'], { message: 'La prioridad no es válida' })
  priority?: 'low' | 'medium' | 'high' | 'urgent';

  @ApiPropertyOptional({ example: '2026-03-31' })
  @IsOptional()
  @IsDateString({}, { message: 'La fecha de vencimiento debe ser una fecha válida' })
  dueDate?: string;

  @ApiPropertyOptional({ description: 'ID de la columna (null para sin columna)' })
  @IsOptional()
  @IsString({ message: 'El columnId debe ser un texto' })
  columnId?: string | null;

  @ApiPropertyOptional({ example: 0, minimum: 0 })
  @IsOptional()
  @IsInt({ message: 'El orden debe ser un número entero' })
  @Min(0, { message: 'El orden no puede ser negativo' })
  order?: number;

  @ApiPropertyOptional({ type: [ChecklistItemDto] })
  @IsOptional()
  @IsArray({ message: 'El checklist debe ser un array' })
  @ValidateNested({ each: true })
  @Type(() => ChecklistItemDto)
  checklist?: ChecklistItemDto[];

  @ApiPropertyOptional({ type: [LabelDto] })
  @IsOptional()
  @IsArray({ message: 'Las labels deben ser un array' })
  @ValidateNested({ each: true })
  @Type(() => LabelDto)
  labels?: LabelDto[];
}
