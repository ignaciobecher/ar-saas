import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class ChecklistItemDto {
  @ApiProperty({ example: 'Revisar especificaciones' })
  @IsString({ message: 'El texto debe ser un texto' })
  text!: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean({ message: 'completed debe ser un booleano' })
  completed?: boolean;
}
