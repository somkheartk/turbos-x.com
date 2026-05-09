import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PosUserDocument = PosUser & Document;

@Schema({ collection: 'posUsers', timestamps: true })
export class PosUser {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, enum: ['admin', 'manager', 'cashier'] })
  role!: 'admin' | 'manager' | 'cashier';

  @Prop({ required: true, trim: true })
  pin!: string;

  @Prop({ required: true, enum: ['Active', 'Inactive'], default: 'Active' })
  status!: 'Active' | 'Inactive';

  @Prop({ trim: true })
  shift?: string;
}

export const PosUserSchema = SchemaFactory.createForClass(PosUser);

PosUserSchema.index({ name: 1 });
PosUserSchema.index({ role: 1, status: 1 });
