import { IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateWorkspaceDto {
  @ApiProperty({ example: 'Mi Empresa' })
  @IsString()
  @MaxLength(80)
  name!: string;
}
