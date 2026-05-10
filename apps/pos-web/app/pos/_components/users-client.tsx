'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { PosUser } from '../_lib/pos-api';
import { createPosUser } from '../_lib/pos-api';
import { Modal } from './modal';
import { UserToggleButton } from './user-toggle-button';

const roleStyle: Record<string, { dot: string; text: string }> = {
  admin:    { dot: 'bg-violet-500', text: 'text-violet-600' },
  manager:  { dot: 'bg-blue-500',   text: 'text-blue-600'   },
  cashier:  { dot: 'bg-slate-400',  text: 'text-slate-500'  },
};
const avatarColor = [
  'bg-orange-100 text-orange-700',
  'bg-blue-100 text-blue-700',
  'bg-emerald-100 text-emerald-700',
  'bg-violet-100 text-violet-700',
];

type Props = { readonly users: PosUser[] };

const EMPTY_FORM = { name: '', role: 'cashier' as PosUser['role'], shift: 'Morning', pin: '' };

export function UsersClient({ users }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const activeCount = users.filter(u => u.status === 'Active').length;

  function toggleExpand(id: string) {
    setExpanded(prev => (prev === id ? null : id));
  }

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
      setError('เพิ่มพนักงานไม่สำเร็จ กรุณาลองใหม่');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">พนักงาน</h1>
          <p className="mt-0.5 text-sm text-slate-500">{activeCount} Active · {users.length} ทั้งหมด</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-xl bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1d4ed8] transition-colors"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
          </svg>
          เพิ่มพนักงาน
        </button>
      </div>

      <div className="mt-6 overflow-x-auto">
      <div className="min-w-[600px] overflow-hidden rounded-xl border border-slate-100 bg-white">
        <div className="grid grid-cols-[1fr_auto_auto_auto_auto] border-b border-slate-50 px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          <span>พนักงาน</span>
          <span className="px-6">Role</span>
          <span className="px-6">กะ</span>
          <span className="px-6">Status</span>
          <span className="pl-6" />
        </div>

        <div className="divide-y divide-slate-50">
          {users.map((user, i) => {
            const style = roleStyle[user.role];
            const color = avatarColor[i % avatarColor.length];
            return (
              <div key={user.id}>
                <div className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center px-5 py-3.5 hover:bg-slate-50/60 transition-colors">
                  <button className="flex items-center gap-3 text-left" onClick={() => toggleExpand(user.id)}>
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${color}`}>
                      {user.name[0]}
                    </div>
                    <p className="text-sm font-medium text-slate-900">{user.name}</p>
                  </button>
                  <div className="px-6">
                    <span className={`flex items-center gap-1.5 text-xs font-medium capitalize ${style.text}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                      {user.role}
                    </span>
                  </div>
                  <p className="px-6 text-sm text-slate-500">{user.shift ?? '—'}</p>
                  <div className="px-6">
                    <span className={`text-xs font-medium ${user.status === 'Active' ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {user.status}
                    </span>
                  </div>
                  <div className="pl-6">
                    <UserToggleButton userId={user.id} currentStatus={user.status} />
                  </div>
                </div>

                {expanded === user.id && (
                  <div className="grid grid-cols-4 gap-4 border-t border-slate-50 bg-[#f7fbff] px-5 py-4">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">ชื่อ</p>
                      <p className="mt-1 text-sm font-medium text-slate-800">{user.name}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">บทบาท</p>
                      <p className={`mt-1 text-sm font-medium capitalize ${style.text}`}>{user.role}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">กะทำงาน</p>
                      <p className="mt-1 text-sm font-medium text-slate-800">{user.shift ?? '—'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">สถานะ</p>
                      <p className={`mt-1 text-sm font-semibold ${user.status === 'Active' ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {user.status}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      </div>

      {isPending && <p className="mt-3 text-xs text-slate-400">กำลังอัปเดต...</p>}

      {showModal && (
        <Modal title="เพิ่มพนักงานใหม่" onClose={closeModal}>
          <form onSubmit={handleAdd} className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-slate-500">ชื่อ</span>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="เช่น สมชาย"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/10"
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-slate-500">บทบาท</span>
                <select
                  value={form.role}
                  onChange={e => setForm(f => ({ ...f, role: e.target.value as PosUser['role'] }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-[#2563eb]"
                >
                  <option value="cashier">Cashier</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-slate-500">กะ</span>
                <select
                  value={form.shift}
                  onChange={e => setForm(f => ({ ...f, shift: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-[#2563eb]"
                >
                  <option value="Morning">Morning</option>
                  <option value="Evening">Evening</option>
                  <option value="Night">Night</option>
                </select>
              </label>
            </div>

            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-slate-500">PIN (4 หลัก)</span>
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={form.pin}
                onChange={e => setForm(f => ({ ...f, pin: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                placeholder="••••"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/10"
              />
            </label>

            {error && <p className="text-xs text-red-500">{error}</p>}

            <div className="flex gap-2 pt-1">
              <button type="button" onClick={closeModal} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                ยกเลิก
              </button>
              <button type="submit" disabled={saving} className="flex-1 rounded-xl bg-[#2563eb] py-2.5 text-sm font-semibold text-white hover:bg-[#1d4ed8] disabled:opacity-50 transition-colors">
                {saving ? 'กำลังบันทึก…' : 'เพิ่มพนักงาน'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
