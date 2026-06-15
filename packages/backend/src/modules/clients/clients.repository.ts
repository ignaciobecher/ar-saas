import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../../common/base/base.repository';
import { Client, ClientDocument } from './schemas/client.schema';

@Injectable()
export class ClientsRepository extends BaseRepository<ClientDocument> {
  constructor(
    @InjectModel(Client.name) private readonly clientModel: Model<ClientDocument>,
  ) {
    super(clientModel);
  }
}
