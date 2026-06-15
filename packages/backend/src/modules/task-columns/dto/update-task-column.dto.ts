import { PartialType } from '@nestjs/swagger';
import { CreateTaskColumnDto } from './create-task-column.dto';

export class UpdateTaskColumnDto extends PartialType(CreateTaskColumnDto) {}
