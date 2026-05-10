import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

type UserRole = 'admin' | 'manager' | 'cashier';
type UserStatus = 'Active' | 'Inactive';
type PaymentMethod = 'Cash' | 'QR' | 'Card';
type ProductStatus = 'Active' | 'Draft' | 'Archived';
type TxStatus = 'Completed' | 'Voided';

export class PosUserDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty({ enum: ['admin', 'manager', 'cashier'] }) role!: UserRole;
  @ApiProperty({ enum: ['Active', 'Inactive'] }) status!: UserStatus;
  @ApiPropertyOptional() shift?: string;
}

export class PosUsersResponseDto {
  @ApiProperty({ type: [PosUserDto] }) users!: PosUserDto[];
}

export class CreatePosUserDto {
  @ApiProperty({ example: 'Mint' }) name!: string;
  @ApiProperty({ enum: ['admin', 'manager', 'cashier'], example: 'cashier' }) role!: UserRole;
  @ApiProperty({ example: '1234' }) pin!: string;
  @ApiPropertyOptional({ example: '08:00-17:00' }) shift?: string;
}

export class UpdatePosUserDto {
  @ApiPropertyOptional({ enum: ['Active', 'Inactive'] }) status?: UserStatus;
  @ApiPropertyOptional({ enum: ['admin', 'manager', 'cashier'] }) role?: UserRole;
  @ApiPropertyOptional({ example: '08:00-17:00' }) shift?: string;
}

export class TransactionItemDto {
  @ApiProperty() productSku!: string;
  @ApiProperty() productName!: string;
  @ApiProperty() qty!: number;
  @ApiProperty() unitPrice!: number;
  @ApiProperty() unitPriceLabel!: string;
  @ApiProperty() lineTotal!: number;
  @ApiProperty() lineTotalLabel!: string;
}

export class PosTransactionDto {
  @ApiProperty() transactionId!: string;
  @ApiProperty({ type: [TransactionItemDto] }) items!: TransactionItemDto[];
  @ApiProperty() subtotal!: number;
  @ApiProperty() subtotalLabel!: string;
  @ApiProperty() discount!: number;
  @ApiProperty() total!: number;
  @ApiProperty() totalLabel!: string;
  @ApiProperty({ enum: ['Cash', 'QR', 'Card'] }) paymentMethod!: PaymentMethod;
  @ApiProperty() cashReceived!: number;
  @ApiProperty() changeAmount!: number;
  @ApiProperty() changeAmountLabel!: string;
  @ApiProperty() cashierName!: string;
  @ApiProperty({ enum: ['Completed', 'Voided'] }) status!: TxStatus;
  @ApiProperty() createdAtLabel!: string;
}

export class CheckoutItemDto {
  @ApiProperty({ example: 'BEV-001' }) productSku!: string;
  @ApiProperty({ example: 'กาแฟดำ' }) productName!: string;
  @ApiProperty({ example: 2 }) qty!: number;
  @ApiProperty({ example: 45 }) unitPrice!: number;
}

export class CheckoutDto {
  @ApiProperty({ type: [CheckoutItemDto] }) items!: CheckoutItemDto[];
  @ApiPropertyOptional({ example: 0 }) discount?: number;
  @ApiProperty({ enum: ['Cash', 'QR', 'Card'], example: 'Cash' }) paymentMethod!: PaymentMethod;
  @ApiPropertyOptional({ example: 100 }) cashReceived?: number;
  @ApiProperty({ example: 'Mint' }) cashierName!: string;
}

export class PosOrdersResponseDto {
  @ApiProperty() summary!: Array<{ label: string; value: string }>;
  @ApiProperty({ type: [PosTransactionDto] }) transactions!: PosTransactionDto[];
}

export class CheckoutResponseDto {
  @ApiProperty({ type: PosTransactionDto }) transaction!: PosTransactionDto;
  @ApiProperty() message!: string;
}

export class PosDashboardResponseDto {
  @ApiProperty() kpis!: Array<{ label: string; value: string; detail?: string }>;
  @ApiProperty() topCashiers!: Array<{ rank: number; name: string; transactions: number; totalLabel: string }>;
  @ApiProperty() onlineCounters!: number;
}

export class CreatePosProductDto {
  @ApiProperty({ example: 'Hydra Serum 30ml' }) name!: string;
  @ApiProperty({ example: 'SKU-001' }) sku!: string;
  @ApiProperty({ example: 'Serum' }) category!: string;
  @ApiProperty({ example: 400 }) price!: number;
  @ApiProperty({ example: 50 }) stockOnHand!: number;
}

export class PosProductDto {
  @ApiProperty() sku!: string;
  @ApiProperty() name!: string;
  @ApiProperty() category!: string;
  @ApiProperty() price!: number;
  @ApiProperty() priceLabel!: string;
  @ApiProperty() stockOnHand!: number;
  @ApiProperty({ enum: ['Active', 'Draft', 'Archived'] }) status!: ProductStatus;
}

export class PosProductsResponseDto {
  @ApiProperty({ type: [PosProductDto] }) products!: PosProductDto[];
  @ApiProperty({ type: [String] }) categories!: string[];
}
