'use client';

import { useState } from 'react';
import type { PosOrdersData, PosTransaction } from '../../_lib/pos-api';
import { ReceiptModal } from '../../_components/receipt-modal';

const paymentLabel: Record<string, string> = { Cash: 'เงินสด', QR: 'QR', Card: 'บัตร' };
const paymentIcon:  Record<string, string> = { Cash: '💵', QR: '📱', Card: '💳' };

type Filter = 'All' | 'Completed' | 'Voided';

type Props = { readonly data: PosOrdersData };

export function OrdersClient({ data }: Props) {
  const [filter, setFilter]     = useState<Filter>('All');
  const [selected, setSelected] = useState<PosTransaction | null>(null);

  const visible = filter === 'All'
    ? data.transactions
    : data.transactions.filter(t => t.status === filter);

  return (
    <>
      {selected && <ReceiptModal tx={selected} onClose={() => setSelected(null)} />}

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

        <div className="overflow-x-auto">
          <div className="min-w-[640px] overflow-hidden rounded-2xl border border-slate-100 bg-white">
            <div className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] border-b border-slate-50 px-6 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              <span>Transaction</span>
              <span className="px-6">วิธีชำระ</span>
              <span className="px-6 text-center">รายการ</span>
              <span className="px-6 text-right">ยอด</span>
              <span className="px-6 text-right">Status</span>
              <span className="pl-6 text-right">ใบเสร็จ</span>
            </div>

            {visible.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-sm text-slate-400">ไม่มี transactions</p>
                <p className="mt-1 text-xs text-slate-300">
                  {filter === 'All'
                    ? 'ทำ checkout จากหน้า Cashier เพื่อสร้าง transaction แรก'
                    : `ไม่มี ${filter} transactions`}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {visible.map(tx => (
                  <OrderRow key={tx.transactionId} tx={tx} onViewReceipt={() => setSelected(tx)} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function OrderRow({ tx, onViewReceipt }: { readonly tx: PosTransaction; readonly onViewReceipt: () => void }) {
  const isCompleted = tx.status === 'Completed';
  return (
    <div className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] items-center px-6 py-4 transition-colors hover:bg-slate-50/60">
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

      <div className="px-6 flex justify-end">
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
          isCompleted ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400 line-through'
        }`}>
          <span className={`h-1.5 w-1.5 rounded-full ${isCompleted ? 'bg-emerald-500' : 'bg-slate-300'}`} />
          {tx.status}
        </span>
      </div>

      <div className="pl-6 flex justify-end">
        <button
          onClick={onViewReceipt}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-all hover:border-[#2563eb] hover:bg-[#eff6ff] hover:text-[#2563eb]"
        >
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6z" />
          </svg>
          ใบเสร็จ
        </button>
      </div>
    </div>
  );
}
