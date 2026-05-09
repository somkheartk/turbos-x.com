import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CatalogProductDocument = HydratedDocument<CatalogProduct>;

@Schema({ collection: 'catalogProducts', timestamps: true })
export class CatalogProduct {
  @Prop({ required: true, trim: true }) sku!: string;
  @Prop({ required: true, trim: true }) name!: string;
  @Prop({ required: true, trim: true }) category!: string;
  @Prop({ required: true, min: 0 }) price!: number;
  @Prop({ required: true, min: 0 }) stockOnHand!: number;
  @Prop({ required: true, enum: ['Active', 'Draft', 'Archived'] }) status!: 'Active' | 'Draft' | 'Archived';
  @Prop({ type: [String], default: [] }) channels!: string[];
  @Prop({ trim: true }) updatedBy?: string;
}

export const CatalogProductSchema = SchemaFactory.createForClass(CatalogProduct);
CatalogProductSchema.index({ sku: 1 }, { unique: true });
CatalogProductSchema.index({ category: 1, status: 1 });
