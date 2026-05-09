import OrderAdvanceButton from '../_components/order-advance-button';
import { getAdminOrders } from '../_lib/admin-api';

export const dynamic = 'force-dynamic';

function getOrderStatusClass(status: string) {
  if (status === 'Completed') {
    return 'bg-emerald-50 text-emerald-700';
  }

  if (status === 'Payment issue') {
    return 'bg-rose-50 text-rose-700';
  }

  if (status === 'Ready to ship') {
    return 'bg-[#dce9ff] text-[#1f56c5]';
  }

  if (status === 'Packing') {
    return 'bg-[#edf4ff] text-[#2563eb]';
  }

  return 'bg-slate-100 text-slate-700';
}

export default async function AdminOrdersPage() {
  const orders = await getAdminOrders();

  return (
    <>
      <header className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="relative overflow-hidden rounded-[34px] border border-[#d6e4fb] bg-[linear-gradient(135deg,#ffffff_0%,#eef5ff_52%,#f8fbff_100%)] p-6 shadow-[0_24px_60px_rgba(37,99,235,0.08)] lg:p-7">
          <div className="hazard-stripe absolute inset-x-0 top-0 h-14 opacity-50" />
          <div className="relative">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-[#2563eb]">Order management</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">จัดการออเดอร์ลูกค้า</h2>
            <p className="mt-3 text-sm leading-7 text-ink/65 sm:text-base">
              ดู order queue, payment exceptions, fulfillment handoff และ assignment ของทีมปฏิบัติการใน workspace เดียว.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {orders.summary.map((item, index) => (
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
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/52">Fulfillment rhythm</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">Order control board</h3>
            <div className="mt-5 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
              <div className="rounded-[24px] bg-white/8 px-4 py-4 backdrop-blur-sm">
                <p className="text-sm text-white/58">Orders active</p>
                <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white">{orders.orders.length}</p>
              </div>
              <div className="rounded-[24px] bg-white/8 px-4 py-4 backdrop-blur-sm">
                <p className="text-sm text-white/58">Payment hold</p>
                <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white">
                  {orders.orders.filter((order) => order.status === 'Payment issue').length}
                </p>
              </div>
              <div className="rounded-[24px] bg-white/8 px-4 py-4 backdrop-blur-sm">
                <p className="text-sm text-white/58">Ready handoff</p>
                <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white">
                  {orders.orders.filter((order) => order.status === 'Ready to ship').length}
                </p>
              </div>
            </div>
          </div>
        </section>
      </header>

      <section className="mt-8 rounded-[32px] border border-[#d6e4fb] bg-white/96 p-6 shadow-[0_20px_48px_rgba(37,99,235,0.05)]">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-ink/45">Order pipeline</p>
        <h3 className="mt-2 text-2xl font-semibold">รายการออเดอร์ที่ทีมกำลังดูแล</h3>

        <div className="mt-6 space-y-4">
          {orders.orders.map((order, index) => (
            <article
              key={order.orderNumber}
              className={`${index === 0 ? 'bg-[linear-gradient(145deg,#173eaa_0%,#1f56c5_100%)] text-white border-[#1f56c5]' : 'bg-[#f7fbff] border-[#d6e4fb]'} rounded-[28px] border p-5`}
            >
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div>
                  <p className={`text-base font-semibold ${index === 0 ? 'text-[#dbe7ff]' : 'text-[#2563eb]'}`}>{order.orderNumber}</p>
                  <h4 className="mt-1 text-xl font-semibold">{order.customerName}</h4>
                  <p className={`mt-2 text-sm ${index === 0 ? 'text-white/72' : 'text-[#5a7494]'}`}>
                    {order.channel} • {order.branch} • {order.itemCount} items • {order.placedAtLabel}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <span className={`rounded-full px-3 py-1 text-sm font-medium ${getOrderStatusClass(order.status)}`}>{order.status}</span>
                  <span className="text-base font-semibold">{order.totalAmountLabel}</span>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className={`text-sm ${index === 0 ? 'text-white/72' : 'text-[#5a7494]'}`}>Assigned to {order.assignedTo}</p>
                {order.status !== 'Completed' && order.status !== 'Payment issue' ? (
                  <OrderAdvanceButton orderNumber={order.orderNumber} />
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}