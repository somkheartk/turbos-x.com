import PurchaseOrderApproveButton from '../_components/purchase-order-approve-button';
import { getAdminPurchaseOrders } from '../_lib/admin-api';

export const dynamic = 'force-dynamic';

function getStatusClasses(status: string) {
  if (status === 'Approved' || status === 'Waiting delivery') {
    return 'bg-emerald-50 text-emerald-700';
  }

  if (status === 'Pending approval') {
    return 'bg-[#edf4ff] text-[#2563eb]';
  }

  return 'bg-slate-100 text-ink/70';
}

export default async function AdminPurchaseOrdersPage() {
  const purchaseOrders = await getAdminPurchaseOrders();

  return (
    <>
      <header className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="relative overflow-hidden rounded-[34px] border border-[#d6e4fb] bg-[linear-gradient(135deg,#ffffff_0%,#eef5ff_52%,#f8fbff_100%)] p-6 shadow-[0_24px_60px_rgba(37,99,235,0.08)] lg:p-7">
          <div className="hazard-stripe absolute inset-x-0 top-0 h-14 opacity-50" />
          <div className="relative">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-[#2563eb]">Operations</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Purchase Orders</h2>
          <p className="mt-3 text-sm leading-7 text-ink/65 sm:text-base">
            ติดตามใบสั่งซื้อ supplier สถานะการอนุมัติ และมูลค่าที่กำลังจะเข้าคลังใน procurement lane เดียว.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {purchaseOrders.summary.map((item, index) => (
              <article key={item.label} className={`${index === 0 ? 'bg-[linear-gradient(145deg,#173eaa_0%,#1f56c5_100%)] text-white border-[#1f56c5]' : 'bg-white border-[#d6e4fb]'} rounded-[26px] border p-4 shadow-[0_12px_24px_rgba(37,99,235,0.08)]`}>
                <p className={`text-xs uppercase tracking-[0.18em] ${index === 0 ? 'text-white/42' : 'text-ink/40'}`}>{item.label}</p>
                <p className={`mt-2 text-2xl font-semibold ${index === 0 ? 'text-white' : 'text-ink'}`}>{item.value}</p>
                <p className={`mt-2 text-sm ${index === 0 ? 'text-white/72' : 'text-[#5a7494]'}`}>{item.detail}</p>
              </article>
            ))}
          </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[30px] border border-[#183f9d] bg-[linear-gradient(145deg,#173eaa_0%,#194abf_58%,#6da7ff_180%)] p-5 text-white shadow-[0_18px_40px_rgba(23,62,170,0.22)]">
          <div className="hazard-stripe absolute inset-x-0 bottom-0 h-16 opacity-25" />
          <div className="relative flex items-start justify-between gap-4">
            <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/52">Supplier pipeline</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">Procurement queue</h3>
            <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl bg-white/8 px-3 py-3">
                <p className="text-[10px] uppercase tracking-[0.16em] text-white/38">Suppliers</p>
                <p className="mt-1 text-lg font-semibold text-white">12</p>
              </div>
              <div className="rounded-2xl bg-white/8 px-3 py-3">
                <p className="text-[10px] uppercase tracking-[0.16em] text-white/38">Pending lanes</p>
                <p className="mt-1 text-lg font-semibold text-white">04</p>
              </div>
            </div>
            </div>
            <button
              type="button"
              className="rounded-[20px] bg-[linear-gradient(135deg,#8fbeff_0%,#ffffff_160%)] px-4 py-3 text-sm font-medium text-[#173eaa] shadow-[0_16px_34px_rgba(19,74,191,0.20)] transition hover:brightness-105"
            >
              Create new PO
            </button>
          </div>
        </div>
      </header>

      <section className="mt-8 rounded-[32px] border border-[#d6e4fb] bg-white/96 p-6 shadow-[0_20px_48px_rgba(37,99,235,0.05)]">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-ink/45">Supplier Pipeline</p>
        <h3 className="mt-2 text-2xl font-semibold">รายการใบสั่งซื้อ</h3>

        <div className="mt-6 space-y-4">
          {purchaseOrders.orders.map((order, index) => (
            <article key={order.po} className={`${index === 0 ? 'bg-[linear-gradient(145deg,#173eaa_0%,#1f56c5_100%)] text-white border-[#1f56c5]' : 'bg-[#f7fbff] border-[#d6e4fb]'} rounded-[28px] border p-5`}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className={`text-base font-semibold ${index === 0 ? 'text-[#dbe7ff]' : 'text-[#2563eb]'}`}>{order.po}</p>
                  <p className={`mt-1 text-sm ${index === 0 ? 'text-white/72' : 'text-[#5a7494]'}`}>{order.supplier}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-3 py-1 text-sm font-medium ${getStatusClasses(order.status)}`}>
                    {order.status}
                  </span>
                  <span className="text-base font-semibold">{order.amountLabel}</span>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className={`text-sm ${index === 0 ? 'text-white/72' : 'text-[#5a7494]'}`}>Supplier workflow พร้อมเชื่อม API จริงแล้วและพร้อมส่งต่อเข้า receiving lane</p>
                {order.status === 'Pending approval' || order.status === 'Draft' ? (
                  <PurchaseOrderApproveButton purchaseOrderId={order.po} />
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}