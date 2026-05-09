import { getAdminCatalog } from '../_lib/admin-api';

export const dynamic = 'force-dynamic';

function getCatalogStatusClass(status: string) {
  if (status === 'Active') {
    return 'bg-emerald-50 text-emerald-700';
  }

  if (status === 'Draft') {
    return 'bg-[#edf4ff] text-[#2563eb]';
  }

  return 'bg-slate-100 text-slate-700';
}

export default async function AdminCatalogPage() {
  const catalog = await getAdminCatalog();

  return (
    <>
      <header className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="relative overflow-hidden rounded-[34px] border border-[#d6e4fb] bg-[linear-gradient(135deg,#ffffff_0%,#eef5ff_52%,#f8fbff_100%)] p-6 shadow-[0_24px_60px_rgba(37,99,235,0.08)] lg:p-7">
          <div className="hazard-stripe absolute inset-x-0 top-0 h-14 opacity-50" />
          <div className="relative">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-[#2563eb]">Master catalog</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">จัดการ master product และ catalog</h2>
            <p className="mt-3 text-sm leading-7 text-ink/65 sm:text-base">
              ดูสถานะ SKU, category spread, ช่องทางขาย และความพร้อมของสินค้าใน catalog กลางสำหรับทีม product และ inventory.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {catalog.summary.map((item, index) => (
                <article
                  key={item.label}
                  className={`${index === 1 ? 'bg-[linear-gradient(145deg,#173eaa_0%,#1f56c5_100%)] text-white border-[#1f56c5]' : 'bg-white border-[#d6e4fb]'} rounded-[26px] border p-4 shadow-[0_12px_24px_rgba(37,99,235,0.08)]`}
                >
                  <p className={`text-xs uppercase tracking-[0.18em] ${index === 1 ? 'text-white/42' : 'text-ink/40'}`}>{item.label}</p>
                  <p className={`mt-2 text-2xl font-semibold ${index === 1 ? 'text-white' : 'text-ink'}`}>{item.value}</p>
                  <p className={`mt-2 text-sm ${index === 1 ? 'text-white/72' : 'text-[#5a7494]'}`}>{item.detail}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden rounded-[30px] border border-[#183f9d] bg-[linear-gradient(145deg,#173eaa_0%,#194abf_58%,#6da7ff_180%)] p-5 text-white shadow-[0_18px_40px_rgba(23,62,170,0.22)]">
          <div className="hazard-stripe absolute inset-x-0 bottom-0 h-16 opacity-25" />
          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/52">Category mix</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">Catalog governance</h3>
            <div className="mt-5 space-y-3">
              {catalog.categories.map((category) => (
                <div key={category.category} className="rounded-[24px] bg-white/8 px-4 py-4 backdrop-blur-sm">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-white">{category.category}</p>
                    <span className="text-xs text-white/70">{category.activeCount}/{category.productCount} active</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </header>

      <section className="mt-8 rounded-[32px] border border-[#d6e4fb] bg-white/96 p-6 shadow-[0_20px_48px_rgba(37,99,235,0.05)]">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-ink/45">Product master</p>
        <h3 className="mt-2 text-2xl font-semibold">รายการสินค้าใน catalog กลาง</h3>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-y-3">
            <thead>
              <tr className="text-left text-sm text-ink/45">
                <th className="px-4">SKU</th>
                <th className="px-4">สินค้า</th>
                <th className="px-4">Category</th>
                <th className="px-4">Price</th>
                <th className="px-4">Stock</th>
                <th className="px-4">Channels</th>
                <th className="px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {catalog.products.map((product, index) => (
                <tr
                  key={product.sku}
                  className={`${index === 0 ? 'bg-[linear-gradient(145deg,#173eaa_0%,#1f56c5_100%)] text-white' : 'bg-[#f7fbff] text-ink/80'} rounded-2xl text-sm shadow-[0_10px_24px_rgba(37,99,235,0.05)]`}
                >
                  <td className={`rounded-l-2xl px-4 py-4 font-medium ${index === 0 ? 'text-[#dbe7ff]' : 'text-[#2563eb]'}`}>{product.sku}</td>
                  <td className="px-4 py-4">
                    <p className="font-medium">{product.name}</p>
                    <p className={`mt-1 text-xs ${index === 0 ? 'text-white/72' : 'text-[#6782a8]'}`}>Updated by {product.updatedBy}</p>
                  </td>
                  <td className="px-4 py-4">{product.category}</td>
                  <td className="px-4 py-4">{product.priceLabel}</td>
                  <td className="px-4 py-4">{product.stockOnHand}</td>
                  <td className="px-4 py-4">{product.channels.join(', ')}</td>
                  <td className="rounded-r-2xl px-4 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${getCatalogStatusClass(product.status)}`}>
                      {product.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}