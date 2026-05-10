'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { PosProduct } from '../_lib/pos-api';
import { createPosProduct } from '../_lib/pos-api';
import { Modal } from './modal';

const CATEGORY_THEME: Record<string, { bg: string; text: string; icon: string }> = {
  'สกินแคร์':   { bg: 'from-rose-400 to-pink-500',     text: 'text-rose-50',   icon: '✨' },
  'ครีมกันแดด': { bg: 'from-amber-400 to-orange-500',  text: 'text-amber-50',  icon: '☀️' },
  'เซรั่ม':     { bg: 'from-violet-400 to-purple-500', text: 'text-violet-50', icon: '💧' },
  'คลีนเซอร์':  { bg: 'from-sky-400 to-cyan-500',      text: 'text-sky-50',    icon: '🫧' },
  'มอยส์เจอ':  { bg: 'from-teal-400 to-emerald-500',  text: 'text-teal-50',   icon: '🌿' },
  'Serum':      { bg: 'from-violet-400 to-purple-500', text: 'text-violet-50', icon: '💧' },
  'Sunscreen':  { bg: 'from-amber-400 to-orange-500',  text: 'text-amber-50',  icon: '☀️' },
  'Cleanser':   { bg: 'from-sky-400 to-cyan-500',      text: 'text-sky-50',    icon: '🫧' },
  'Mask':       { bg: 'from-indigo-400 to-blue-500',   text: 'text-indigo-50', icon: '🌙' },
  'Booster':    { bg: 'from-fuchsia-400 to-pink-500',  text: 'text-fuchsia-50',icon: '⚡' },
};

const DEFAULT_THEME = { bg: 'from-slate-400 to-slate-500', text: 'text-slate-50', icon: '📦' };

function getTheme(category: string, name: string) {
  if (CATEGORY_THEME[category]) return CATEGORY_THEME[category];
  for (const [key, theme] of Object.entries(CATEGORY_THEME)) {
    if (name.toLowerCase().includes(key.toLowerCase()) || category.toLowerCase().includes(key.toLowerCase())) {
      return theme;
    }
  }
  return DEFAULT_THEME;
}

const STATUS_STYLE = {
  Active:   { dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  Draft:    { dot: 'bg-amber-400',   badge: 'bg-amber-50 text-amber-700 border-amber-200'       },
  Archived: { dot: 'bg-slate-300',   badge: 'bg-slate-50 text-slate-500 border-slate-200'       },
};

type Props = { readonly products: PosProduct[]; readonly categories: string[] };
const EMPTY_FORM = { name: '', sku: '', category: '', price: '', stockOnHand: '' };

export function ProductsClient({ products, categories }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [activeCategory, setActiveCategory] = useState('ทั้งหมด');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const filtered = activeCategory === 'ทั้งหมด'
    ? products
    : products.filter(p => p.category === activeCategory);

  function closeModal() { setShowModal(false); setForm(EMPTY_FORM); setError(''); }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.sku || !form.category || !form.price || !form.stockOnHand) {
      setError('กรุณากรอกข้อมูลให้ครบ'); return;
    }
    const price = Number(form.price);
    const stockOnHand = Number(form.stockOnHand);
    if (price <= 0 || stockOnHand < 0) { setError('ราคาต้องมากกว่า 0 และสต็อกต้องไม่ติดลบ'); return; }
    setSaving(true);
    try {
      await createPosProduct({ name: form.name, sku: form.sku, category: form.category, price, stockOnHand });
      closeModal();
      startTransition(() => router.refresh());
    } catch { setError('เพิ่มสินค้าไม่สำเร็จ กรุณาลองใหม่'); }
    finally { setSaving(false); }
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">สินค้า</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {products.filter(p => p.status === 'Active').length} Active · {products.length} ทั้งหมด
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-xl bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1d4ed8] transition-colors"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
          </svg>
          เพิ่มสินค้า
        </button>
      </div>

      {/* Category filter */}
      <div className="mt-5 flex gap-2 flex-wrap">
        {['ทั้งหมด', ...categories].map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
              activeCategory === cat
                ? 'bg-[#2563eb] text-white shadow-sm'
                : 'border border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Card grid */}
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map(product => {
          const theme = getTheme(product.category, product.name);
          const style = STATUS_STYLE[product.status];
          const isLowStock = product.stockOnHand > 0 && product.stockOnHand <= 10;
          const isOutOfStock = product.stockOnHand === 0;
          let stockColor = 'text-slate-700';
          if (isOutOfStock) stockColor = 'text-red-500';
          else if (isLowStock) stockColor = 'text-amber-500';

          return (
            <article key={product.sku} className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:shadow-md hover:-translate-y-0.5">
              {/* Image placeholder */}
              <div className={`relative flex h-36 items-center justify-center bg-gradient-to-br ${theme.bg}`}>
                <span className="text-5xl drop-shadow-sm">{theme.icon}</span>
                {/* Status badge */}
                <span className={`absolute right-3 top-3 flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${style.badge}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                  {product.status}
                </span>
                {/* Stock warning */}
                {isOutOfStock && (
                  <span className="absolute left-3 top-3 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
                    หมด
                  </span>
                )}
                {isLowStock && (
                  <span className="absolute left-3 top-3 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold text-white">
                    ใกล้หมด
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="p-4">
                <p className="truncate text-sm font-semibold text-slate-900">{product.name}</p>
                <p className="mt-0.5 text-[11px] text-slate-400">{product.sku} · {product.category}</p>

                <div className="mt-3 flex items-end justify-between">
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">ราคา</p>
                    <p className="mt-0.5 text-lg font-bold text-[#1f56c5]">{product.priceLabel}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">คงเหลือ</p>
                    <p className={`mt-0.5 text-lg font-bold ${stockColor}`}>
                      {product.stockOnHand}
                      <span className="ml-0.5 text-xs font-normal text-slate-400">ชิ้น</span>
                    </p>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="mt-12 flex flex-col items-center gap-2 text-slate-400">
          <span className="text-4xl">📦</span>
          <p className="text-sm">ไม่มีสินค้าในหมวดนี้</p>
        </div>
      )}

      {/* Add Product Modal */}
      {showModal && (
        <Modal title="เพิ่มสินค้าใหม่" onClose={closeModal}>
          <form onSubmit={handleAdd} className="space-y-4">
            <Field label="ชื่อสินค้า" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="เช่น Hydra Serum 30ml" />
            <Field label="SKU" value={form.sku} onChange={v => setForm(f => ({ ...f, sku: v }))} placeholder="เช่น SKU-001" />
            <Field label="หมวดหมู่" value={form.category} onChange={v => setForm(f => ({ ...f, category: v }))} placeholder="เช่น Serum" />
            <div className="grid grid-cols-2 gap-3">
              <Field label="ราคา (บาท)" type="number" value={form.price} onChange={v => setForm(f => ({ ...f, price: v }))} placeholder="0" />
              <Field label="สต็อก (ชิ้น)" type="number" value={form.stockOnHand} onChange={v => setForm(f => ({ ...f, stockOnHand: v }))} placeholder="0" />
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
            <div className="flex gap-2 pt-1">
              <button type="button" onClick={closeModal} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                ยกเลิก
              </button>
              <button type="submit" disabled={saving} className="flex-1 rounded-xl bg-[#2563eb] py-2.5 text-sm font-semibold text-white hover:bg-[#1d4ed8] disabled:opacity-50 transition-colors">
                {saving ? 'กำลังบันทึก…' : 'เพิ่มสินค้า'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}

function Field({ label, value, onChange, placeholder, type = 'text' }: {
  readonly label: string;
  readonly value: string;
  readonly onChange: (v: string) => void;
  readonly placeholder: string;
  readonly type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-slate-500">{label}</span>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/10"
      />
    </label>
  );
}
