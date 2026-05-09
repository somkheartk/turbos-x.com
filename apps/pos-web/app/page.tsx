'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SESSION_KEY } from './_lib/session';

const DEMO_EMAIL = 'somkheart.k@gmail.com';
const DEMO_PASSWORD = 'password';

export default function HomePage() {
  const router = useRouter();
  const [email, setEmail] = useState(DEMO_EMAIL);
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [error, setError] = useState('');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (globalThis.window === undefined) return;
    setIsReady(true);
    if (globalThis.sessionStorage.getItem(SESSION_KEY) === 'active') {
      router.replace('/pos');
    }
  }, [router]);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
      globalThis.sessionStorage.setItem(SESSION_KEY, 'active');
      router.push('/pos');
      return;
    }
    setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-2" style={{ background: 'linear-gradient(145deg,#eef5ff 0%,#f7fbff 50%,#edf4ff 100%)' }}>

      {/* Left — Brand */}
      <section className="flex flex-col justify-center px-10 py-14 lg:px-16">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#2563eb] text-sm font-bold tracking-wide text-white shadow-[0_8px_20px_rgba(37,99,235,0.30)]">
            SS
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#2563eb]">Smartstore</p>
            <p className="text-sm font-semibold text-[#0d2340]">Point of Sale System</p>
          </div>
        </div>

        <h1 className="mt-10 text-4xl font-semibold leading-tight tracking-[-0.04em] text-[#0d2340] sm:text-5xl">
          ระบบ POS<br />สำหรับร้านค้า
        </h1>
        <p className="mt-5 max-w-sm text-base leading-8 text-[#4d6789]">
          จัดการการขาย สินค้า คำสั่งซื้อ และพนักงานจากหน้าจอเดียว
        </p>

        {/* Feature pills */}
        <div className="mt-10 flex flex-wrap gap-3">
          {['Cashier Terminal', 'Stock tracking', 'Order history', 'Staff management'].map(f => (
            <span key={f} className="rounded-full border border-[#cadeff] bg-white/80 px-4 py-1.5 text-xs font-medium text-[#2563eb]">
              {f}
            </span>
          ))}
        </div>
      </section>

      {/* Right — Login form */}
      <section className="flex items-center justify-center bg-white/60 px-6 py-14 backdrop-blur-sm lg:px-12">
        <div className="w-full max-w-sm rounded-2xl border border-[#d8e6fb] bg-white p-8 shadow-[0_20px_60px_rgba(37,99,235,0.12)]">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#2563eb]">เข้าสู่ระบบ</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[#0f2340]">Smartstore POS</h2>

          <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-2 block text-xs font-medium text-[#5f789b]">อีเมล</span>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                className="w-full rounded-xl border border-[#d8e6fb] bg-[#fbfdff] px-4 py-3 text-sm text-[#10233f] outline-none transition focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/10"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-medium text-[#5f789b]">รหัสผ่าน</span>
              <input
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                className="w-full rounded-xl border border-[#d8e6fb] bg-[#fbfdff] px-4 py-3 text-sm text-[#10233f] outline-none transition focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/10"
              />
            </label>

            {error && (
              <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-sm text-red-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={!isReady}
              className="mt-2 w-full rounded-xl bg-[#2563eb] py-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(37,99,235,0.25)] transition hover:bg-[#1d4ed8] disabled:opacity-50"
            >
              เข้าสู่ระบบ
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-[#8faac4]">
            demo: somkheart.k@gmail.com / password
          </p>
        </div>
      </section>
    </main>
  );
}
