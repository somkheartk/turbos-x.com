import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductsModule } from './products/products.module';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: process.env.MONGODB_URI_CATALOG ?? 'mongodb://localhost:27017/pos_catalog',
      }),
    }),
    ProductsModule,
  ],
})
export class AppModule {}
