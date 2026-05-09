import { getPosProducts } from '../_lib/pos-api';
import { CashierTerminal } from '../_components/cashier-terminal';

export const dynamic = 'force-dynamic';

export default async function PoscashierPage() {
  const data = await getPosProducts();
  const activeProducts = data.products.filter((p) => p.status === 'Active');

  return <CashierTerminal products={activeProducts} categories={data.categories} />;
}
