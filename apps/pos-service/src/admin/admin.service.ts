import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  ApprovePurchaseOrderResponseDto,
  CatalogResponseDto,
  DashboardResponseDto,
  OrdersResponseDto,
  PosResponseDto,
  PurchaseOrdersResponseDto,
  ReportsResponseDto,
  StockResponseDto,
  UpdateOrderStatusResponseDto
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

  async getReports(): Promise<ReportsResponseDto> {
    const salesUrl = process.env.SALES_SERVICE_URL ?? 'http://localhost:3002/api';
    const stockItems = await this.adminRepository.getStockItems();

    let transactions: Array<{
      transactionId: string;
      items: Array<{ productSku: string; productName: string; qty: number; lineTotal: number }>;
      total: number;
      cashierName: string;
      status: string;
      createdAt: string;
    }> = [];

    try {
      const res = await fetch(`${salesUrl}/pos/orders`, { cache: 'no-store' });
      if (res.ok) {
        const body = await res.json() as { transactions?: typeof transactions };
        transactions = (body.transactions ?? []).filter((t) => t.status === 'Completed');
      }
    } catch { /* fall through to demo */ }

    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const recent = transactions.filter((t) => new Date(t.createdAt) >= sevenDaysAgo);
    const totalRevenue = recent.reduce((s, t) => s + t.total, 0);
    const totalTx = recent.length;
    const avgBasket = totalTx > 0 ? totalRevenue / totalTx : 0;

    const days = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];
    const dailySales = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now);
      d.setDate(now.getDate() - (6 - i));
      const dayTx = recent.filter((t) => {
        const td = new Date(t.createdAt);
        return td.getDate() === d.getDate() && td.getMonth() === d.getMonth() && td.getFullYear() === d.getFullYear();
      });
      const seed = (d.getDate() * 7919 + d.getMonth() * 3571) % 10;
      return {
        day: days[d.getDay()],
        revenue: dayTx.length > 0 ? dayTx.reduce((s, t) => s + t.total, 0) : 25000 + seed * 8000,
        transactions: dayTx.length > 0 ? dayTx.length : 4 + seed
      };
    });

    const productMap = new Map<string, { name: string; sold: number; revenue: number }>();
    for (const tx of recent) {
      for (const item of tx.items) {
        const key = item.productSku;
        const existing = productMap.get(key);
        if (existing) {
          existing.sold += item.qty;
          existing.revenue += item.lineTotal;
        } else {
          productMap.set(key, { name: item.productName, sold: item.qty, revenue: item.lineTotal });
        }
      }
    }

    const DEMO_PRODUCTS = [
      { sku: 'SKU-001', name: 'Hydra Serum 30ml', sold: 142, revenue: 56800 },
      { sku: 'SKU-014', name: 'Sun Shield SPF50', sold: 98, revenue: 29400 },
      { sku: 'SKU-031', name: 'Night Repair Mask', sold: 87, revenue: 21750 },
      { sku: 'SKU-105', name: 'Cloud Cleanser', sold: 63, revenue: 15300 },
      { sku: 'SKU-200', name: 'Vitamin C Booster', sold: 51, revenue: 25200 }
    ];

    const topBase = productMap.size >= 3
      ? [...productMap.entries()].map(([sku, v]) => ({ sku, ...v })).sort((a, b) => b.revenue - a.revenue).slice(0, 5)
      : DEMO_PRODUCTS;

    const topProducts = topBase.map((p, i) => ({
      rank: i + 1, name: p.name, sku: p.sku, sold: p.sold, revenue: p.revenue,
      revenueLabel: this.formatCurrency(p.revenue)
    }));

    const cashierMap = new Map<string, { transactions: number; revenue: number }>();
    for (const tx of recent) {
      const existing = cashierMap.get(tx.cashierName);
      if (existing) { existing.transactions++; existing.revenue += tx.total; }
      else { cashierMap.set(tx.cashierName, { transactions: 1, revenue: tx.total }); }
    }

    const byCashier = cashierMap.size > 0
      ? [...cashierMap.entries()]
          .map(([name, v]) => ({
            name, transactions: v.transactions, revenue: v.revenue,
            revenueLabel: this.formatCurrency(v.revenue),
            avgBasket: this.formatCurrency(v.transactions > 0 ? Math.round(v.revenue / v.transactions) : 0)
          }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5)
      : [
          { name: 'สมชาย', transactions: 38, revenue: 47500, revenueLabel: this.formatCurrency(47500), avgBasket: this.formatCurrency(1250) },
          { name: 'มาลี',   transactions: 29, revenue: 36250, revenueLabel: this.formatCurrency(36250), avgBasket: this.formatCurrency(1250) },
          { name: 'วิชัย',  transactions: 21, revenue: 26250, revenueLabel: this.formatCurrency(26250), avgBasket: this.formatCurrency(1250) }
        ];

    const shiftBuckets = { Morning: { revenue: 0, transactions: 0 }, Evening: { revenue: 0, transactions: 0 }, Night: { revenue: 0, transactions: 0 } };
    for (const tx of recent) {
      const h = new Date(tx.createdAt).getHours();
      const shift = h >= 6 && h < 14 ? 'Morning' : h >= 14 && h < 22 ? 'Evening' : 'Night';
      shiftBuckets[shift].revenue += tx.total;
      shiftBuckets[shift].transactions++;
    }
    const shiftTotal = Object.values(shiftBuckets).reduce((s, b) => s + b.revenue, 0);
    const byShift = (['Morning', 'Evening', 'Night'] as const).map((shift) => {
      const b = shiftBuckets[shift];
      const rev = b.revenue || (shift === 'Morning' ? 68400 : shift === 'Evening' ? 49800 : 24200);
      const txn = b.transactions || (shift === 'Morning' ? 42 : shift === 'Evening' ? 31 : 15);
      const total = shiftTotal || (68400 + 49800 + 24200);
      return { shift, revenue: rev, revenueLabel: this.formatCurrency(rev), transactions: txn, percent: Math.round((rev / total) * 100) };
    });

    const periodStart = new Date(now);
    periodStart.setDate(now.getDate() - 6);
    const fmt = (d: Date) => new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium' }).format(d);

    return {
      period: `ข้อมูล 7 วันล่าสุด · ${fmt(periodStart)} – ${fmt(now)}`,
      summary: [
        { label: 'ยอดขายรวม', value: this.formatCurrency(totalRevenue || 142400), change: '12.4% vs สัปดาห์ก่อน', up: true },
        { label: 'รายการทั้งหมด', value: String(totalTx || 88), change: '8.1% vs สัปดาห์ก่อน', up: true },
        { label: 'ค่าเฉลี่ยต่อบิล', value: this.formatCurrency(Math.round(avgBasket) || 1618), change: '3.9% vs สัปดาห์ก่อน', up: true },
        { label: 'สินค้าที่ขาย', value: String(stockItems.length), change: '2 รายการจากสัปดาห์ก่อน', up: false }
      ],
      dailySales,
      topProducts,
      byShift,
      byCashier
    };
  }
}
