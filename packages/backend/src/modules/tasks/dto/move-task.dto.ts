import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min, ValidateIf } from 'class-validator';

export class MoveTaskDto {
  @ApiProperty({ description: 'ID de la columna destino o null para sin columna', nullable: true })
  @ValidateIf((o: MoveTaskDto) => o.columnId !== null)
  @IsString({ message: 'El columnId debe ser un texto' })
  columnId!: string | null;

  @ApiPropertyOptional({ example: 0, minimum: 0 })
  @IsOptional()
  @IsInt({ message: 'El orden debe ser un número entero' })
  @Min(0, { message: 'El orden no puede ser negativo' })
  order?: number;
}
