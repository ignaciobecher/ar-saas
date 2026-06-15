import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, Min } from 'class-validator';

export class InvoiceItemDto {
  @ApiProperty({ example: 'Consultoría mensual' })
  @IsString({ message: 'La descripción debe ser un texto' })
  description!: string;

  @ApiProperty({ example: 1, minimum: 0 })
  @IsNumber({}, { message: 'La cantidad debe ser un número' })
  @Min(0, { message: 'La cantidad no puede ser negativa' })
  quantity!: number;

  @ApiProperty({ example: 1000, minimum: 0 })
  @IsNumber({}, { message: 'El precio unitario debe ser un número' })
  @Min(0, { message: 'El precio unitario no puede ser negativo' })
  unitPrice!: number;

  @ApiProperty({ example: 1000, minimum: 0 })
  @IsNumber({}, { message: 'El monto debe ser un número' })
  @Min(0, { message: 'El monto no puede ser negativo' })
  amount!: number;
}
