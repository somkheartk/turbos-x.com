import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PosSessionDocument = HydratedDocument<PosSession>;

@Schema({ collection: 'posSessions', timestamps: true })
export class PosSession {
  @Prop({ required: true, trim: true })
  counter!: string;

  @Prop({ required: true, trim: true })
  cashier!: string;

  @Prop({ required: true, trim: true })
  shift!: string;

  @Prop({ required: true, enum: ['Open', 'Closing soon', 'Closed'] })
  status!: 'Open' | 'Closing soon' | 'Closed';

  @Prop({ required: true, min: 0 })
  transactionCount!: number;

  @Prop({ required: true, min: 0 })
  averageBasket!: number;

  @Prop({ required: true, min: 0 })
  returnsPending!: number;
}

export const PosSessionSchema = SchemaFactory.createForClass(PosSession);

PosSessionSchema.index({ status: 1, counter: 1 });
PosSessionSchema.index({ cashier: 1, status: 1 });
