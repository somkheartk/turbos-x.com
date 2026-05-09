import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PosTransaction, PosTransactionSchema } from '../schemas/pos-transaction.schema';
import { KafkaModule } from '../kafka/kafka.module';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PosTransaction.name, schema: PosTransactionSchema },
    ]),
    KafkaModule,
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService],
})
export class PosTransactionsModule {}
