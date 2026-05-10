import { getPosUsers } from '../../pos/_lib/pos-api';
import { MembersClient } from './_components/members-client';

export const dynamic = 'force-dynamic';

export default async function MembersPage() {
  const data = await getPosUsers();

  const active = data.users.filter(u => u.status === 'Active').length;
  const byRole = {
    admin:   data.users.filter(u => u.role === 'admin').length,
    manager: data.users.filter(u => u.role === 'manager').length,
    cashier: data.users.filter(u => u.role === 'cashier').length,
  };

  return (
    <>
      <header className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-[34px] border border-[#d6e4fb] bg-[linear-gradient(145deg,#ffffff_0%,#edf4ff_100%)] p-6 shadow-[0_24px_60px_rgba(37,99,235,0.08)]">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#2563eb]">People lane</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[#10233f]">Member directory</h2>
          <p className="mt-2 text-sm leading-6 text-[#597391]">สมาชิกทั้งหมด {data.users.length} คน · Active {active} คน</p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              { label: 'Admin', value: byRole.admin,   sub: 'สิทธิ์เต็ม' },
              { label: 'Manager', value: byRole.manager, sub: 'จัดการระบบ' },
              { label: 'Cashier', value: byRole.cashier, sub: 'จุดขาย' },
            ].map((item, idx) => (
              <article
                key={item.label}
                className={`rounded-[26px] p-4 ${idx === 1 ? 'bg-[linear-gradient(135deg,#2563eb_0%,#1743b3_100%)] text-white shadow-[0_12px_32px_rgba(37,99,235,0.32)]' : 'border border-[#dce9fb] bg-white'}`}
              >
                <p className={`text-[10px] font-bold uppercase tracking-[0.22em] ${idx === 1 ? 'text-white/65' : 'text-[#6e86a8]'}`}>{item.label}</p>
                <p className={`mt-2 text-3xl font-semibold tracking-[-0.04em] ${idx === 1 ? 'text-white' : 'text-[#10233f]'}`}>{item.value}</p>
                <p className={`mt-1 text-xs ${idx === 1 ? 'text-white/65' : 'text-[#7a93b4]'}`}>{item.sub}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-[30px] border border-[#183f9d] bg-[linear-gradient(145deg,#1e4fc2_0%,#132e8a_100%)] p-6 text-white shadow-[0_24px_60px_rgba(19,46,138,0.28)]">
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-white/55">Directory status</p>
          <p className="mt-3 text-2xl font-semibold tracking-[-0.03em]">Staff on duty</p>
          <div className="mt-5 space-y-3">
            {[
              { label: 'Active members', value: active, total: data.users.length },
              { label: 'Morning shift',  value: data.users.filter(u => u.shift === 'Morning').length,  total: data.users.length },
              { label: 'Evening shift',  value: data.users.filter(u => u.shift === 'Evening').length,  total: data.users.length },
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between rounded-[18px] border border-white/12 bg-white/8 px-4 py-3">
                <p className="text-sm text-white/80">{row.label}</p>
                <p className="text-sm font-semibold">{row.value}<span className="text-white/40"> / {row.total}</span></p>
              </div>
            ))}
          </div>
        </section>
      </header>

      <MembersClient users={data.users} />
    </>
  );
}
