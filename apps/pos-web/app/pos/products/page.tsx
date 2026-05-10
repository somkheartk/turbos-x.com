import { getPosProducts } from '../_lib/pos-api';
import { ProductsClient } from './_components/products-client';

export const dynamic = 'force-dynamic';

export default async function PosProductsPage() {
  const data = await getPosProducts();
  return <ProductsClient products={data.products} categories={data.categories} />;
}
