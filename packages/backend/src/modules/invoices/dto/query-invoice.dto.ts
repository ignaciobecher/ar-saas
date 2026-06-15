import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class QueryInvoiceDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ message: 'La búsqueda debe ser un texto' })
  search?: string;

  @ApiPropertyOptional({ enum: ['draft', 'pending', 'paid', 'overdue', 'cancelled'] })
  @IsOptional()
  @IsEnum(['draft', 'pending', 'paid', 'overdue', 'cancelled'], { message: 'El estado no es válido' })
  status?: 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled';

  @ApiPropertyOptional({ enum: ['income', 'expense'] })
  @IsOptional()
  @IsEnum(['income', 'expense'], { message: 'El tipo debe ser "income" o "expense"' })
  type?: 'income' | 'expense';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ message: 'El clientId debe ser un texto' })
  clientId?: string;

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'La página debe ser un número entero' })
  @Min(1, { message: 'La página mínima es 1' })
  page?: number = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El límite debe ser un número entero' })
  @Min(1, { message: 'El límite mínimo es 1' })
  @Max(100, { message: 'El límite máximo es 100' })
  limit?: number = 20;
}
