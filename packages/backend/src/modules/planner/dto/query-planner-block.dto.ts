import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Matches, Max, Min } from 'class-validator';

export class QueryPlannerBlockDto {
  @ApiPropertyOptional({ example: '2026-06-15', description: 'Fecha exacta YYYY-MM-DD' })
  @IsOptional()
  @IsString({ message: 'La fecha debe ser un texto' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'La fecha debe tener el formato YYYY-MM-DD' })
  date?: string;

  @ApiPropertyOptional({ example: '2026-06-01' })
  @IsOptional()
  @IsString({ message: 'La fecha desde debe ser un texto' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'La fecha desde debe tener el formato YYYY-MM-DD' })
  dateFrom?: string;

  @ApiPropertyOptional({ example: '2026-06-30' })
  @IsOptional()
  @IsString({ message: 'La fecha hasta debe ser un texto' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'La fecha hasta debe tener el formato YYYY-MM-DD' })
  dateTo?: string;

  @ApiPropertyOptional({ enum: ['pending', 'in-progress', 'completed', 'skipped'] })
  @IsOptional()
  @IsEnum(['pending', 'in-progress', 'completed', 'skipped'], { message: 'El estado no es válido' })
  status?: 'pending' | 'in-progress' | 'completed' | 'skipped';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ message: 'La categoría debe ser un texto' })
  category?: string;

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'La página debe ser un número entero' })
  @Min(1, { message: 'La página mínima es 1' })
  page?: number = 1;

  @ApiPropertyOptional({ default: 50, minimum: 1, maximum: 200 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El límite debe ser un número entero' })
  @Min(1, { message: 'El límite mínimo es 1' })
  @Max(200, { message: 'El límite máximo es 200' })
  limit?: number = 50;
}
