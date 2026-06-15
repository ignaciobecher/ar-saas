import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PlannerBlock, PlannerBlockSchema } from './schemas/planner-block.schema';
import { PlannerController } from './planner.controller';
import { PlannerRepository } from './planner.repository';
import { PlannerService } from './planner.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: PlannerBlock.name, schema: PlannerBlockSchema }]),
  ],
  controllers: [PlannerController],
  providers: [PlannerService, PlannerRepository],
  exports: [PlannerService],
})
export class PlannerModule {}
