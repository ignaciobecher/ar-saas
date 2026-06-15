import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientsModule } from '../clients/clients.module';
import { Deal, DealSchema } from './schemas/deal.schema';
import { PipelineController } from './pipeline.controller';
import { PipelineRepository } from './pipeline.repository';
import { PipelineService } from './pipeline.service';

@Module({
  imports: [
    ClientsModule,
    MongooseModule.forFeature([{ name: Deal.name, schema: DealSchema }]),
  ],
  controllers: [PipelineController],
  providers: [PipelineService, PipelineRepository],
  exports: [PipelineService],
})
export class PipelineModule {}
