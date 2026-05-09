import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { AdminModule } from './admin/admin.module';
import { PosModule } from './pos/pos.module';
import { KafkaModule } from './kafka/kafka.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

let memoryMongoServer: MongoMemoryServer | undefined;

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: async () => {
        const configuredUri = process.env.MONGODB_URI;

        if (configuredUri) {
          return { uri: configuredUri };
        }

        if (!memoryMongoServer) {
          memoryMongoServer = await MongoMemoryServer.create({
            instance: {
              dbName: 'smartstore'
            }
          });
        }

        return {
          uri: memoryMongoServer.getUri()
        };
      }
    }),
    KafkaModule,
    AdminModule,
    PosModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}

