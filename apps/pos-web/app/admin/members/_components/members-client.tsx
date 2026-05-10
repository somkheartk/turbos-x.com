'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { PosUser } from '../../../pos/_lib/pos-api';
import { createPosUser, updatePosUser } from '../../../pos/_lib/pos-api';

const roleStyle: Record<string, { dot: string; badge: string }> = {
  admin:   { dot: 'bg-violet-500', badge: 'bg-violet-50 text-violet-700 border-violet-200' },
  manager: { dot: 'bg-blue-500',   badge: 'bg-blue-50 text-blue-700 border-blue-200'       },
  cashier: { dot: 'bg-slate-400',  badge: 'bg-slate-50 text-slate-600 border-slate-200'    },
};

const avatarColor = [
  'bg-orange-100 text-orange-700',
  'bg-blue-100 text-blue-700',
  'bg-emerald-100 text-emerald-700',
  'bg-violet-100 text-violet-700',
];

const EMPTY_FORM = { name: '', role: 'cashier' as PosUser['role'], shift: 'Morning', pin: '' };

export function MembersClient({ users }: { readonly users: PosUser[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const filtered = users.filter(u =>
    (filterRole === 'all' || u.role === filterRole) &&
    (filterStatus === 'all' || u.status === filterStatus)
  );

  function closeModal() {
    setShowModal(false);
    setForm(EMPTY_FORM);
    setError('');
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.pin) { setError('กรุณากรอกชื่อและ PIN'); return; }
    if (!/^\d{4}$/.test(form.pin)) { setError('PIN ต้องเป็นตัวเลข 4 หลัก'); return; }
    setSaving(true);
    try {
      await createPosUser({ name: form.name, role: form.role, pin: form.pin, shift: form.shift });
      closeModal();
      startTransition(() => router.refresh());
    } catch {
      setError('เพิ่มสมาชิกไม่สำเร็จ กรุณาลองใหม่');
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(user: PosUser) {
    setTogglingId(user.id);
    try {
      await updatePosUser(user.id, { status: user.status === 'Active' ? 'Inactive' : 'Active' });
      startTransition(() => router.refresh());
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <>
      <section className="mt-8 rounded-[32px] border border-[#d6e4fb] bg-white shadow-[0_12px_32px_rgba(37,99,235,0.06)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#edf4ff] px-6 py-5">
          <h3 className="text-base font-semibold text-[#10233f]">รายชื่อสมาชิก</h3>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filterRole}
              onChange={e => setFilterRole(e.target.value)}
              className="rounded-[14px] border border-[#d6e4fb] bg-[#f5f9ff] px-3 py-2 text-xs font-medium text-[#35557f] outline-none"
            >
              <option value="all">ทุก Role</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="cashier">Cashier</option>
            </select>

            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="rounded-[14px] border border-[#d6e4fb] bg-[#f5f9ff] px-3 py-2 text-xs font-medium text-[#35557f] outline-none"
            >
              <option value="all">ทุกสถานะ</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>

            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 rounded-[14px] bg-[#2563eb] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1d4ed8] transition-colors"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path d="M12 5v14M5 12h14" strokeLinecap="round" />
              </svg>
              เพิ่มสมาชิก
            </button>
          </div>
        </div>

        <div className="divide-y divide-[#f0f6ff]">
          {filtered.length === 0 && (
            <p className="px-6 py-10 text-center text-sm text-[#7a93b4]">ไม่พบสมาชิก</p>
          )}
          {filtered.map((user, i) => {
            const style = roleStyle[user.role];
            const color = avatarColor[i % avatarColor.length];
            const isToggling = togglingId === user.id;

            return (
              <div key={user.id} className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] items-center gap-4 px-6 py-4 hover:bg-[#f8fbff] transition-colors">
                <div className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${color}`}>
                  {user.name[0]}
                </div>

                <div>
                  <p className="text-sm font-semibold text-[#10233f]">{user.name}</p>
                  <p className="text-xs text-[#7a93b4]">{user.shift ?? '—'} shift</p>
                </div>

                <span className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize ${style.badge}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                  {user.role}
                </span>

                <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${user.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-400'}`}>
                  {user.status}
                </span>

                <button
                  onClick={() => handleToggle(user)}
                  disabled={isToggling}
                  className={`rounded-[12px] border px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-40 ${user.status === 'Active' ? 'border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100' : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
                >
                  {isToggling ? '…' : user.status === 'Active' ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={closeModal}>
          <div className="w-full max-w-md rounded-[28px] border border-[#d6e4fb] bg-white p-6 shadow-[0_32px_80px_rgba(37,99,235,0.18)]" onClick={e => e.stopPropagation()}>
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-base font-semibold text-[#10233f]">เพิ่มสมาชิกใหม่</h3>
              <button onClick={closeModal} className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f0f4f8] text-[#597391] hover:bg-[#e4edf8]">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#6e86a8]">ชื่อ</span>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="เช่น สมชาย"
                  className="w-full rounded-[14px] border border-[#d6e4fb] px-3 py-2.5 text-sm text-[#10233f] outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/10"
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#6e86a8]">บทบาท</span>
                  <select
                    value={form.role}
                    onChange={e => setForm(f => ({ ...f, role: e.target.value as PosUser['role'] }))}
                    className="w-full rounded-[14px] border border-[#d6e4fb] px-3 py-2.5 text-sm text-[#10233f] outline-none focus:border-[#2563eb]"
                  >
                    <option value="cashier">Cashier</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#6e86a8]">กะ</span>
                  <select
                    value={form.shift}
                    onChange={e => setForm(f => ({ ...f, shift: e.target.value }))}
                    className="w-full rounded-[14px] border border-[#d6e4fb] px-3 py-2.5 text-sm text-[#10233f] outline-none focus:border-[#2563eb]"
                  >
                    <option value="Morning">Morning</option>
                    <option value="Evening">Evening</option>
                    <option value="Night">Night</option>
                  </select>
                </label>
              </div>

              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#6e86a8]">PIN (4 หลัก)</span>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={form.pin}
                  onChange={e => setForm(f => ({ ...f, pin: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                  placeholder="••••"
                  className="w-full rounded-[14px] border border-[#d6e4fb] px-3 py-2.5 text-sm text-[#10233f] outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/10"
                />
              </label>

              {error && <p className="text-xs text-rose-500">{error}</p>}

              <div className="flex gap-2 pt-1">
                <button type="button" onClick={closeModal} className="flex-1 rounded-[14px] border border-[#d6e4fb] py-2.5 text-sm font-medium text-[#35557f] hover:bg-[#f5f9ff] transition-colors">
                  ยกเลิก
                </button>
                <button type="submit" disabled={saving} className="flex-1 rounded-[14px] bg-[#2563eb] py-2.5 text-sm font-semibold text-white hover:bg-[#1d4ed8] disabled:opacity-50 transition-colors">
                  {saving ? 'กำลังบันทึก…' : 'เพิ่มสมาชิก'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
