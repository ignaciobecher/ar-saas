import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class QueryTaskDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ message: 'La búsqueda debe ser un texto' })
  search?: string;

  @ApiPropertyOptional({ enum: ['todo', 'in-progress', 'done', 'cancelled'] })
  @IsOptional()
  @IsEnum(['todo', 'in-progress', 'done', 'cancelled'], { message: 'El estado no es válido' })
  status?: 'todo' | 'in-progress' | 'done' | 'cancelled';

  @ApiPropertyOptional({ enum: ['low', 'medium', 'high', 'urgent'] })
  @IsOptional()
  @IsEnum(['low', 'medium', 'high', 'urgent'], { message: 'La prioridad no es válida' })
  priority?: 'low' | 'medium' | 'high' | 'urgent';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ message: 'El columnId debe ser un texto' })
  columnId?: string;

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'La página debe ser un número entero' })
  @Min(1, { message: 'La página mínima es 1' })
  page?: number = 1;

  @ApiPropertyOptional({ default: 100, minimum: 1, maximum: 200 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El límite debe ser un número entero' })
  @Min(1, { message: 'El límite mínimo es 1' })
  @Max(200, { message: 'El límite máximo es 200' })
  limit?: number = 100;
}
