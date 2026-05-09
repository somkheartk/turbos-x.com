import { getAdminStock } from '../_lib/admin-api';

export const dynamic = 'force-dynamic';

export default async function AdminStockPage() {
  const stock = await getAdminStock();

  return (
    <>
      <header className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="relative overflow-hidden rounded-[34px] border border-[#d6e4fb] bg-[linear-gradient(135deg,#ffffff_0%,#eef5ff_55%,#f8fbff_100%)] p-6 shadow-[0_24px_60px_rgba(37,99,235,0.08)] lg:p-7">
          <div className="hazard-stripe absolute inset-x-0 top-0 h-14 opacity-50" />
          <div className="relative">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-[#2563eb]">Stock Management</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">ภาพรวมคลังสินค้า</h2>
          <p className="mt-3 text-sm leading-7 text-ink/65 sm:text-base">
            ตรวจยอดคงเหลือ จุดสั่งซื้อใหม่ และการกระจายสินค้าแต่ละคลังจากหน้า routing board เดียว.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {stock.summary.map((item, index) => (
              <article key={item.label} className={`${index === 1 ? 'bg-[linear-gradient(145deg,#173eaa_0%,#1f56c5_100%)] text-white' : 'bg-white'} rounded-[26px] border ${index === 1 ? 'border-[#1f56c5]' : 'border-[#d6e4fb]'} p-4 shadow-[0_12px_24px_rgba(37,99,235,0.08)]`}>
                <p className={`text-xs uppercase tracking-[0.18em] ${index === 1 ? 'text-white/42' : 'text-ink/40'}`}>{item.label}</p>
                <p className={`mt-2 text-2xl font-semibold ${index === 1 ? 'text-white' : 'text-ink'}`}>{item.value}</p>
                <p className={`mt-2 text-sm ${index === 1 ? 'text-white/72' : 'text-[#5a7494]'}`}>{item.detail}</p>
              </article>
            ))}
          </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[30px] border border-[#183f9d] bg-[linear-gradient(145deg,#173eaa_0%,#194abf_58%,#6da7ff_180%)] p-5 text-white shadow-[0_18px_40px_rgba(23,62,170,0.22)]">
          <div className="hazard-stripe absolute inset-x-0 bottom-0 h-16 opacity-25" />
          <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/52">Alert lane</p>
          <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">Inventory routing watch</h3>
          <p className="mt-4 inline-flex rounded-full bg-white/12 px-4 py-2 text-sm font-medium text-white">{stock.alertLabel}</p>
          <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-2xl bg-white/8 px-3 py-3">
              <p className="text-[10px] uppercase tracking-[0.16em] text-white/40">Critical SKUs</p>
              <p className="mt-1 text-lg font-semibold text-white">08</p>
            </div>
            <div className="rounded-2xl bg-white/8 px-3 py-3">
              <p className="text-[10px] uppercase tracking-[0.16em] text-white/40">Transfer lanes</p>
              <p className="mt-1 text-lg font-semibold text-white">03</p>
            </div>
          </div>
          </div>
        </div>
      </header>

      <section className="mt-8 rounded-[32px] border border-[#d6e4fb] bg-white/96 p-6 shadow-[0_20px_48px_rgba(37,99,235,0.05)]">
        <div className="flex flex-col gap-3 border-b border-[#e3ecfb] pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-ink/45">Low Stock Watch</p>
            <h3 className="mt-2 text-2xl font-semibold">สินค้าที่ต้องติดตาม</h3>
          </div>
          <button
            type="button"
            className="rounded-[20px] border border-[#d6e4fb] bg-[#edf4ff] px-4 py-3 text-sm font-medium text-[#2563eb]"
          >
            Export inventory report
          </button>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-y-3">
            <thead>
              <tr className="text-left text-sm text-ink/45">
                <th className="px-4">SKU</th>
                <th className="px-4">สินค้า</th>
                <th className="px-4">คงเหลือ</th>
                <th className="px-4">Reorder</th>
                <th className="px-4">คลัง/สาขา</th>
              </tr>
            </thead>
            <tbody>
              {stock.items.map((item, index) => (
                <tr key={item.sku} className={`${index === 0 ? 'bg-[linear-gradient(145deg,#173eaa_0%,#1f56c5_100%)] text-white' : 'bg-[#f7fbff] text-ink/80'} rounded-2xl text-sm shadow-[0_10px_24px_rgba(37,99,235,0.05)]`}>
                  <td className="rounded-l-2xl px-4 py-4 font-medium text-[#2563eb]">{item.sku}</td>
                  <td className="px-4 py-4">{item.product}</td>
                  <td className="px-4 py-4">{item.onHand}</td>
                  <td className="px-4 py-4">{item.reorderPoint}</td>
                  <td className="rounded-r-2xl px-4 py-4">{item.branch}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
