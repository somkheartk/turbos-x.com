export const demoCredentials = {
  email: 'somkheart.k@gmail.com',
  password: 'password'
};

export const adminRoutes = {
  dashboard: '/admin',
  orders: '/admin/orders',
  pos: '/admin/pos',
  stock: '/admin/stock',
  purchaseOrders: '/admin/purchase-orders',
  catalog: '/admin/catalog'
} as const;

export const posRoutes = {
  dashboard: '/pos',
  cashier: '/pos/cashier',
  orders: '/pos/orders',
  products: '/pos/products',
  users: '/pos/users'
} as const;
