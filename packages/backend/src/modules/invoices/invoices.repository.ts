import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../../common/base/base.repository';
import { Invoice, InvoiceDocument } from './schemas/invoice.schema';

@Injectable()
export class InvoicesRepository extends BaseRepository<InvoiceDocument> {
  constructor(
    @InjectModel(Invoice.name) private readonly invoiceModel: Model<InvoiceDocument>,
  ) {
    super(invoiceModel);
  }
}
