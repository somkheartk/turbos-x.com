import { getPosOrders } from '../_lib/pos-api';
import { OrdersClient } from './_components/orders-client';

export const dynamic = 'force-dynamic';

export default async function PosOrdersPage() {
  const data = await getPosOrders();
  return <OrdersClient data={data} />;
}
