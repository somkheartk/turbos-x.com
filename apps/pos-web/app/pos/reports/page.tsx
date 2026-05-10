import { getAdminReports } from '../../admin/_lib/admin-api';

export const dynamic = 'force-dynamic';

function fmt(n: number) {
  return n.toLocaleString('th-TH');
}

export default async function PosReportsPage() {
  const data = await getAdminReports();
  const maxDaily = Math.max(...data.dailySales.map(d => d.revenue), 1);

  return (
    <>
      <header className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <section className="rounded-[34px] border border-[#d6e4fb] bg-[linear-gradient(145deg,#ffffff_0%,#edf4ff_100%)] p-6 shadow-[0_24px_60px_rgba(37,99,235,0.08)]">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#2563eb]">Analytics lane</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[#10233f]">Sales report</h2>
          <p className="mt-2 text-sm leading-6 text-[#597391]">{data.period}</p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {data.summary.map((item, idx) => (
              <article
                key={item.label}
                className={`rounded-[26px] p-4 ${idx === 0 ? 'bg-[linear-gradient(135deg,#2563eb_0%,#1743b3_100%)] text-white shadow-[0_12px_32px_rgba(37,99,235,0.32)]' : 'border border-[#dce9fb] bg-white'}`}
              >
                <p className={`text-[10px] font-bold uppercase tracking-[0.22em] ${idx === 0 ? 'text-white/65' : 'text-[#6e86a8]'}`}>{item.label}</p>
                <p className={`mt-2 text-2xl font-semibold tracking-[-0.03em] ${idx === 0 ? 'text-white' : 'text-[#10233f]'}`}>{item.value}</p>
                <p className={`mt-1 text-xs font-medium ${item.up ? 'text-emerald-500' : 'text-rose-400'}`}>
                  {item.up ? '▲' : '▼'} {item.change}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-[30px] border border-[#183f9d] bg-[linear-gradient(145deg,#1e4fc2_0%,#132e8a_100%)] p-6 text-white shadow-[0_24px_60px_rgba(19,46,138,0.28)]">
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-white/55">Revenue by shift</p>
          <p className="mt-3 text-xl font-semibold tracking-[-0.03em]">กะทำงาน</p>
          <div className="mt-5 space-y-3">
            {data.byShift.map(s => (
              <div key={s.shift} className="rounded-[18px] border border-white/12 bg-white/8 px-4 py-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-white/80">{s.shift} shift</p>
                  <p className="text-sm font-semibold">{s.revenueLabel}</p>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/15">
                  <div className="h-full rounded-full bg-[#60a5fa]" style={{ width: `${s.percent}%` }} />
                </div>
                <p className="mt-1 text-[11px] text-white/50">{s.transactions} รายการ · {s.percent}%</p>
              </div>
            ))}
          </div>
        </section>
      </header>

      <section className="mt-8 rounded-[32px] border border-[#d6e4fb] bg-white p-6 shadow-[0_12px_32px_rgba(37,99,235,0.06)]">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#6e86a8]">Daily trend</p>
        <h3 className="mt-1 text-lg font-semibold text-[#10233f]">ยอดขายรายวัน (7 วันล่าสุด)</h3>
        <div className="mt-6 flex items-end gap-2 sm:gap-3">
          {data.dailySales.map(d => {
            const pct = Math.round((d.revenue / maxDaily) * 100);
            return (
              <div key={d.day} className="group flex flex-1 flex-col items-center gap-2">
                <div className="relative w-full">
                  <div className="w-full rounded-t-[10px] bg-[#dbeafe] transition-all group-hover:bg-[#93c5fd]" style={{ height: `${Math.max(pct * 1.4, 4)}px` }} />
                  <div className="absolute bottom-0 left-0 w-full rounded-t-[10px] bg-[#2563eb] transition-all group-hover:bg-[#1d4ed8]" style={{ height: `${Math.max(pct * 1.4 * 0.55, 2)}px` }} />
                </div>
                <p className="text-center text-[10px] font-semibold text-[#597391]">{d.day}</p>
                <p className="text-center text-[10px] font-bold text-[#10233f]">฿{fmt(d.revenue)}</p>
                <p className="text-center text-[10px] text-[#9ab4d0]">{d.transactions} รายการ</p>
              </div>
            );
          })}
        </div>
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-[32px] border border-[#d6e4fb] bg-white shadow-[0_12px_32px_rgba(37,99,235,0.06)]">
          <div className="border-b border-[#edf4ff] px-6 py-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#6e86a8]">Product performance</p>
            <h3 className="mt-1 text-base font-semibold text-[#10233f]">สินค้าขายดี 5 อันดับ</h3>
          </div>
          <div className="divide-y divide-[#f0f6ff]">
            {data.topProducts.map(p => {
              let rankCls = 'bg-[#f0f6ff] text-[#597391]';
              if (p.rank === 1) rankCls = 'bg-[#2563eb] text-white';
              else if (p.rank === 2) rankCls = 'bg-[#dbeafe] text-[#1d4ed8]';
              return (
              <div key={p.sku} className="flex items-center gap-4 px-6 py-4 hover:bg-[#f8fbff] transition-colors">
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${rankCls}`}>
                  {p.rank}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[#10233f]">{p.name}</p>
                  <p className="text-xs text-[#9ab4d0]">{p.sku} · {p.sold} ชิ้น</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-[#10233f]">{p.revenueLabel}</p>
                  <div className="mt-1 h-1 w-16 overflow-hidden rounded-full bg-[#dbeafe]">
                    <div className="h-full rounded-full bg-[#2563eb]" style={{ width: `${Math.round((p.revenue / (data.topProducts[0]?.revenue ?? 1)) * 100)}%` }} />
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-[32px] border border-[#d6e4fb] bg-white shadow-[0_12px_32px_rgba(37,99,235,0.06)]">
          <div className="border-b border-[#edf4ff] px-6 py-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#6e86a8]">Staff performance</p>
            <h3 className="mt-1 text-base font-semibold text-[#10233f]">ยอดขายต่อพนักงาน</h3>
          </div>
          <div className="divide-y divide-[#f0f6ff]">
            {data.byCashier.map((c, i) => (
              <div key={c.name} className="flex items-center gap-4 px-6 py-4 hover:bg-[#f8fbff] transition-colors">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${['bg-orange-100 text-orange-700', 'bg-blue-100 text-blue-700', 'bg-emerald-100 text-emerald-700', 'bg-violet-100 text-violet-700'][i % 4]}`}>
                  {c.name[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[#10233f]">{c.name}</p>
                  <p className="text-xs text-[#9ab4d0]">{c.transactions} รายการ · avg {c.avgBasket}</p>
                </div>
                <p className="text-sm font-semibold text-[#10233f]">{c.revenueLabel}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
