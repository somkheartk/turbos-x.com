export class DashboardCardDto {
  label!: string;
  value!: string;
  detail!: string;
}

export class ChannelShareDto {
  channel!: string;
  percent!: number;
}

export class PriorityTaskDto {
  title!: string;
  detail!: string;
  tone!: 'neutral' | 'warning';
}

export class DashboardResponseDto {
  headline!: {
    eyebrow: string;
    title: string;
    detail: string;
    healthLabel: string;
  };
  cards!: DashboardCardDto[];
  channels!: ChannelShareDto[];
  priorities!: PriorityTaskDto[];
}

export class SummaryCardDto {
  label!: string;
  value!: string;
  detail!: string;
}

export class StockItemDto {
  sku!: string;
  product!: string;
  onHand!: number;
  reorderPoint!: number;
  branch!: string;
}

export class StockResponseDto {
  summary!: SummaryCardDto[];
  alertLabel!: string;
  items!: StockItemDto[];
}

export class PosRegisterDto {
  counter!: string;
  cashier!: string;
  shift!: string;
  status!: 'Open' | 'Closing soon' | 'Closed';
  transactionCount!: number;
  averageBasketLabel!: string;
  returnsPending!: number;
}

export class PosSummaryDto {
  label!: string;
  value!: string;
}

export class PosResponseDto {
  onlineCountersLabel!: string;
  registers!: PosRegisterDto[];
  summary!: PosSummaryDto[];
}

export class PurchaseOrderDto {
  po!: string;
  supplier!: string;
  amount!: number;
  amountLabel!: string;
  status!: 'Pending approval' | 'Waiting delivery' | 'Draft' | 'Approved';
}

export class PurchaseOrdersResponseDto {
  summary!: SummaryCardDto[];
  orders!: PurchaseOrderDto[];
}

export class ApprovePurchaseOrderResponseDto {
  message!: string;
  order!: PurchaseOrderDto;
  summary!: SummaryCardDto[];
}

export class SalesOrderDto {
  orderNumber!: string;
  customerName!: string;
  channel!: string;
  branch!: string;
  totalAmount!: number;
  totalAmountLabel!: string;
  itemCount!: number;
  status!: 'New' | 'Packing' | 'Ready to ship' | 'Completed' | 'Payment issue';
  placedAtLabel!: string;
  assignedTo!: string;
}

export class OrdersResponseDto {
  summary!: SummaryCardDto[];
  orders!: SalesOrderDto[];
}

export class UpdateOrderStatusResponseDto {
  message!: string;
  order!: SalesOrderDto;
  summary!: SummaryCardDto[];
}

export class CatalogCategoryDto {
  category!: string;
  productCount!: number;
  activeCount!: number;
}

export class CatalogProductDto {
  sku!: string;
  name!: string;
  category!: string;
  price!: number;
  priceLabel!: string;
  stockOnHand!: number;
  status!: 'Active' | 'Draft' | 'Archived';
  channels!: string[];
  updatedBy!: string;
}

export class CatalogResponseDto {
  summary!: SummaryCardDto[];
  categories!: CatalogCategoryDto[];
  products!: CatalogProductDto[];
}
