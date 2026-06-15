import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LabelDto {
  @ApiProperty({ example: 'Bug' })
  @IsString({ message: 'El nombre debe ser un texto' })
  name!: string;

  @ApiProperty({ example: '#EF4444' })
  @IsString({ message: 'El color debe ser un texto' })
  color!: string;
}
