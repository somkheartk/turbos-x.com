import { getDashboard, getOrders, getProducts } from './_lib';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

function fmtTHB(n: number) {
  return '฿' + n.toLocaleString('th-TH', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export default async function PosDashboardPage() {
  const [dashboard, ordersResult, productsResult] = await Promise.all([
    getDashboard(),
    getOrders().catch(() => null),
    getProducts().catch(() => null),
  ]);

  const transactions = ordersResult?.transactions ?? [];
  const allProducts  = productsResult?.products  ?? [];

  const completedTx  = transactions.filter(t => t.status === 'Completed');
  const voidedCount  = transactions.filter(t => t.status === 'Voided').length;

  const totalItemsSold    = completedTx.reduce((sum, tx) => sum + tx.items.reduce((s, i) => s + i.qty, 0), 0);
  const totalDiscount     = completedTx.reduce((sum, tx) => sum + tx.discount, 0);
  const avgItemsPerBill   = completedTx.length > 0 ? (totalItemsSold / completedTx.length).toFixed(1) : '0';
  const voidRate          = transactions.length  > 0 ? Math.round((voidedCount / transactions.length) * 100) : 0;

  const recentTx = transactions.slice(0, 6);

  const payBreakdown = completedTx.reduce(
    (acc, tx) => {
      acc[tx.paymentMethod].count++;
      acc[tx.paymentMethod].total += tx.total;
      return acc;
    },
    { Cash: { count: 0, total: 0 }, QR: { count: 0, total: 0 }, Card: { count: 0, total: 0 } } as Record<
      'Cash' | 'QR' | 'Card',
      { count: number; total: number }
    >,
  );
  const totalCompletedCount = payBreakdown.Cash.count + payBreakdown.QR.count + payBreakdown.Card.count;

  // Aggregate items sold per product
  const productMap = new Map<string, { name: string; qty: number; revenue: number }>();
  for (const tx of completedTx) {
    for (const item of tx.items) {
      const cur = productMap.get(item.productSku) ?? { name: item.productName, qty: 0, revenue: 0 };
      cur.qty     += item.qty;
      cur.revenue += item.lineTotal;
      productMap.set(item.productSku, cur);
    }
  }
  const topProducts   = [...productMap.values()].sort((a, b) => b.qty - a.qty).slice(0, 5);
  const maxProductQty = topProducts[0]?.qty || 1;

  const lowStock = allProducts
    .filter(p => p.status === 'Active' && p.stockOnHand < 10)
    .sort((a, b) => a.stockOnHand - b.stockOnHand)
    .slice(0, 5);

  const payMethods = [
    { key: 'Cash' as const, label: 'เงินสด',  bar: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700' },
    { key: 'QR'   as const, label: 'QR Code', bar: 'bg-violet-500',  badge: 'bg-violet-50 text-violet-700'  },
    { key: 'Card' as const, label: 'Card',    bar: 'bg-amber-500',   badge: 'bg-amber-50 text-amber-700'    },
  ];

  const kpiIcons = [
    // Revenue
    <svg key="rev" className="h-4 w-4 text-white" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>,
    // Orders
    <svg key="ord" className="h-4 w-4 text-slate-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" />
    </svg>,
    // Avg
    <svg key="avg" className="h-4 w-4 text-slate-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
    </svg>,
  ];

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
          <p className="mt-0.5 text-sm text-slate-500">ภาพรวมการขายและ counter วันนี้</p>
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

      {/* KPI Cards — 3 from API + computed items sold */}
      <div className="grid grid-cols-4 gap-4">
        {dashboard.kpis.map((kpi, i) => (
          <div
            key={kpi.label}
            className={`relative overflow-hidden rounded-2xl border p-5 ${
              i === 0
                ? 'border-[#2563eb] bg-[linear-gradient(135deg,#1d4ed8_0%,#2563eb_100%)] text-white shadow-[0_8px_24px_rgba(37,99,235,0.25)]'
                : 'border-slate-100 bg-white'
            }`}
          >
            {i === 0 && <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10" />}
            <div className={`mb-3 inline-flex h-8 w-8 items-center justify-center rounded-xl ${i === 0 ? 'bg-white/20' : 'bg-slate-100'}`}>
              {kpiIcons[i]}
            </div>
            <p className={`text-xs font-medium ${i === 0 ? 'text-blue-200' : 'text-slate-400'}`}>{kpi.label}</p>
            <p className={`mt-1 text-2xl font-bold tracking-tight ${i === 0 ? 'text-white' : 'text-slate-900'}`}>{kpi.value}</p>
            {kpi.detail && <p className={`mt-0.5 text-xs ${i === 0 ? 'text-blue-200' : 'text-slate-400'}`}>{kpi.detail}</p>}
          </div>
        ))}

        {/* Items Sold — computed from orders */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5">
          <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100">
            <svg className="h-4 w-4 text-slate-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z" />
            </svg>
          </div>
          <p className="text-xs font-medium text-slate-400">สินค้าที่ขาย</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{totalItemsSold.toLocaleString('th-TH')}</p>
          <p className="mt-0.5 text-xs text-slate-400">ชิ้น วันนี้</p>
        </div>
      </div>

      {/* Quick Stats Strip */}
      <div className="grid grid-cols-3 gap-4">
        <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white px-5 py-4">
          <div>
            <p className="text-xs font-medium text-slate-400">ส่วนลดรวม</p>
            <p className="mt-0.5 text-xl font-bold tracking-tight text-slate-900">{fmtTHB(totalDiscount)}</p>
          </div>
          <p className="text-xs text-slate-400">วันนี้</p>
        </div>
        <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white px-5 py-4">
          <div>
            <p className="text-xs font-medium text-slate-400">เฉลี่ยต่อบิล</p>
            <p className="mt-0.5 text-xl font-bold tracking-tight text-slate-900">{avgItemsPerBill} ชิ้น</p>
          </div>
          <p className="text-xs text-slate-400">/ บิล</p>
        </div>
        <div className={`flex items-center justify-between rounded-2xl border px-5 py-4 ${voidedCount > 0 ? 'border-red-100 bg-red-50' : 'border-slate-100 bg-white'}`}>
          <div>
            <p className={`text-xs font-medium ${voidedCount > 0 ? 'text-red-400' : 'text-slate-400'}`}>บิลโมฆะ</p>
            <p className={`mt-0.5 text-xl font-bold tracking-tight ${voidedCount > 0 ? 'text-red-700' : 'text-slate-900'}`}>{voidedCount} บิล</p>
          </div>
          <p className={`text-xs ${voidedCount > 0 ? 'text-red-400' : 'text-slate-400'}`}>{voidRate}% ของทั้งหมด</p>
        </div>
      </div>

      {/* Recent Transactions + Right Sidebar */}
      <div className="grid gap-5 lg:grid-cols-[1fr_272px]">

        {/* Recent Transactions */}
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white">
          <div className="flex items-center justify-between border-b border-slate-50 px-6 py-4">
            <p className="text-sm font-semibold text-slate-800">ธุรกรรมล่าสุด</p>
            <Link href="/pos/orders" className="text-xs font-medium text-[#2563eb] hover:underline">
              ดูทั้งหมด →
            </Link>
          </div>
          {recentTx.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                <svg className="h-6 w-6 text-slate-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z" />
                </svg>
              </div>
              <p className="text-sm text-slate-400">ยังไม่มี transactions วันนี้</p>
              <Link href="/pos/cashier" className="mt-2 text-xs font-medium text-[#2563eb] hover:underline">
                เริ่มขายจากหน้า Cashier →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {recentTx.map((tx) => (
                <div key={tx.transactionId} className="flex items-center gap-4 px-6 py-3.5">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                    tx.paymentMethod === 'Cash' ? 'bg-emerald-50 text-emerald-700' :
                    tx.paymentMethod === 'QR'   ? 'bg-violet-50 text-violet-700'  :
                                                  'bg-amber-50 text-amber-700'
                  }`}>
                    {tx.paymentMethod === 'Cash' ? '฿' : tx.paymentMethod}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-800">
                      #{tx.transactionId.slice(-6).toUpperCase()}
                      {tx.status === 'Voided' && (
                        <span className="ml-2 inline-flex rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold text-red-600">โมฆะ</span>
                      )}
                    </p>
                    <p className="truncate text-xs text-slate-400">
                      {tx.cashierName} · {tx.items.length} รายการ · {tx.createdAtLabel}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-bold text-slate-900">{tx.totalLabel}</p>
                    {tx.discount > 0 && (
                      <p className="text-xs text-slate-400">ลด {fmtTHB(tx.discount)}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="flex flex-col gap-4">

          {/* Online POS */}
          <div className="rounded-2xl border border-slate-100 bg-white px-6 py-5">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              <p className="text-xs font-semibold text-emerald-600">Online now</p>
            </div>
            <p className="mt-3 text-5xl font-bold tracking-tight text-slate-900">{dashboard.onlineCounters}</p>
            <p className="mt-1 text-sm text-slate-400">เครื่อง POS เปิดอยู่</p>
          </div>

          {/* Payment Breakdown */}
          <div className="rounded-2xl border border-slate-100 bg-white px-6 py-5">
            <p className="mb-4 text-sm font-semibold text-slate-800">ช่องทางชำระเงิน</p>
            {totalCompletedCount === 0 ? (
              <p className="py-2 text-xs text-slate-400">ยังไม่มีข้อมูล</p>
            ) : (
              <div className="space-y-4">
                {payMethods.map(({ key, label, bar, badge }) => {
                  const pct = Math.round((payBreakdown[key].count / totalCompletedCount) * 100);
                  return (
                    <div key={key}>
                      <div className="mb-1.5 flex items-center justify-between">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${badge}`}>{label}</span>
                        <span className="text-xs font-semibold text-slate-700">{payBreakdown[key].count} บิล ({pct}%)</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                        <div className={`h-1.5 rounded-full ${bar}`} style={{ width: `${pct}%` }} />
                      </div>
                      <p className="mt-1 text-right text-xs text-slate-400">{fmtTHB(payBreakdown[key].total)}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Branch Info */}
          <div className="space-y-3 rounded-2xl border border-slate-100 bg-white px-6 py-5">
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

      {/* Top Selling Products + Low Stock */}
      <div className="grid gap-5 lg:grid-cols-2">

        {/* Top Products */}
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white">
          <div className="border-b border-slate-50 px-6 py-4">
            <p className="text-sm font-semibold text-slate-800">สินค้าขายดีวันนี้</p>
          </div>
          {topProducts.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm text-slate-400">ยังไม่มีข้อมูล</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {topProducts.map((p, i) => (
                <div key={p.name} className="flex items-center gap-4 px-6 py-3.5">
                  <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    i === 0 ? 'bg-[#2563eb] text-white' :
                    i === 1 ? 'bg-slate-700 text-white' :
                    i === 2 ? 'bg-slate-400 text-white' :
                              'bg-slate-100 text-slate-500'
                  }`}>
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-800">{p.name}</p>
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-1.5 rounded-full bg-[#2563eb]/60"
                        style={{ width: `${Math.round((p.qty / maxProductQty) * 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-bold text-slate-900">{p.qty} ชิ้น</p>
                    <p className="text-xs text-slate-400">{fmtTHB(p.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Alert */}
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white">
          <div className="flex items-center gap-2 border-b border-slate-50 px-6 py-4">
            <svg className="h-4 w-4 text-amber-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
            <p className="text-sm font-semibold text-slate-800">Stock ใกล้หมด</p>
            <Link href="/pos/products" className="ml-auto text-xs font-medium text-[#2563eb] hover:underline">
              จัดการ →
            </Link>
          </div>
          {lowStock.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm text-slate-400">Stock ปกติทุกรายการ ✓</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {lowStock.map((p) => (
                <div key={p.sku} className="flex items-center gap-4 px-6 py-3.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-800">{p.name}</p>
                    <p className="text-xs text-slate-400">{p.sku} · {p.category}</p>
                  </div>
                  <span className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                    p.stockOnHand === 0 ? 'bg-red-100 text-red-700' :
                    p.stockOnHand < 5  ? 'bg-orange-100 text-orange-700' :
                                         'bg-amber-100 text-amber-700'
                  }`}>
                    {p.stockOnHand === 0 ? 'หมด' : `${p.stockOnHand} ชิ้น`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Top Cashiers */}
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white">
        <div className="border-b border-slate-50 px-6 py-4">
          <p className="text-sm font-semibold text-slate-800">Top Cashier วันนี้</p>
        </div>
        {dashboard.topCashiers.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm text-slate-400">ยังไม่มีข้อมูล</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50 sm:grid sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
            {dashboard.topCashiers.map((c, i) => (
              <div key={c.name} className="flex items-center gap-3 px-6 py-4">
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  i === 0 ? 'bg-[#2563eb] text-white' :
                  i === 1 ? 'bg-slate-700 text-white' :
                  i === 2 ? 'bg-slate-400 text-white' :
                            'bg-slate-100 text-slate-500'
                }`}>
                  {c.rank}
                </span>
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                  {c.name[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-800">{c.name}</p>
                  <p className="text-xs text-slate-400">{c.transactions} tx</p>
                </div>
                <p className="shrink-0 text-sm font-bold text-slate-900">{c.totalLabel}</p>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
