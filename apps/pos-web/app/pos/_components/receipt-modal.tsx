'use client';

import type { Transaction } from '../_lib';

const PAYMENT_LABEL: Record<string, string> = { Cash: 'เงินสด', QR: 'QR Code', Card: 'บัตรเครดิต' };

type Props = { tx: Transaction; onClose: () => void };

function buildPrintHtml(tx: Transaction): string {
  const rows = tx.items.map(item => `
    <div class="item-name">${item.productName}</div>
    <div class="row"><span>${item.qty} &times; ${item.unitPriceLabel}</span><span>${item.lineTotalLabel}</span></div>
  `).join('');

  const cashRows = tx.paymentMethod === 'Cash' && tx.cashReceived > 0 ? `
    <div class="row"><span>รับเงิน</span><span>${tx.cashReceived.toLocaleString()} ฿</span></div>
    <div class="row bold green"><span>ทอนเงิน</span><span>${tx.changeAmountLabel}</span></div>
  ` : '';

  const discountRow = tx.discount > 0 ? `
    <div class="row green"><span>ส่วนลด</span><span>-${tx.discount.toLocaleString()} ฿</span></div>
  ` : '';

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Receipt ${tx.transactionId}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Courier New',monospace;font-size:12px;padding:16px;max-width:300px;margin:0 auto;color:#111}
    .center{text-align:center}
    .store{font-size:15px;font-weight:700;letter-spacing:.05em}
    .divider{border:none;border-top:1px dashed #aaa;margin:8px 0}
    .row{display:flex;justify-content:space-between;margin:2px 0}
    .item-name{font-weight:600;margin-top:6px}
    .bold{font-weight:700;font-size:13px}
    .green{color:#16a34a}
    .muted{color:#666}
    .footer{text-align:center;margin-top:10px;color:#666}
  </style></head><body>
  <div class="center"><div class="store">SMARTSTORE</div><div class="muted">Point of Sale System</div></div>
  <hr class="divider">
  <div class="row"><span class="muted">เลขที่</span><span>${tx.transactionId}</span></div>
  <div class="row"><span class="muted">วันที่</span><span>${tx.createdAtLabel}</span></div>
  <div class="row"><span class="muted">แคชเชียร์</span><span>${tx.cashierName}</span></div>
  <hr class="divider">
  ${rows}
  <hr class="divider">
  <div class="row"><span class="muted">ยอดรวมย่อย</span><span>${tx.subtotalLabel}</span></div>
  ${discountRow}
  <div class="row bold"><span>รวมทั้งสิ้น</span><span>${tx.totalLabel}</span></div>
  <hr class="divider">
  <div class="row"><span class="muted">ชำระโดย</span><span>${PAYMENT_LABEL[tx.paymentMethod] ?? tx.paymentMethod}</span></div>
  ${cashRows}
  <hr class="divider">
  <div class="footer">ขอบคุณที่ใช้บริการ 🙏</div>
  </body></html>`;
}

export function ReceiptModal({ tx, onClose }: Props) {
  function handlePrint() {
    const win = window.open('', '_blank', 'width=380,height=640');
    if (!win) return;
    win.document.write(buildPrintHtml(tx));
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 400);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <p className="text-sm font-bold text-slate-900">ใบเสร็จรับเงิน</p>
            <p className="font-mono text-[11px] text-slate-400">{tx.transactionId}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-xl bg-[#2563eb] px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#1d4ed8]"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6z" />
              </svg>
              พิมพ์
            </button>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Receipt body */}
        <div className="max-h-[72vh] overflow-y-auto px-6 py-5">
          {/* Store header */}
          <div className="mb-4 text-center">
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-[#2563eb] text-sm font-bold text-white">
              SS
            </div>
            <p className="font-bold tracking-wide text-slate-900">SMARTSTORE</p>
            <p className="text-[11px] text-slate-400">Point of Sale System</p>
          </div>

          <div className="border-t border-dashed border-slate-200" />

          {/* Meta */}
          <div className="my-3 space-y-1 font-mono text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">วันที่</span>
              <span className="text-slate-700">{tx.createdAtLabel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">แคชเชียร์</span>
              <span className="text-slate-700">{tx.cashierName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">ชำระโดย</span>
              <span className="text-slate-700">{PAYMENT_LABEL[tx.paymentMethod] ?? tx.paymentMethod}</span>
            </div>
          </div>

          <div className="border-t border-dashed border-slate-200" />

          {/* Items */}
          <div className="my-3 space-y-2.5">
            {tx.items.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-800">{item.productName}</p>
                  <p className="text-[11px] text-slate-400">{item.qty} × {item.unitPriceLabel}</p>
                </div>
                <p className="shrink-0 text-xs font-bold text-slate-900">{item.lineTotalLabel}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-dashed border-slate-200" />

          {/* Totals */}
          <div className="my-3 space-y-1.5 font-mono text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">ยอดรวมย่อย</span>
              <span className="text-slate-700">{tx.subtotalLabel}</span>
            </div>
            {tx.discount > 0 && (
              <div className="flex justify-between">
                <span className="text-emerald-500">ส่วนลด</span>
                <span className="font-semibold text-emerald-600">-{tx.discount.toLocaleString()} ฿</span>
              </div>
            )}
            <div className="flex justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm font-bold">
              <span className="text-slate-800">รวมทั้งสิ้น</span>
              <span className="text-[#2563eb]">{tx.totalLabel}</span>
            </div>
          </div>

          {tx.paymentMethod === 'Cash' && tx.cashReceived > 0 && (
            <>
              <div className="border-t border-dashed border-slate-200" />
              <div className="my-3 space-y-1 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">รับเงิน</span>
                  <span className="text-slate-700">{tx.cashReceived.toLocaleString()} ฿</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span className="text-emerald-600">ทอนเงิน</span>
                  <span className="text-emerald-600">{tx.changeAmountLabel}</span>
                </div>
              </div>
            </>
          )}

          <div className="border-t border-dashed border-slate-200" />
          <p className="mt-3 text-center text-xs text-slate-400">ขอบคุณที่ใช้บริการ 🙏</p>
        </div>
      </div>
    </div>
  );
}
