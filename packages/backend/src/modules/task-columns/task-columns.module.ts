import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TaskColumn, TaskColumnSchema } from './schemas/task-column.schema';
import { TaskColumnsController } from './task-columns.controller';
import { TaskColumnsRepository } from './task-columns.repository';
import { TaskColumnsService } from './task-columns.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: TaskColumn.name, schema: TaskColumnSchema }]),
  ],
  controllers: [TaskColumnsController],
  providers: [TaskColumnsService, TaskColumnsRepository],
  exports: [TaskColumnsService],
})
export class TaskColumnsModule {}
