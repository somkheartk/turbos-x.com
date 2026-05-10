'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { Product } from '../../_lib';
import { createProduct } from '../../_lib';
import { Modal } from '../../../_components/ui/modal';
import { ProductCard } from './product-card';

type Props = { readonly products: Product[]; readonly categories: string[] };
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
      await createProduct({ name: form.name, sku: form.sku, category: form.category, price, stockOnHand });
      closeModal();
      startTransition(() => router.refresh());
    } catch { setError('เพิ่มสินค้าไม่สำเร็จ กรุณาลองใหม่'); }
    finally { setSaving(false); }
  }

  return (
    <>
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

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map(product => (
          <ProductCard key={product.sku} product={product} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="mt-12 flex flex-col items-center gap-2 text-slate-400">
          <span className="text-4xl">📦</span>
          <p className="text-sm">ไม่มีสินค้าในหมวดนี้</p>
        </div>
      )}

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
