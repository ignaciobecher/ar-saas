import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseSchema } from '../../../common/base/base.schema';

export type InvoiceDocument = HydratedDocument<Invoice>;

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

@Schema({ collection: 'invoices', timestamps: true })
export class Invoice extends BaseSchema {
  @Prop({ type: String, enum: ['income', 'expense'], default: 'income' })
  type!: 'income' | 'expense';

  @Prop({ trim: true })
  number!: string;

  @Prop()
  clientId!: string;

  @Prop({
    type: String,
    enum: ['draft', 'pending', 'paid', 'overdue', 'cancelled'],
    default: 'draft',
  })
  status!: 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled';

  @Prop({ type: Date, required: true, default: Date.now })
  issueDate!: Date;

  @Prop({ type: Date })
  dueDate!: Date;

  @Prop({
    type: [
      {
        description: { type: String, required: true },
        quantity: { type: Number, required: true, default: 1 },
        unitPrice: { type: Number, required: true },
        amount: { type: Number, required: true },
      },
    ],
    default: [],
  })
  items!: InvoiceItem[];

  @Prop({ default: 0 })
  subtotal!: number;

  @Prop({ default: 0 })
  taxRate!: number;

  @Prop({ default: 0 })
  taxAmount!: number;

  @Prop({ default: 0 })
  total!: number;

  @Prop({ default: 'USD', trim: true, uppercase: true })
  currency!: string;

  @Prop({ trim: true })
  notes!: string;
}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice);

InvoiceSchema.index({ workspaceId: 1, status: 1 });
InvoiceSchema.index({ workspaceId: 1, type: 1 });
InvoiceSchema.index({ workspaceId: 1, clientId: 1 });
InvoiceSchema.index({ workspaceId: 1, createdAt: -1 });
