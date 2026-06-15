import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class ReorderColumnsDto {
  @ApiProperty({ example: ['id1', 'id2', 'id3'], description: 'IDs de columnas en el nuevo orden' })
  @IsArray({ message: 'Los ids deben ser un array' })
  @IsString({ each: true, message: 'Cada id debe ser un texto' })
  ids!: string[];
}
