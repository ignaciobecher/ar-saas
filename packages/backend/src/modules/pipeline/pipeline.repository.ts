import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../../common/base/base.repository';
import { Deal, DealDocument } from './schemas/deal.schema';

@Injectable()
export class PipelineRepository extends BaseRepository<DealDocument> {
  constructor(
    @InjectModel(Deal.name) private readonly dealModel: Model<DealDocument>,
  ) {
    super(dealModel);
  }
}
