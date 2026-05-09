import { getAdminPos } from '../_lib/admin-api';

export const dynamic = 'force-dynamic';

type Register = {
  counter: string;
  cashier: string;
  shift: string;
  status: 'Open' | 'Closing soon' | 'Closed';
  transactionCount: number;
  averageBasketLabel: string;
  returnsPending: number;
};

function StatusDot({ status }: { readonly status: Register['status'] }) {
  if (status === 'Open') {
    return (
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
      </span>
    );
  }
  if (status === 'Closing soon') {
    return <span className="h-2 w-2 rounded-full bg-amber-400" />;
  }
  return <span className="h-2 w-2 rounded-full bg-gray-300" />;
}

function statusTextClass(status: Register['status']): string {
  const map: Record<Register['status'], string> = {
    'Open': 'text-emerald-600',
    'Closing soon': 'text-amber-600',
    'Closed': 'text-gray-400',
  };
  return map[status];
}

function shiftProgress(status: Register['status']) {
  if (status === 'Open') return { width: '76%', bar: 'bg-emerald-400' };
  if (status === 'Closing soon') return { width: '56%', bar: 'bg-amber-300' };
  return { width: '20%', bar: 'bg-gray-200' };
}

const statusStripClass: Record<Register['status'], string> = {
  'Open': 'bg-emerald-400',
  'Closing soon': 'bg-amber-300',
  'Closed': 'bg-gray-200',
};

function RegisterCard({ register }: { readonly register: Register }) {
  const progress = shiftProgress(register.status);
  const hasReturns = register.returnsPending > 0;

  return (
    <article className="flex flex-col rounded-2xl border border-gray-100 bg-white shadow-sm">
      {/* Card top bar — status color strip */}
      <div className={`h-1 w-full rounded-t-2xl ${statusStripClass[register.status]}`} />

      <div className="flex flex-1 flex-col gap-5 p-5">
        {/* Header row */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <StatusDot status={register.status} />
            <span className={`text-xs font-semibold uppercase tracking-widest ${statusTextClass(register.status)}`}>
              {register.status}
            </span>
          </div>
          <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-sm font-semibold text-gray-500">
            {register.counter}
          </span>
        </div>

        {/* Cashier */}
        <div>
          <p className="text-xl font-semibold tracking-tight text-gray-900">{register.cashier}</p>
          <p className="mt-0.5 text-sm text-gray-400">{register.shift}</p>
        </div>

        {/* Transaction count — hero number */}
        <div className="border-t border-gray-50 pt-4">
          <p className="text-5xl font-bold tracking-tighter text-gray-900">{register.transactionCount}</p>
          <p className="mt-1 text-sm text-gray-400">transactions วันนี้</p>
        </div>

        {/* Metrics row */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="rounded-xl bg-gray-50 px-3 py-3">
            <p className="text-xs text-gray-400">Avg basket</p>
            <p className="mt-1 text-sm font-semibold text-gray-800">{register.averageBasketLabel}</p>
          </div>
          <div className={`rounded-xl px-3 py-3 ${hasReturns ? 'bg-amber-50' : 'bg-gray-50'}`}>
            <p className={`text-xs ${hasReturns ? 'text-amber-600' : 'text-gray-400'}`}>Returns</p>
            <p className={`mt-1 text-sm font-semibold ${hasReturns ? 'text-amber-700' : 'text-gray-800'}`}>
              {register.returnsPending} รายการ
            </p>
          </div>
        </div>

        {/* Shift progress */}
        <div className="mt-auto">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Shift progress</span>
            <span>{progress.width}</span>
          </div>
          <div className="mt-1.5 h-1.5 rounded-full bg-gray-100">
            <div className={`h-1.5 rounded-full transition-all ${progress.bar}`} style={{ width: progress.width }} />
          </div>
        </div>
      </div>
    </article>
  );
}

export default async function AdminPosPage() {
  const pos = await getAdminPos();

  const totalReturns = pos.registers.reduce((sum, r) => sum + r.returnsPending, 0);
  const hasReturnAlert = totalReturns > 0;

  return (
    <div className="space-y-6">
      {/* Hero header */}
      <header className="overflow-hidden rounded-2xl bg-[#0d1117] px-8 py-7 text-white">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/35">POS Operations</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">จัดการหน้าขายและกะพนักงาน</h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-white/45">
              ติดตามสถานะเครื่อง POS ยอดขายต่อกะ และ lane งานที่เกี่ยวข้องกับการคืนสินค้า
            </p>
          </div>

          <span className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-400 ring-1 ring-emerald-500/20">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            {pos.onlineCountersLabel}
          </span>
        </div>

        {/* KPI strip */}
        <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-3">
          {pos.summary.map((item) => (
            <div key={item.label} className="rounded-xl bg-white/5 px-4 py-3.5 ring-1 ring-white/8">
              <p className="text-xs text-white/35">{item.label}</p>
              <p className="mt-1.5 text-2xl font-semibold tracking-tight">{item.value}</p>
            </div>
          ))}
        </div>
      </header>

      {/* Registers section */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-gray-400">Live Registers</h3>
          <div className="flex gap-2 text-xs">
            <span className="flex items-center gap-1.5 text-gray-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Open
            </span>
            <span className="flex items-center gap-1.5 text-gray-400">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> Closing soon
            </span>
            <span className="flex items-center gap-1.5 text-gray-400">
              <span className="h-1.5 w-1.5 rounded-full bg-gray-300" /> Closed
            </span>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {pos.registers.map((register) => (
            <RegisterCard key={register.counter} register={register} />
          ))}
        </div>
      </section>

      {/* Action bar */}
      <div
        className={`flex flex-col gap-4 rounded-2xl p-6 sm:flex-row sm:items-center sm:justify-between ${
          hasReturnAlert
            ? 'bg-amber-50 ring-1 ring-amber-200'
            : 'bg-[#0d1117]'
        }`}
      >
        <div>
          <p
            className={`text-xs font-medium uppercase tracking-widest ${
              hasReturnAlert ? 'text-amber-600' : 'text-white/35'
            }`}
          >
            {hasReturnAlert ? `⚠ ${totalReturns} returns ต้องตรวจสอบ` : 'Recommended action'}
          </p>
          <p className={`mt-2 text-lg font-semibold ${hasReturnAlert ? 'text-amber-900' : 'text-white'}`}>
            {hasReturnAlert
              ? 'มีรายการคืนสินค้าที่ยังรอดำเนินการ — ตรวจสอบและอนุมัติก่อนปิดกะ'
              : 'เร่งกระจายกำลังคนไปยัง counter ที่ order lane หนาแน่น'}
          </p>
          <p className={`mt-1.5 text-sm ${hasReturnAlert ? 'text-amber-700' : 'text-white/45'}`}>
            {hasReturnAlert
              ? 'ใช้ข้อมูลกะและสถานะเครื่องเพื่อจัดการ returns ก่อนเปลี่ยนกะพนักงาน'
              : 'ใช้ข้อมูลกะและสถานะเครื่องเพื่อปรับ staffing ให้เหมาะกับ order load'}
          </p>
        </div>

        {hasReturnAlert && (
          <button className="shrink-0 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-amber-600">
            ดู Returns ทั้งหมด
          </button>
        )}
      </div>
    </div>
  );
}
