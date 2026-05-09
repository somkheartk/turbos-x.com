export type DashboardData = {
  headline: {
    eyebrow: string;
    title: string;
    detail: string;
    healthLabel: string;
  };
  cards: Array<{
    label: string;
    value: string;
    detail: string;
  }>;
  channels: Array<{
    channel: string;
    percent: number;
  }>;
  priorities: Array<{
    title: string;
    detail: string;
    tone: 'neutral' | 'warning';
  }>;
};

export type StockData = {
  summary: Array<{
    label: string;
    value: string;
    detail: string;
  }>;
  alertLabel: string;
  items: Array<{
    sku: string;
    product: string;
    onHand: number;
    reorderPoint: number;
    branch: string;
  }>;
};

export type PosData = {
  onlineCountersLabel: string;
  registers: Array<{
    counter: string;
    cashier: string;
    shift: string;
    status: 'Open' | 'Closing soon' | 'Closed';
    transactionCount: number;
    averageBasketLabel: string;
    returnsPending: number;
  }>;
  summary: Array<{
    label: string;
    value: string;
  }>;
};

export type PurchaseOrdersData = {
  summary: Array<{
    label: string;
    value: string;
    detail: string;
  }>;
  orders: Array<{
    po: string;
    supplier: string;
    amount: number;
    amountLabel: string;
    status: 'Pending approval' | 'Waiting delivery' | 'Draft' | 'Approved';
  }>;
};

export type OrdersData = {
  summary: Array<{
    label: string;
    value: string;
    detail: string;
  }>;
  orders: Array<{
    orderNumber: string;
    customerName: string;
    channel: string;
    branch: string;
    totalAmount: number;
    totalAmountLabel: string;
    itemCount: number;
    status: 'New' | 'Packing' | 'Ready to ship' | 'Completed' | 'Payment issue';
    placedAtLabel: string;
    assignedTo: string;
  }>;
};

export type CatalogData = {
  summary: Array<{
    label: string;
    value: string;
    detail: string;
  }>;
  categories: Array<{
    category: string;
    productCount: number;
    activeCount: number;
  }>;
  products: Array<{
    sku: string;
    name: string;
    category: string;
    price: number;
    priceLabel: string;
    stockOnHand: number;
    status: 'Active' | 'Draft' | 'Archived';
    channels: string[];
    updatedBy: string;
  }>;
};

const API_BASE_URL =
  process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:3001/api';

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const requestHeaders = init?.headers;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...requestHeaders
    }
  });

  if (!response.ok) {
    throw new Error(`Admin API request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function getAdminOverview() {
  return requestJson<DashboardData>('/admin/overview');
}

export function getAdminStock() {
  return requestJson<StockData>('/admin/stock');
}

export function getAdminPos() {
  return requestJson<PosData>('/admin/pos');
}

export function getAdminPurchaseOrders() {
  return requestJson<PurchaseOrdersData>('/admin/purchase-orders');
}

export function getAdminOrders() {
  return requestJson<OrdersData>('/admin/orders');
}

export function advanceAdminOrder(orderNumber: string) {
  return requestJson(`/admin/orders/${orderNumber}/advance`, {
    method: 'PATCH'
  });
}

export function getAdminCatalog() {
  return requestJson<CatalogData>('/admin/catalog');
}

export function approvePurchaseOrder(po: string) {
  return requestJson(`/admin/purchase-orders/${po}/approve`, {
    method: 'PATCH'
  });
}
