import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type StockItemDocument = HydratedDocument<StockItem>;

@Schema({ collection: 'stockItems', timestamps: true })
export class StockItem {
  @Prop({ required: true, trim: true })
  sku!: string;

  @Prop({ required: true, trim: true })
  product!: string;

  @Prop({ required: true, min: 0 })
  onHand!: number;

  @Prop({ required: true, min: 0 })
  reorderPoint!: number;

  @Prop({ required: true, trim: true })
  branch!: string;
}

export const StockItemSchema = SchemaFactory.createForClass(StockItem);

StockItemSchema.index({ sku: 1 }, { unique: true });
StockItemSchema.index({ branch: 1, onHand: 1, reorderPoint: 1 });
