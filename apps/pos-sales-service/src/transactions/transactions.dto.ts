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
