import { Injectable, NotFoundException } from '@nestjs/common';
import { AdminService } from '../admin/admin.service';
import {
  CheckoutDto,
  CheckoutResponseDto,
  CreatePosProductDto,
  CreatePosUserDto,
  PosDashboardResponseDto,
  PosOrdersResponseDto,
  PosProductsResponseDto,
  PosUsersResponseDto,
  UpdatePosUserDto,
} from './pos.dto';

@Injectable()
export class PosService {
  constructor(private readonly adminService: AdminService) {}
  private get catalogUrl(): string {
    return process.env.CATALOG_SERVICE_URL ?? 'http://localhost:3003/api';
  }

  private get salesUrl(): string {
    return process.env.SALES_SERVICE_URL ?? 'http://localhost:3002/api';
  }

  private async get<T>(url: string): Promise<T> {
    const res = await fetch(url);
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`GET ${url} → ${res.status}: ${text}`);
    }
    return res.json() as Promise<T>;
  }

  private async post<T>(url: string, body: unknown): Promise<T> {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`POST ${url} → ${res.status}: ${text}`);
    }
    return res.json() as Promise<T>;
  }

  private async patch<T>(url: string, body: unknown): Promise<T> {
    const res = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text();
      if (res.status === 404) throw new NotFoundException(text);
      throw new Error(`PATCH ${url} → ${res.status}: ${text}`);
    }
    return res.json() as Promise<T>;
  }

  async getDashboard(): Promise<PosDashboardResponseDto> {
    const { transactions: todayTxs } = await this.get<{ transactions: Array<{ total: number; cashierName: string }> }>(
      `${this.salesUrl}/pos/orders/today`,
    );

    const totalRevenue = todayTxs.reduce((s, t) => s + t.total, 0);
    const avgBasket = todayTxs.length ? Math.round(totalRevenue / todayTxs.length) : 0;

    const cashierMap = new Map<string, { count: number; total: number }>();
    for (const tx of todayTxs) {
      const prev = cashierMap.get(tx.cashierName) ?? { count: 0, total: 0 };
      cashierMap.set(tx.cashierName, { count: prev.count + 1, total: prev.total + tx.total });
    }
    const topCashiers = Array.from(cashierMap.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5)
      .map(([name, stat], i) => ({
        rank: i + 1,
        name,
        transactions: stat.count,
        totalLabel: this.formatCurrency(stat.total),
      }));

    return {
      kpis: [
        { label: 'ยอดขายวันนี้', value: this.formatCurrency(totalRevenue), detail: 'เฉพาะ Completed' },
        { label: 'Transactions', value: String(todayTxs.length) },
        { label: 'Avg basket', value: this.formatCurrency(avgBasket) },
      ],
      topCashiers,
      onlineCounters: 3,
    };
  }

  async getProducts(): Promise<PosProductsResponseDto> {
    return this.get(`${this.catalogUrl}/pos/products`);
  }

  async createProduct(dto: CreatePosProductDto) {
    return this.post(`${this.catalogUrl}/pos/products`, dto);
  }

  async getOrders(): Promise<PosOrdersResponseDto> {
    return this.get(`${this.salesUrl}/pos/orders`);
  }

  async checkout(dto: CheckoutDto): Promise<CheckoutResponseDto> {
    return this.post(`${this.salesUrl}/pos/orders`, dto);
  }

  async getUsers(): Promise<PosUsersResponseDto> {
    return this.get(`${this.salesUrl}/pos/users`);
  }

  async createUser(dto: CreatePosUserDto) {
    return this.post(`${this.salesUrl}/pos/users`, dto);
  }

  async updateUser(id: string, dto: UpdatePosUserDto) {
    return this.patch(`${this.salesUrl}/pos/users/${id}`, dto);
  }

  async getReports() {
    return this.adminService.getReports();
  }

  private formatCurrency(value: number) {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      maximumFractionDigits: 0,
    }).format(value);
  }
}
