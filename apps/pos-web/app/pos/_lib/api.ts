import { request } from './client';
import type {
  DashboardData,
  ProductsData,
  Product,
  CreateProductPayload,
  OrdersData,
  Transaction,
  CheckoutPayload,
  UsersData,
  CreateUserPayload,
  UpdateUserPayload,
  ReportsData,
} from './types';

// ── Dashboard ────────────────────────────────────────────────────────────────

export function getDashboard() {
  return request<DashboardData>('/pos/dashboard');
}

// ── Products ─────────────────────────────────────────────────────────────────

export function getProducts() {
  return request<ProductsData>('/pos/products');
}

export function createProduct(payload: CreateProductPayload) {
  return request<{ product: Product }>('/pos/products', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// ── Orders ────────────────────────────────────────────────────────────────────

export function getOrders() {
  return request<OrdersData>('/pos/orders');
}

export function checkout(payload: CheckoutPayload) {
  return request<{ transaction: Transaction; message: string }>('/pos/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// ── Users ─────────────────────────────────────────────────────────────────────

export function getUsers() {
  return request<UsersData>('/pos/users');
}

export function createUser(payload: CreateUserPayload) {
  return request<{ message: string }>('/pos/users', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateUser(id: string, payload: UpdateUserPayload) {
  return request<{ message: string }>(`/pos/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

// ── Reports ───────────────────────────────────────────────────────────────────

export function getReports() {
  return request<ReportsData>('/admin/reports');
}
