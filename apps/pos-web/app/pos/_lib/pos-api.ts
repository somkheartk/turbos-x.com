// Server: read env directly. Browser: go through the Next.js proxy route (/api/pos/...)
const API_BASE_URL =
  globalThis.window === undefined
    ? (process.env.API_BASE_URL ?? 'http://127.0.0.1:3001/api')
    : '/api';

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  if (!response.ok) throw new Error(`POS API ${response.status}: ${path}`);
  return response.json() as Promise<T>;
}

export type PosDashboardData = {
  kpis: Array<{ label: string; value: string; detail?: string }>;
  topCashiers: Array<{ rank: number; name: string; transactions: number; totalLabel: string }>;
  onlineCounters: number;
};

export type PosProduct = {
  sku: string;
  name: string;
  category: string;
  price: number;
  priceLabel: string;
  stockOnHand: number;
  status: 'Active' | 'Draft' | 'Archived';
};

export type PosProductsData = {
  products: PosProduct[];
  categories: string[];
};

export type PosTransactionItem = {
  productSku: string;
  productName: string;
  qty: number;
  unitPrice: number;
  unitPriceLabel: string;
  lineTotal: number;
  lineTotalLabel: string;
};

export type PosTransaction = {
  transactionId: string;
  items: PosTransactionItem[];
  subtotal: number;
  subtotalLabel: string;
  discount: number;
  total: number;
  totalLabel: string;
  paymentMethod: 'Cash' | 'QR' | 'Card';
  cashReceived: number;
  changeAmount: number;
  changeAmountLabel: string;
  cashierName: string;
  status: 'Completed' | 'Voided';
  createdAtLabel: string;
};

export type PosOrdersData = {
  summary: Array<{ label: string; value: string }>;
  transactions: PosTransaction[];
};

export type PosUser = {
  id: string;
  name: string;
  role: 'admin' | 'manager' | 'cashier';
  status: 'Active' | 'Inactive';
  shift?: string;
};

export type PosUsersData = {
  users: PosUser[];
};

export type CheckoutPayload = {
  items: Array<{ productSku: string; productName: string; qty: number; unitPrice: number }>;
  discount?: number;
  paymentMethod: 'Cash' | 'QR' | 'Card';
  cashReceived?: number;
  cashierName: string;
};

export function getPosNewPlan() {
  return requestJson<PosDashboardData>('/pos/dashboard');
}

export function getPosProducts() {
  return requestJson<PosProductsData>('/pos/products');
}

export function getPosOrders() {
  return requestJson<PosOrdersData>('/pos/orders');
}

export function getPosUsers() {
  return requestJson<PosUsersData>('/pos/users');
}

export function posCheckout(payload: CheckoutPayload) {
  return requestJson<{ transaction: PosTransaction; message: string }>('/pos/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updatePosUser(id: string, data: Partial<Pick<PosUser, 'status' | 'role' | 'shift'>>) {
  return requestJson<{ message: string }>(`/pos/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function createPosUser(data: { name: string; role: PosUser['role']; pin: string; shift?: string }) {
  return requestJson<{ message: string }>('/pos/users', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function createPosProduct(data: { name: string; sku: string; category: string; price: number; stockOnHand: number }) {
  return requestJson<{ product: PosProduct }>('/pos/products', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
