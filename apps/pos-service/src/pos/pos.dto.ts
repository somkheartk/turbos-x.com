export class PosUserDto {
  id!: string;
  name!: string;
  role!: 'admin' | 'manager' | 'cashier';
  status!: 'Active' | 'Inactive';
  shift?: string;
}

export class PosUsersResponseDto {
  users!: PosUserDto[];
}

export class CreatePosUserDto {
  name!: string;
  role!: 'admin' | 'manager' | 'cashier';
  pin!: string;
  shift?: string;
}

export class UpdatePosUserDto {
  status?: 'Active' | 'Inactive';
  role?: 'admin' | 'manager' | 'cashier';
  shift?: string;
}

export class TransactionItemDto {
  productSku!: string;
  productName!: string;
  qty!: number;
  unitPrice!: number;
  unitPriceLabel!: string;
  lineTotal!: number;
  lineTotalLabel!: string;
}

export class PosTransactionDto {
  transactionId!: string;
  items!: TransactionItemDto[];
  subtotal!: number;
  subtotalLabel!: string;
  discount!: number;
  total!: number;
  totalLabel!: string;
  paymentMethod!: 'Cash' | 'QR' | 'Card';
  cashReceived!: number;
  changeAmount!: number;
  changeAmountLabel!: string;
  cashierName!: string;
  status!: 'Completed' | 'Voided';
  createdAtLabel!: string;
}

export class CheckoutItemDto {
  productSku!: string;
  productName!: string;
  qty!: number;
  unitPrice!: number;
}

export class CheckoutDto {
  items!: CheckoutItemDto[];
  discount?: number;
  paymentMethod!: 'Cash' | 'QR' | 'Card';
  cashReceived?: number;
  cashierName!: string;
}

export class PosOrdersResponseDto {
  summary!: Array<{ label: string; value: string }>;
  transactions!: PosTransactionDto[];
}

export class CheckoutResponseDto {
  transaction!: PosTransactionDto;
  message!: string;
}

export class PosDashboardResponseDto {
  kpis!: Array<{ label: string; value: string; detail?: string }>;
  topCashiers!: Array<{ rank: number; name: string; transactions: number; totalLabel: string }>;
  onlineCounters!: number;
}

export class CreatePosProductDto {
  name!: string;
  sku!: string;
  category!: string;
  price!: number;
  stockOnHand!: number;
}

export class PosProductDto {
  sku!: string;
  name!: string;
  category!: string;
  price!: number;
  priceLabel!: string;
  stockOnHand!: number;
  status!: 'Active' | 'Draft' | 'Archived';
}

export class PosProductsResponseDto {
  products!: PosProductDto[];
  categories!: string[];
}
