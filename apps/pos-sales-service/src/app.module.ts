import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PosTransactionsModule } from './transactions/transactions.module';
import { PosUsersModule } from './users/users.module';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: process.env.MONGODB_URI ?? 'mongodb://localhost:27017/smartstore',
      }),
    }),
    PosTransactionsModule,
    PosUsersModule,
  ],
})
export class AppModule {}
