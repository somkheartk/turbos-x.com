import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PurchaseOrderDocument = HydratedDocument<PurchaseOrder>;

@Schema({ collection: 'purchaseOrders', timestamps: true })
export class PurchaseOrder {
  @Prop({ required: true, trim: true })
  po!: string;

  @Prop({ required: true, trim: true })
  supplier!: string;

  @Prop({ required: true, min: 0 })
  amount!: number;

  @Prop({ required: true, enum: ['Pending approval', 'Waiting delivery', 'Draft', 'Approved'] })
  status!: 'Pending approval' | 'Waiting delivery' | 'Draft' | 'Approved';

  @Prop()
  approvedAt?: Date;

  @Prop()
  expectedDeliveryDate?: Date;
}

export const PurchaseOrderSchema = SchemaFactory.createForClass(PurchaseOrder);

PurchaseOrderSchema.index({ po: 1 }, { unique: true });
PurchaseOrderSchema.index({ status: 1, updatedAt: -1 });
PurchaseOrderSchema.index({ supplier: 1, status: 1 });