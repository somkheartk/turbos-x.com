import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  ApprovePurchaseOrderResponseDto,
  CatalogResponseDto,
  DashboardResponseDto,
  OrdersResponseDto,
  PosResponseDto,
  PurchaseOrdersResponseDto,
  StockResponseDto
  ,UpdateOrderStatusResponseDto
} from './admin.dto';
import { AdminRepository } from './admin.repository';
import { DASHBOARD_CHANNEL_SHARES, DASHBOARD_PRIORITY_TASKS } from './admin.seed';

@Injectable()
export class AdminService implements OnModuleInit {
  constructor(private readonly adminRepository: AdminRepository) {}

  async onModuleInit() {
    await this.adminRepository.ensureSeedData();
  }

  async getOverview(): Promise<DashboardResponseDto> {
    const [stockItems, purchaseOrders] = await Promise.all([
      this.adminRepository.getStockItems(),
      this.adminRepository.getPurchaseOrders()
    ]);

    const lowStockCount = stockItems.filter((item) => item.onHand <= item.reorderPoint).length;
    const pendingApprovals = purchaseOrders.filter((order) => order.status === 'Pending approval').length;

    return {
      headline: {
        eyebrow: 'Smartstore Operations Center',
        title: 'Dashboard สำหรับ stock และ POS',
        detail: 'ตรวจภาพรวมยอดขาย สต๊อก สถานะหน้าร้าน และงานที่ต้องดำเนินการจากจุดเดียว.',
        healthLabel: 'ทุกสาขาออนไลน์ปกติ'
      },
      cards: [
        { label: 'ยอดขายวันนี้', value: '฿128,450', detail: '+12.4% จากเมื่อวาน' },
        { label: 'ออเดอร์รอดำเนินการ', value: String(pendingApprovals), detail: 'ต้องแพ็กภายใน 2 ชั่วโมง' },
        { label: 'สินค้าที่ต้องเติม', value: `${lowStockCount} SKU`, detail: 'สาขาหลักและออนไลน์' }
      ],
      channels: [...DASHBOARD_CHANNEL_SHARES],
      priorities: [...DASHBOARD_PRIORITY_TASKS]
    };
  }

  async getStock(): Promise<StockResponseDto> {
    const stockItems = await this.adminRepository.getStockItems();
    const lowStockCount = stockItems.filter((item) => item.onHand <= item.reorderPoint).length;

    return {
      summary: [
        { label: 'Total SKUs', value: '248', detail: 'ครอบคลุมทุกคลังและทุกสาขา' },
        { label: 'Inbound today', value: '16 lots', detail: 'รอรับเข้า 2 suppliers' },
        { label: 'Transfer requests', value: '7', detail: 'ระหว่างสาขาและคลังหลัก' }
      ],
      alertLabel: `${lowStockCount} SKU ต่ำกว่า reorder point`,
      items: stockItems.map((item) => ({
        sku: item.sku,
        product: item.product,
        onHand: item.onHand,
        reorderPoint: item.reorderPoint,
        branch: item.branch
      }))
    };
  }

  async getPos(): Promise<PosResponseDto> {
    const sessions = await this.adminRepository.getPosSessions();
    const onlineCounters = sessions.filter((item) => item.status !== 'Closed').length;
    const totalTransactions = sessions.reduce((total, item) => total + item.transactionCount, 0);
    const totalReturns = sessions.reduce((total, item) => total + item.returnsPending, 0);
    const weightedAverageBasket =
      totalTransactions === 0
        ? 0
        : Math.round(
            sessions.reduce((total, item) => total + item.averageBasket * item.transactionCount, 0) /
              totalTransactions
          );

    return {
      onlineCountersLabel: `${onlineCounters} counters online`,
      registers: sessions.map((item) => ({
        counter: item.counter,
        cashier: item.cashier,
        shift: item.shift,
        status: item.status,
        transactionCount: item.transactionCount,
        averageBasketLabel: this.formatCurrency(item.averageBasket),
        returnsPending: item.returnsPending
      })),
      summary: [
        { label: 'Transactions', value: String(totalTransactions) },
        { label: 'Average basket', value: this.formatCurrency(weightedAverageBasket) },
        { label: 'Returns pending review', value: String(totalReturns) }
      ]
    };
  }

  async getPurchaseOrders(): Promise<PurchaseOrdersResponseDto> {
    const orders = await this.adminRepository.getPurchaseOrders();
    return this.toPurchaseOrdersResponse(orders);
  }

  async getOrders(): Promise<OrdersResponseDto> {
    const orders = await this.adminRepository.getSalesOrders();
    return this.toOrdersResponse(orders);
  }

  async updateOrderStatus(orderNumber: string): Promise<UpdateOrderStatusResponseDto> {
    const order = await this.adminRepository.advanceSalesOrderStatus(orderNumber);
    const summary = (await this.getOrders()).summary;

    return {
      message: `${orderNumber} moved to ${order.status}`,
      order: this.toSalesOrderDto(order),
      summary
    };
  }

  async getCatalog(): Promise<CatalogResponseDto> {
    const products = await this.adminRepository.getCatalogProducts();
    const activeCount = products.filter((product) => product.status === 'Active').length;
    const draftCount = products.filter((product) => product.status === 'Draft').length;
    const archivedCount = products.filter((product) => product.status === 'Archived').length;
    const categories = Array.from(new Set(products.map((product) => product.category))).sort((left, right) =>
      left.localeCompare(right)
    );

    return {
      summary: [
        { label: 'Products tracked', value: String(products.length), detail: 'รวม master product ทุกสถานะใน catalog กลาง' },
        { label: 'Active SKUs', value: String(activeCount), detail: 'พร้อมขายบนอย่างน้อยหนึ่งช่องทาง' },
        { label: 'Draft / archived', value: `${draftCount + archivedCount}`, detail: 'ต้องรีวิวก่อนเปิดใช้งานหรือย้ายออกจาก catalog' }
      ],
      categories: categories.map((category) => {
        const items = products.filter((product) => product.category === category);

        return {
          category,
          productCount: items.length,
          activeCount: items.filter((product) => product.status === 'Active').length
        };
      }),
      products: products.map((product) => ({
        sku: product.sku,
        name: product.name,
        category: product.category,
        price: product.price,
        priceLabel: this.formatCurrency(product.price),
        stockOnHand: product.stockOnHand,
        status: product.status,
        channels: product.channels,
        updatedBy: product.updatedBy ?? 'Smartstore Admin'
      }))
    };
  }

  async approvePurchaseOrder(purchaseOrderId: string): Promise<ApprovePurchaseOrderResponseDto> {
    const order = await this.adminRepository.approvePurchaseOrder(purchaseOrderId);
    const summary = (await this.getPurchaseOrders()).summary;

    return {
      message: `${purchaseOrderId} approved successfully`,
      order: {
        po: order.po,
        supplier: order.supplier,
        amount: order.amount,
        amountLabel: this.formatCurrency(order.amount),
        status: order.status
      },
      summary
    };
  }

  private toPurchaseOrdersResponse(
    orders: Array<{
      po: string;
      supplier: string;
      amount: number;
      status: 'Pending approval' | 'Waiting delivery' | 'Draft' | 'Approved';
    }>
  ): PurchaseOrdersResponseDto {
    const pendingApprovals = orders.filter((order) => order.status === 'Pending approval').length;
    const approvedSpend = orders
      .filter((order) => order.status === 'Waiting delivery' || order.status === 'Approved')
      .reduce((total, order) => total + order.amount, 0);

    return {
      summary: [
        { label: 'Pending approvals', value: String(pendingApprovals), detail: 'ต้องตรวจสอบภายในวันนี้' },
        { label: 'This week spend', value: this.formatCurrency(approvedSpend), detail: 'รวมคำสั่งซื้อที่ปล่อยแล้ว' },
        { label: 'Suppliers active', value: '12', detail: 'มีรอบส่งของในสัปดาห์นี้' }
      ],
      orders: orders.map((order) => ({
        po: order.po,
        supplier: order.supplier,
        amount: order.amount,
        amountLabel: this.formatCurrency(order.amount),
        status: order.status
      }))
    };
  }

  private formatCurrency(value: number) {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      maximumFractionDigits: 0
    }).format(value);
  }

  private toOrdersResponse(
    orders: Array<{
      orderNumber: string;
      customerName: string;
      channel: string;
      branch: string;
      totalAmount: number;
      itemCount: number;
      status: 'New' | 'Packing' | 'Ready to ship' | 'Completed' | 'Payment issue';
      placedAt: Date;
      assignedTo?: string;
    }>
  ): OrdersResponseDto {
    const newOrders = orders.filter((order) => order.status === 'New').length;
    const fulfillmentReady = orders.filter((order) => order.status === 'Ready to ship').length;
    const paymentIssues = orders.filter((order) => order.status === 'Payment issue').length;

    return {
      summary: [
        { label: 'New orders', value: String(newOrders), detail: 'รอหยิบสินค้าและยืนยัน assignment' },
        { label: 'Ready to ship', value: String(fulfillmentReady), detail: 'พร้อมส่งต่อเข้า dispatch lane' },
        { label: 'Payment issues', value: String(paymentIssues), detail: 'ต้องตรวจสอบก่อนปล่อย fulfillment' }
      ],
      orders: orders.map((order) => this.toSalesOrderDto(order))
    };
  }

  private toSalesOrderDto(order: {
    orderNumber: string;
    customerName: string;
    channel: string;
    branch: string;
    totalAmount: number;
    itemCount: number;
    status: 'New' | 'Packing' | 'Ready to ship' | 'Completed' | 'Payment issue';
    placedAt: Date;
    assignedTo?: string;
  }) {
    return {
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      channel: order.channel,
      branch: order.branch,
      totalAmount: order.totalAmount,
      totalAmountLabel: this.formatCurrency(order.totalAmount),
      itemCount: order.itemCount,
      status: order.status,
      placedAtLabel: new Intl.DateTimeFormat('th-TH', {
        dateStyle: 'medium',
        timeStyle: 'short'
      }).format(new Date(order.placedAt)),
      assignedTo: order.assignedTo ?? 'Unassigned'
    };
  }
}
