import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PosUser, PosUserSchema } from '../schemas/pos-user.schema';
import { KafkaModule } from '../kafka/kafka.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: PosUser.name, schema: PosUserSchema }]),
    KafkaModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class PosUsersModule {}
