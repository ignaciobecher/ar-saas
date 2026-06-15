import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateTaskColumnDto {
  @ApiProperty({ example: 'En progreso', maxLength: 100 })
  @IsString({ message: 'El nombre debe ser un texto' })
  @MaxLength(100, { message: 'El nombre no puede superar los 100 caracteres' })
  name!: string;

  @ApiPropertyOptional({ example: '#6B7280' })
  @IsOptional()
  @IsString({ message: 'El color debe ser un texto' })
  color?: string;

  @ApiPropertyOptional({ example: 0, minimum: 0 })
  @IsOptional()
  @IsInt({ message: 'El orden debe ser un número entero' })
  @Min(0, { message: 'El orden no puede ser negativo' })
  order?: number;
}
