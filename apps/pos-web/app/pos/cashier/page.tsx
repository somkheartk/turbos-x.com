import { getProducts } from '../_lib';
import { CashierTerminal } from './_components/cashier-terminal';

export const dynamic = 'force-dynamic';

export default async function PoscashierPage() {
  const data = await getProducts();
  const activeProducts = data.products.filter((p) => p.status === 'Active');

  return <CashierTerminal products={activeProducts} categories={data.categories} />;
}
