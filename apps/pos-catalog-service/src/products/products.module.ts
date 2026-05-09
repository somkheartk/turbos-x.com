import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CatalogProduct, CatalogProductSchema } from '../schemas/catalog-product.schema';
import { KafkaModule } from '../kafka/kafka.module';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { KafkaConsumer } from './kafka.consumer';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: CatalogProduct.name, schema: CatalogProductSchema }]),
    KafkaModule,
  ],
  providers: [ProductsService, KafkaConsumer],
  controllers: [ProductsController],
})
export class ProductsModule {}
