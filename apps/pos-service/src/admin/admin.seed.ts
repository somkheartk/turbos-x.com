export const DASHBOARD_CHANNEL_SHARES = [
  { channel: 'Website', percent: 64 },
  { channel: 'Marketplace', percent: 21 },
  { channel: 'Retail branch', percent: 15 }
] as const;

export const DASHBOARD_PRIORITY_TASKS = [
  {
    title: 'Approve purchase order',
    detail: 'Supplier A รออนุมัติ PO สำหรับสินค้ากลุ่ม skincare ภายในวันนี้ 18:00',
    tone: 'warning' as const
  },
  {
    title: 'Check payment exceptions',
    detail: 'มี 3 ออเดอร์ที่ชำระเงินไม่สมบูรณ์ และต้องตรวจสอบกับช่องทางโอนเงิน',
    tone: 'neutral' as const
  },
  {
    title: 'Restock best sellers',
    detail: 'สินค้าขายดี 5 รายการเหลือสต๊อกต่ำกว่า threshold ของสัปดาห์นี้',
    tone: 'neutral' as const
  }
];

export const DEFAULT_STOCK_ITEMS = [
  { sku: 'SKU-001', product: 'Hydra Serum 30ml', onHand: 24, reorderPoint: 18, branch: 'HQ Warehouse' },
  { sku: 'SKU-014', product: 'Sun Shield SPF50', onHand: 11, reorderPoint: 20, branch: 'Siam Branch' },
  { sku: 'SKU-031', product: 'Night Repair Mask', onHand: 42, reorderPoint: 15, branch: 'Online Fulfillment' },
  { sku: 'SKU-105', product: 'Cloud Cleanser', onHand: 9, reorderPoint: 16, branch: 'HQ Warehouse' }
];

export const DEFAULT_POS_SESSIONS = [
  {
    counter: 'POS-01',
    cashier: 'Mint',
    shift: '08:00 - 17:00',
    status: 'Open' as const,
    transactionCount: 92,
    averageBasket: 1240,
    returnsPending: 2
  },
  {
    counter: 'POS-02',
    cashier: 'Beam',
    shift: '10:00 - 19:00',
    status: 'Open' as const,
    transactionCount: 74,
    averageBasket: 1330,
    returnsPending: 1
  },
  {
    counter: 'POS-03',
    cashier: 'Nida',
    shift: '12:00 - 21:00',
    status: 'Closing soon' as const,
    transactionCount: 48,
    averageBasket: 1280,
    returnsPending: 2
  }
];

export const DEFAULT_PURCHASE_ORDERS = [
  { po: 'PO-240426-01', supplier: 'Supplier A', amount: 48000, status: 'Pending approval' as const },
  { po: 'PO-240426-02', supplier: 'Supplier B', amount: 22500, status: 'Waiting delivery' as const },
  { po: 'PO-240426-03', supplier: 'Supplier C', amount: 74300, status: 'Draft' as const }
];

export const DEFAULT_SALES_ORDERS = [
  {
    orderNumber: 'SO-240502-001',
    customerName: 'Kamonwan P.',
    channel: 'Website',
    branch: 'Online Fulfillment',
    totalAmount: 3290,
    itemCount: 3,
    status: 'New' as const,
    placedAt: new Date('2026-05-02T08:10:00.000Z'),
    assignedTo: 'Nook'
  },
  {
    orderNumber: 'SO-240502-002',
    customerName: 'Ploy M.',
    channel: 'Line OA',
    branch: 'HQ Warehouse',
    totalAmount: 4890,
    itemCount: 5,
    status: 'Packing' as const,
    placedAt: new Date('2026-05-02T08:45:00.000Z'),
    assignedTo: 'Fai'
  },
  {
    orderNumber: 'SO-240502-003',
    customerName: 'Thanapat C.',
    channel: 'Marketplace',
    branch: 'Siam Branch',
    totalAmount: 1590,
    itemCount: 2,
    status: 'Ready to ship' as const,
    placedAt: new Date('2026-05-02T09:20:00.000Z'),
    assignedTo: 'Mint'
  },
  {
    orderNumber: 'SO-240502-004',
    customerName: 'Anya R.',
    channel: 'Website',
    branch: 'Online Fulfillment',
    totalAmount: 2190,
    itemCount: 1,
    status: 'Payment issue' as const,
    placedAt: new Date('2026-05-02T09:35:00.000Z'),
    assignedTo: 'Beam'
  }
];

export const DEFAULT_CATALOG_PRODUCTS = [
  {
    sku: 'SKU-001',
    name: 'Hydra Serum 30ml',
    category: 'Skincare',
    price: 1290,
    stockOnHand: 24,
    status: 'Active' as const,
    channels: ['Website', 'Marketplace', 'Retail'],
    updatedBy: 'Owner Control'
  },
  {
    sku: 'SKU-014',
    name: 'Sun Shield SPF50',
    category: 'Suncare',
    price: 890,
    stockOnHand: 11,
    status: 'Active' as const,
    channels: ['Website', 'Retail'],
    updatedBy: 'Inventory Desk'
  },
  {
    sku: 'SKU-031',
    name: 'Night Repair Mask',
    category: 'Skincare',
    price: 1590,
    stockOnHand: 42,
    status: 'Draft' as const,
    channels: ['Website'],
    updatedBy: 'Operations Command'
  },
  {
    sku: 'SKU-105',
    name: 'Cloud Cleanser',
    category: 'Cleanser',
    price: 790,
    stockOnHand: 9,
    status: 'Archived' as const,
    channels: ['Retail'],
    updatedBy: 'Owner Control'
  }
];
