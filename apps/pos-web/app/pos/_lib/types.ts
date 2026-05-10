// ── Dashboard ────────────────────────────────────────────────────────────────

export type DashboardData = {
  kpis: Array<{ label: string; value: string; detail?: string }>;
  topCashiers: Array<{ rank: number; name: string; transactions: number; totalLabel: string }>;
  onlineCounters: number;
};

// ── Products ─────────────────────────────────────────────────────────────────

export type Product = {
  sku: string;
  name: string;
  category: string;
  price: number;
  priceLabel: string;
  stockOnHand: number;
  status: 'Active' | 'Draft' | 'Archived';
};

export type ProductsData = {
  products: Product[];
  categories: string[];
};

export type CreateProductPayload = {
  name: string;
  sku: string;
  category: string;
  price: number;
  stockOnHand: number;
};

// ── Orders / Transactions ─────────────────────────────────────────────────────

export type TransactionItem = {
  productSku: string;
  productName: string;
  qty: number;
  unitPrice: number;
  unitPriceLabel: string;
  lineTotal: number;
  lineTotalLabel: string;
};

export type Transaction = {
  transactionId: string;
  items: TransactionItem[];
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

export type OrdersData = {
  summary: Array<{ label: string; value: string }>;
  transactions: Transaction[];
};

export type CheckoutPayload = {
  items: Array<{ productSku: string; productName: string; qty: number; unitPrice: number }>;
  discount?: number;
  paymentMethod: 'Cash' | 'QR' | 'Card';
  cashReceived?: number;
  cashierName: string;
};

// ── Users ─────────────────────────────────────────────────────────────────────

export type UserRole = 'admin' | 'manager' | 'cashier';

export type User = {
  id: string;
  name: string;
  role: UserRole;
  status: 'Active' | 'Inactive';
  shift?: string;
};

export type UsersData = {
  users: User[];
};

export type CreateUserPayload = {
  name: string;
  role: UserRole;
  pin: string;
  shift?: string;
};

export type UpdateUserPayload = Partial<Pick<User, 'status' | 'role' | 'shift'>>;

// ── Reports ───────────────────────────────────────────────────────────────────

export type ReportsData = {
  period: string;
  summary: Array<{ label: string; value: string; change: string; up: boolean }>;
  dailySales: Array<{ day: string; revenue: number; transactions: number }>;
  topProducts: Array<{ rank: number; name: string; sku: string; sold: number; revenue: number; revenueLabel: string }>;
  byShift: Array<{ shift: string; revenue: number; revenueLabel: string; transactions: number; percent: number }>;
  byCashier: Array<{ name: string; transactions: number; revenue: number; revenueLabel: string; avgBasket: string }>;
};
