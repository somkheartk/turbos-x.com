'use client';

import { useState, useEffect } from 'react';

const SETTINGS_KEY = 'smartstore-settings';

type Settings = {
  storeName: string;
  taxRate: string;
  currency: string;
  timezone: string;
  receiptFooter: string;
  lowStockThreshold: string;
  shiftStartMorning: string;
  shiftStartEvening: string;
  shiftStartNight: string;
};

const DEFAULTS: Settings = {
  storeName: 'Smartstore',
  taxRate: '7',
  currency: 'THB',
  timezone: 'Asia/Bangkok',
  receiptFooter: 'ขอบคุณที่ใช้บริการ',
  lowStockThreshold: '10',
  shiftStartMorning: '06:00',
  shiftStartEvening: '14:00',
  shiftStartNight: '22:00',
};

const inputCls = 'w-full rounded-[14px] border border-[#d6e4fb] px-3 py-2.5 text-sm text-[#10233f] outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/10 bg-white';
const labelCls = 'mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#6e86a8]';

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = globalThis.localStorage?.getItem(SETTINGS_KEY);
      if (stored) setSettings({ ...DEFAULTS, ...JSON.parse(stored) });
    } catch { /* ignore */ }
  }, []);

  function update(key: keyof Settings, value: string) {
    setSettings(s => ({ ...s, [key]: value }));
    setSaved(false);
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    try {
      globalThis.localStorage?.setItem(SETTINGS_KEY, JSON.stringify(settings));
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch { /* ignore */ }
  }

  function handleReset() {
    setSettings(DEFAULTS);
    try { globalThis.localStorage?.removeItem(SETTINGS_KEY); } catch { /* ignore */ }
    setSaved(false);
  }

  return (
    <form onSubmit={handleSave}>
      <header className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <section className="rounded-[34px] border border-[#d6e4fb] bg-[linear-gradient(145deg,#ffffff_0%,#edf4ff_100%)] p-6 shadow-[0_24px_60px_rgba(37,99,235,0.08)]">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#2563eb]">Config lane</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[#10233f]">ตั้งค่าระบบ</h2>
          <p className="mt-2 text-sm leading-6 text-[#597391]">ปรับค่า store, ภาษี, กะการทำงาน และ receipt จากจุดเดียว</p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              { label: 'Store name', value: settings.storeName },
              { label: 'Tax rate', value: `${settings.taxRate}%` },
              { label: 'Low stock alert', value: `≤ ${settings.lowStockThreshold} units` },
            ].map((item, idx) => (
              <article key={item.label} className={`rounded-[26px] p-4 ${idx === 1 ? 'bg-[linear-gradient(135deg,#2563eb_0%,#1743b3_100%)] text-white shadow-[0_12px_32px_rgba(37,99,235,0.32)]' : 'border border-[#dce9fb] bg-white'}`}>
                <p className={`text-[10px] font-bold uppercase tracking-[0.22em] ${idx === 1 ? 'text-white/65' : 'text-[#6e86a8]'}`}>{item.label}</p>
                <p className={`mt-2 text-xl font-semibold tracking-[-0.02em] ${idx === 1 ? 'text-white' : 'text-[#10233f]'}`}>{item.value}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-[30px] border border-[#183f9d] bg-[linear-gradient(145deg,#1e4fc2_0%,#132e8a_100%)] p-6 text-white shadow-[0_24px_60px_rgba(19,46,138,0.28)]">
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-white/55">Shift schedule</p>
          <p className="mt-3 text-xl font-semibold tracking-[-0.03em]">กะการทำงาน</p>
          <div className="mt-5 space-y-3">
            {[
              { label: 'Morning shift', value: settings.shiftStartMorning },
              { label: 'Evening shift', value: settings.shiftStartEvening },
              { label: 'Night shift',   value: settings.shiftStartNight },
            ].map(s => (
              <div key={s.label} className="flex items-center justify-between rounded-[18px] border border-white/12 bg-white/8 px-4 py-3">
                <p className="text-sm text-white/80">{s.label}</p>
                <p className="text-sm font-semibold">{s.value}</p>
              </div>
            ))}
          </div>
        </section>
      </header>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        {/* Store */}
        <section className="rounded-[32px] border border-[#d6e4fb] bg-white p-6 shadow-[0_12px_32px_rgba(37,99,235,0.06)]">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#6e86a8]">Store config</p>
          <h3 className="mt-1 text-base font-semibold text-[#10233f]">ข้อมูลร้าน</h3>
          <div className="mt-5 space-y-4">
            <label className="block">
              <span className={labelCls}>ชื่อร้าน</span>
              <input type="text" value={settings.storeName} onChange={e => update('storeName', e.target.value)} className={inputCls} />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className={labelCls}>สกุลเงิน</span>
                <select value={settings.currency} onChange={e => update('currency', e.target.value)} className={inputCls}>
                  <option value="THB">THB (฿)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </label>
              <label className="block">
                <span className={labelCls}>Timezone</span>
                <select value={settings.timezone} onChange={e => update('timezone', e.target.value)} className={inputCls}>
                  <option value="Asia/Bangkok">Asia/Bangkok (UTC+7)</option>
                  <option value="Asia/Singapore">Asia/Singapore (UTC+8)</option>
                  <option value="UTC">UTC</option>
                </select>
              </label>
            </div>
            <label className="block">
              <span className={labelCls}>ข้อความท้ายใบเสร็จ</span>
              <input type="text" value={settings.receiptFooter} onChange={e => update('receiptFooter', e.target.value)} className={inputCls} />
            </label>
          </div>
        </section>

        {/* Operations */}
        <section className="rounded-[32px] border border-[#d6e4fb] bg-white p-6 shadow-[0_12px_32px_rgba(37,99,235,0.06)]">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#6e86a8]">Operations config</p>
          <h3 className="mt-1 text-base font-semibold text-[#10233f]">การดำเนินงาน</h3>
          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className={labelCls}>ภาษี VAT (%)</span>
                <input type="number" min="0" max="30" step="0.5" value={settings.taxRate} onChange={e => update('taxRate', e.target.value)} className={inputCls} />
              </label>
              <label className="block">
                <span className={labelCls}>แจ้งเตือนสต๊อกต่ำ (ชิ้น)</span>
                <input type="number" min="0" value={settings.lowStockThreshold} onChange={e => update('lowStockThreshold', e.target.value)} className={inputCls} />
              </label>
            </div>
            <div className="space-y-2">
              <span className={labelCls}>เวลาเริ่มแต่ละกะ</span>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { key: 'shiftStartMorning' as const, label: 'Morning' },
                  { key: 'shiftStartEvening' as const, label: 'Evening' },
                  { key: 'shiftStartNight' as const, label: 'Night' },
                ].map(s => (
                  <label key={s.key} className="block">
                    <span className="mb-1 block text-[10px] font-medium text-[#9ab4d0]">{s.label}</span>
                    <input type="time" value={settings[s.key]} onChange={e => update(s.key, e.target.value)} className={inputCls} />
                  </label>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Actions */}
      <div className="mt-6 flex items-center justify-between gap-4 rounded-[28px] border border-[#d6e4fb] bg-white px-6 py-4 shadow-[0_12px_32px_rgba(37,99,235,0.06)]">
        <button type="button" onClick={handleReset} className="rounded-[14px] border border-[#d6e4fb] px-5 py-2.5 text-sm font-medium text-[#597391] hover:bg-[#f5f9ff] transition-colors">
          Reset to default
        </button>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="text-sm font-medium text-emerald-600">บันทึกแล้ว ✓</span>
          )}
          <button type="submit" className="rounded-[14px] bg-[#2563eb] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#1d4ed8] transition-colors">
            บันทึกการตั้งค่า
          </button>
        </div>
      </div>
    </form>
  );
}
