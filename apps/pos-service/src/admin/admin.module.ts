import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminController } from './admin.controller';
import { AdminRepository } from './admin.repository';
import { AdminService } from './admin.service';
import { CatalogProduct, CatalogProductSchema } from './schemas/catalog-product.schema';
import { PosSession, PosSessionSchema } from './schemas/pos-session.schema';
import { PurchaseOrder, PurchaseOrderSchema } from './schemas/purchase-order.schema';
import { SalesOrder, SalesOrderSchema } from './schemas/sales-order.schema';
import { StockItem, StockItemSchema } from './schemas/stock-item.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: StockItem.name, schema: StockItemSchema },
      { name: PosSession.name, schema: PosSessionSchema },
      { name: PurchaseOrder.name, schema: PurchaseOrderSchema },
      { name: SalesOrder.name, schema: SalesOrderSchema },
      { name: CatalogProduct.name, schema: CatalogProductSchema }
    ])
  ],
  controllers: [AdminController],
  providers: [AdminService, AdminRepository],
  exports: [AdminService],
})
export class AdminModule {}
