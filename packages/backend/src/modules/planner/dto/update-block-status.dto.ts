import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export class UpdateBlockStatusDto {
  @ApiProperty({ enum: ['pending', 'in-progress', 'completed', 'skipped'] })
  @IsEnum(['pending', 'in-progress', 'completed', 'skipped'], {
    message: 'El estado debe ser "pending", "in-progress", "completed" o "skipped"',
  })
  status!: 'pending' | 'in-progress' | 'completed' | 'skipped';
}
