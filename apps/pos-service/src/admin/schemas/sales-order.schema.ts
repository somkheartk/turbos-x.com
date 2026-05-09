import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SalesOrderDocument = HydratedDocument<SalesOrder>;

@Schema({ collection: 'salesOrders', timestamps: true })
export class SalesOrder {
  @Prop({ required: true, trim: true })
  orderNumber!: string;

  @Prop({ required: true, trim: true })
  customerName!: string;

  @Prop({ required: true, trim: true })
  channel!: string;

  @Prop({ required: true, trim: true })
  branch!: string;

  @Prop({ required: true, min: 0 })
  totalAmount!: number;

  @Prop({ required: true, min: 1 })
  itemCount!: number;

  @Prop({ required: true, enum: ['New', 'Packing', 'Ready to ship', 'Completed', 'Payment issue'] })
  status!: 'New' | 'Packing' | 'Ready to ship' | 'Completed' | 'Payment issue';

  @Prop({ required: true })
  placedAt!: Date;

  @Prop({ trim: true })
  assignedTo?: string;
}

export const SalesOrderSchema = SchemaFactory.createForClass(SalesOrder);

SalesOrderSchema.index({ orderNumber: 1 }, { unique: true });
SalesOrderSchema.index({ status: 1, updatedAt: -1 });
SalesOrderSchema.index({ branch: 1, status: 1 });