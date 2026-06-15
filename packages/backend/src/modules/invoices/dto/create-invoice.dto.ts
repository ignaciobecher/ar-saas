import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { InvoiceItemDto } from './invoice-item.dto';

export class CreateInvoiceDto {
  @ApiPropertyOptional({ enum: ['income', 'expense'], default: 'income' })
  @IsOptional()
  @IsEnum(['income', 'expense'], { message: 'El tipo debe ser "income" o "expense"' })
  type?: 'income' | 'expense';

  @ApiPropertyOptional({ example: 'FAC-001' })
  @IsOptional()
  @IsString({ message: 'El número debe ser un texto' })
  number?: string;

  @ApiPropertyOptional({ description: 'ID del cliente' })
  @IsOptional()
  @IsString({ message: 'El clientId debe ser un texto' })
  clientId?: string;

  @ApiPropertyOptional({
    enum: ['draft', 'pending', 'paid', 'overdue', 'cancelled'],
    default: 'draft',
  })
  @IsOptional()
  @IsEnum(['draft', 'pending', 'paid', 'overdue', 'cancelled'], {
    message: 'El estado no es válido',
  })
  status?: 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled';

  @ApiPropertyOptional({ example: '2026-01-15' })
  @IsOptional()
  @IsDateString({}, { message: 'La fecha de emisión debe ser una fecha válida' })
  issueDate?: string;

  @ApiPropertyOptional({ example: '2026-02-15' })
  @IsOptional()
  @IsDateString({}, { message: 'La fecha de vencimiento debe ser una fecha válida' })
  dueDate?: string;

  @ApiPropertyOptional({ type: [InvoiceItemDto] })
  @IsOptional()
  @IsArray({ message: 'Los ítems deben ser un array' })
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  items?: InvoiceItemDto[];

  @ApiPropertyOptional({ example: 21, minimum: 0 })
  @IsOptional()
  @IsNumber({}, { message: 'La tasa de impuesto debe ser un número' })
  @Min(0, { message: 'La tasa de impuesto no puede ser negativa' })
  taxRate?: number;

  @ApiPropertyOptional({ example: 'USD' })
  @IsOptional()
  @IsString({ message: 'La moneda debe ser un texto' })
  currency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ message: 'Las notas deben ser un texto' })
  notes?: string;

  @ApiPropertyOptional({ example: 1000, minimum: 0 })
  @IsOptional()
  @IsNumber({}, { message: 'El total debe ser un número' })
  @Min(0, { message: 'El total no puede ser negativo' })
  total?: number;
}
