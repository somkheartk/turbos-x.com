import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  DEFAULT_CATALOG_PRODUCTS,
  DEFAULT_POS_SESSIONS,
  DEFAULT_PURCHASE_ORDERS,
  DEFAULT_SALES_ORDERS,
  DEFAULT_STOCK_ITEMS
} from './admin.seed';
import { CatalogProduct, CatalogProductDocument } from './schemas/catalog-product.schema';
import { PosSession, PosSessionDocument } from './schemas/pos-session.schema';
import { PurchaseOrder, PurchaseOrderDocument } from './schemas/purchase-order.schema';
import { SalesOrder, SalesOrderDocument } from './schemas/sales-order.schema';
import { StockItem, StockItemDocument } from './schemas/stock-item.schema';

@Injectable()
export class AdminRepository {
  constructor(
    @InjectModel(StockItem.name) private readonly stockItemModel: Model<StockItemDocument>,
    @InjectModel(PosSession.name) private readonly posSessionModel: Model<PosSessionDocument>,
    @InjectModel(PurchaseOrder.name) private readonly purchaseOrderModel: Model<PurchaseOrderDocument>,
    @InjectModel(SalesOrder.name) private readonly salesOrderModel: Model<SalesOrderDocument>,
    @InjectModel(CatalogProduct.name) private readonly catalogProductModel: Model<CatalogProductDocument>
  ) {}

  async ensureSeedData() {
    const [stockCount, posCount, purchaseOrderCount, salesOrderCount, catalogProductCount] = await Promise.all([
      this.stockItemModel.estimatedDocumentCount(),
      this.posSessionModel.estimatedDocumentCount(),
      this.purchaseOrderModel.estimatedDocumentCount(),
      this.salesOrderModel.estimatedDocumentCount(),
      this.catalogProductModel.estimatedDocumentCount()
    ]);

    const writes: Array<Promise<unknown>> = [];

    if (stockCount === 0) {
      writes.push(this.stockItemModel.insertMany(DEFAULT_STOCK_ITEMS));
    }

    if (posCount === 0) {
      writes.push(this.posSessionModel.insertMany(DEFAULT_POS_SESSIONS));
    }

    if (purchaseOrderCount === 0) {
      writes.push(this.purchaseOrderModel.insertMany(DEFAULT_PURCHASE_ORDERS));
    }

    if (salesOrderCount === 0) {
      writes.push(this.salesOrderModel.insertMany(DEFAULT_SALES_ORDERS));
    }

    if (catalogProductCount === 0) {
      writes.push(this.catalogProductModel.insertMany(DEFAULT_CATALOG_PRODUCTS));
    }

    await Promise.all(writes);
  }

  getStockItems() {
    return this.stockItemModel.find().sort({ sku: 1 }).lean().exec();
  }

  getPosSessions() {
    return this.posSessionModel.find().sort({ counter: 1 }).lean().exec();
  }

  getPurchaseOrders() {
    return this.purchaseOrderModel.find().sort({ po: 1 }).lean().exec();
  }

  getSalesOrders() {
    return this.salesOrderModel.find().sort({ placedAt: 1, orderNumber: 1 }).lean().exec();
  }

  getCatalogProducts() {
    return this.catalogProductModel.find().sort({ category: 1, sku: 1 }).lean().exec();
  }

  async approvePurchaseOrder(purchaseOrderId: string) {
    const order = await this.purchaseOrderModel.findOne({ po: purchaseOrderId }).exec();

    if (!order) {
      throw new NotFoundException(`Purchase order ${purchaseOrderId} was not found`);
    }

    if (order.status === 'Waiting delivery' || order.status === 'Approved') {
      throw new BadRequestException(`Purchase order ${purchaseOrderId} is already approved`);
    }

    order.status = 'Approved';
    order.approvedAt = new Date();
    await order.save();

    return order.toObject();
  }

  async advanceSalesOrderStatus(orderNumber: string) {
    const order = await this.salesOrderModel.findOne({ orderNumber }).exec();

    if (!order) {
      throw new NotFoundException(`Sales order ${orderNumber} was not found`);
    }

    const nextStatusByCurrentStatus: Record<SalesOrder['status'], SalesOrder['status'] | null> = {
      New: 'Packing',
      Packing: 'Ready to ship',
      'Ready to ship': 'Completed',
      Completed: null,
      'Payment issue': null
    };

    const nextStatus = nextStatusByCurrentStatus[order.status];

    if (nextStatus === null) {
      throw new BadRequestException(`Sales order ${orderNumber} cannot advance from ${order.status}`);
    }

    order.status = nextStatus;
    await order.save();

    return order.toObject();
  }
}
