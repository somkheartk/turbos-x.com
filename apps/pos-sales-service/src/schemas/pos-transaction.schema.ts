import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PosTransactionDocument = HydratedDocument<PosTransaction>;

class TransactionItem {
  productSku!: string;
  productName!: string;
  qty!: number;
  unitPrice!: number;
  lineTotal!: number;
}

@Schema({ collection: 'posTransactions', timestamps: true })
export class PosTransaction {
  @Prop({ required: true, trim: true })
  transactionId!: string;

  @Prop({ type: [Object], required: true })
  items!: TransactionItem[];

  @Prop({ required: true, min: 0 })
  subtotal!: number;

  @Prop({ required: true, min: 0, default: 0 })
  discount!: number;

  @Prop({ required: true, min: 0 })
  total!: number;

  @Prop({ required: true, enum: ['Cash', 'QR', 'Card'] })
  paymentMethod!: 'Cash' | 'QR' | 'Card';

  @Prop({ min: 0, default: 0 })
  cashReceived!: number;

  @Prop({ min: 0, default: 0 })
  changeAmount!: number;

  @Prop({ required: true, trim: true })
  cashierName!: string;

  @Prop({ required: true, enum: ['Completed', 'Voided'], default: 'Completed' })
  status!: 'Completed' | 'Voided';
}

export const PosTransactionSchema = SchemaFactory.createForClass(PosTransaction);

PosTransactionSchema.index({ transactionId: 1 }, { unique: true });
PosTransactionSchema.index({ status: 1, createdAt: -1 });
PosTransactionSchema.index({ cashierName: 1, createdAt: -1 });
