import { getPosNewPlan } from './_lib/pos-api';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function PosDashboardPage() {
  const data = await getPosNewPlan();

  return (
    <div className="space-y-7">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">ภาพรวมการขายและ counter วันนี้</p>
        </div>
        <Link
          href="/pos/cashier"
          className="flex items-center gap-2 rounded-xl bg-[#2563eb] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(37,99,235,0.25)] hover:bg-[#1d4ed8] transition-colors"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <path d="M8 21h8M12 17v4" strokeLinecap="round" />
          </svg>
          เปิด Cashier
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {data.kpis.map((kpi, i) => (
          <div
            key={kpi.label}
            className={`rounded-2xl border p-6 ${
              i === 0
                ? 'border-[#2563eb] bg-[linear-gradient(135deg,#1d4ed8_0%,#2563eb_100%)] text-white shadow-[0_8px_24px_rgba(37,99,235,0.25)]'
                : 'border-slate-100 bg-white'
            }`}
          >
            <p className={`text-xs font-medium ${i === 0 ? 'text-blue-200' : 'text-slate-400'}`}>{kpi.label}</p>
            <p className={`mt-2 text-3xl font-bold tracking-tight ${i === 0 ? 'text-white' : 'text-slate-900'}`}>{kpi.value}</p>
            {kpi.detail && <p className={`mt-1.5 text-xs ${i === 0 ? 'text-blue-200' : 'text-slate-400'}`}>{kpi.detail}</p>}
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_260px]">

        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white">
          <div className="flex items-center justify-between border-b border-slate-50 px-6 py-4">
            <p className="text-sm font-semibold text-slate-800">Top Cashier วันนี้</p>
            <Link href="/pos/orders" className="text-xs font-medium text-[#2563eb] hover:underline">
              ดู Orders →
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {data.topCashiers.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-center">
                <p className="text-sm text-slate-400">ยังไม่มี transactions วันนี้</p>
                <Link href="/pos/cashier" className="mt-3 text-xs font-medium text-[#2563eb] hover:underline">
                  เริ่มขายจากหน้า Cashier →
                </Link>
              </div>
            ) : (
              data.topCashiers.map((c, i) => (
                <div key={c.name} className="flex items-center gap-4 px-6 py-4">
                  <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    i === 0 ? 'bg-[#2563eb] text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {c.rank}
                  </span>
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                    {c.name[0]}
                  </div>
                  <span className="flex-1 text-sm font-medium text-slate-800">{c.name}</span>
                  <span className="text-xs text-slate-400">{c.transactions} tx</span>
                  <span className="text-sm font-bold text-slate-900">{c.totalLabel}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-slate-100 bg-white px-6 py-5">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              <p className="text-xs font-semibold text-emerald-600">Online now</p>
            </div>
            <p className="mt-4 text-5xl font-bold tracking-tight text-slate-900">{data.onlineCounters}</p>
            <p className="mt-1 text-sm text-slate-400">เครื่อง POS เปิดอยู่</p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white px-6 py-5 space-y-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">สาขา</p>
              <p className="mt-1 text-sm font-semibold text-slate-800">Main Branch</p>
            </div>
            <div className="h-px bg-slate-50" />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">กะปัจจุบัน</p>
              <p className="mt-1 text-sm font-semibold text-slate-800">Morning / Evening</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
