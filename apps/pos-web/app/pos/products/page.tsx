import { getProducts } from '../_lib';
import { ProductsClient } from './_components/products-client';

export const dynamic = 'force-dynamic';

export default async function PosProductsPage() {
  const data = await getProducts().catch(() => ({
    products: [] as Awaited<ReturnType<typeof getProducts>>['products'],
    categories: [] as string[],
  }));
  return <ProductsClient products={data.products} categories={data.categories} />;
}
