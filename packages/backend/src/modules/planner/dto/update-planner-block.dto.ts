import { PartialType } from '@nestjs/swagger';
import { CreatePlannerBlockDto } from './create-planner-block.dto';

export class UpdatePlannerBlockDto extends PartialType(CreatePlannerBlockDto) {}
