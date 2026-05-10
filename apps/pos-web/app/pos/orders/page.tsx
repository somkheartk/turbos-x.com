import { getOrders } from '../_lib';
import { OrdersClient } from './_components/orders-client';

export const dynamic = 'force-dynamic';

export default async function PosOrdersPage() {
  const data = await getOrders().catch(() => ({
    summary: [
      { label: 'Total revenue', value: '฿0' },
      { label: 'Completed', value: '0' },
      { label: 'Voided', value: '0' },
    ],
    transactions: [] as Awaited<ReturnType<typeof getOrders>>['transactions'],
  }));
  return <OrdersClient data={data} />;
}
