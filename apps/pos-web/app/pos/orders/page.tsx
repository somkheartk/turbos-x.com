import { getOrders } from '../_lib';
import { OrdersClient } from './_components/orders-client';

export const dynamic = 'force-dynamic';

export default async function PosOrdersPage() {
  const data = await getOrders();
  return <OrdersClient data={data} />;
}
