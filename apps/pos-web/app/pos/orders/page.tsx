'use client';

import { useEffect, useState } from 'react';
import { getPosOrders, type PosOrdersData } from '../_lib/pos-api';

const paymentLabel: Record<string, string> = { Cash: 'เงินสด', QR: 'QR', Card: 'บัตร' };
const paymentIcon:  Record<string, string> = { Cash: '💵', QR: '📱', Card: '💳' };

type Filter = 'All' | 'Completed' | 'Voided';

export default function PosOrdersPage() {
  const [data, setData]     = useState<PosOrdersData | null>(null);
  const [filter, setFilter] = useState<Filter>('All');

  useEffect(() => {
    getPosOrders().then(setData);
  }, []);

  if (!data) {
    return (
      <div className="flex h-60 items-center justify-center">
        <p className="text-sm text-slate-400">กำลังโหลด...</p>
      </div>
    );
  }

  const visible = filter === 'All' ? data.transactions : data.transactions.filter(t => t.status === filter);

  return (
    <div className="space-y-6">

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Orders</h1>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            {data.summary.map((s, i) => (
              <div key={s.label} className={`rounded-xl px-4 py-2 ${i === 2 ? 'bg-[#2563eb] text-white' : 'bg-white border border-slate-100'}`}>
                <p className={`text-[10px] font-semibold uppercase tracking-wider ${i === 2 ? 'text-blue-200' : 'text-slate-400'}`}>{s.label}</p>
                <p className={`mt-0.5 text-lg font-bold ${i === 2 ? 'text-white' : 'text-slate-900'}`}>{s.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-1.5 rounded-xl border border-slate-100 bg-white p-1.5">
          {(['All', 'Completed', 'Voided'] as Filter[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                filter === f ? 'bg-[#2563eb] text-white' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white">
        <div className="grid grid-cols-[1fr_auto_auto_auto_auto] border-b border-slate-50 px-6 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          <span>Transaction</span>
          <span className="px-6">วิธีชำระ</span>
          <span className="px-6 text-center">รายการ</span>
          <span className="px-6 text-right">ยอด</span>
          <span className="pl-6 text-right">Status</span>
        </div>

        {visible.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-slate-400">ไม่มี transactions</p>
            <p className="mt-1 text-xs text-slate-300">
              {filter === 'All' ? 'ทำ checkout จากหน้า Cashier เพื่อสร้าง transaction แรก' : `ไม่มี ${filter} transactions`}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {visible.map(tx => (
              <div key={tx.transactionId} className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center px-6 py-4 hover:bg-slate-50/60 transition-colors">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{tx.transactionId}</p>
                  <p className="mt-0.5 text-xs text-slate-400">{tx.cashierName} · {tx.createdAtLabel}</p>
                </div>

                <div className="px-6">
                  <span className="flex items-center gap-1.5 text-sm text-slate-600">
                    <span>{paymentIcon[tx.paymentMethod]}</span>
                    {paymentLabel[tx.paymentMethod]}
                  </span>
                </div>

                <p className="px-6 text-center text-sm text-slate-500">
                  {tx.items.reduce((s, i) => s + i.qty, 0)} ชิ้น
                </p>

                <p className="px-6 text-right text-sm font-bold text-slate-900">{tx.totalLabel}</p>

                <div className="pl-6 flex justify-end">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                    tx.status === 'Completed'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-slate-100 text-slate-400 line-through'
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${tx.status === 'Completed' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                    {tx.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
