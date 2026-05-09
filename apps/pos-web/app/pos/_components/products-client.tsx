'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { PosProduct } from '../_lib/pos-api';
import { createPosProduct } from '../_lib/pos-api';
import { Modal } from './modal';

const statusDot: Record<string, string> = {
  Active:   'bg-emerald-500',
  Draft:    'bg-amber-400',
  Archived: 'bg-slate-300',
};
const statusText: Record<string, string> = {
  Active:   'text-emerald-600',
  Draft:    'text-amber-600',
  Archived: 'text-slate-400',
};

type Props = { readonly products: PosProduct[]; readonly categories: string[] };

const EMPTY_FORM = { name: '', sku: '', category: '', price: '', stockOnHand: '' };

export function ProductsClient({ products, categories }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  function toggleExpand(sku: string) {
    setExpanded(prev => (prev === sku ? null : sku));
  }

  function closeModal() {
    setShowModal(false);
    setForm(EMPTY_FORM);
    setError('');
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.sku || !form.category || !form.price || !form.stockOnHand) {
      setError('กรุณากรอกข้อมูลให้ครบ');
      return;
    }
    const price = Number(form.price);
    const stockOnHand = Number(form.stockOnHand);
    if (price <= 0 || stockOnHand < 0) {
      setError('ราคาต้องมากกว่า 0 และสต็อกต้องไม่ติดลบ');
      return;
    }
    setSaving(true);
    try {
      await createPosProduct({ name: form.name, sku: form.sku, category: form.category, price, stockOnHand });
      closeModal();
      startTransition(() => router.refresh());
    } catch {
      setError('เพิ่มสินค้าไม่สำเร็จ กรุณาลองใหม่');
    } finally {
      setSaving(false);
    }
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
        {['ทั้งหมด', ...categories].map((cat, i) => (
          <span
            key={cat}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium ${
              i === 0 ? 'bg-[#2563eb] text-white' : 'border border-slate-200 bg-white text-slate-500'
            }`}
          >
            {cat}
          </span>
        ))}
      </div>

      <div className="mt-5 overflow-hidden rounded-xl border border-slate-100 bg-white">
        <div className="grid grid-cols-[2fr_1fr_1fr_80px_80px] border-b border-slate-50 px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          <span>สินค้า</span>
          <span>Category</span>
          <span className="text-right">ราคา</span>
          <span className="text-right">คงเหลือ</span>
          <span className="text-right">Status</span>
        </div>

        <div className="divide-y divide-slate-50">
          {products.map(product => (
            <div key={product.sku}>
              <button
                onClick={() => toggleExpand(product.sku)}
                className="grid w-full grid-cols-[2fr_1fr_1fr_80px_80px] items-center px-5 py-3.5 text-left hover:bg-slate-50/60 transition-colors"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900">{product.name}</p>
                  <p className="mt-0.5 text-[11px] text-slate-400">{product.sku}</p>
                </div>
                <p className="text-sm text-slate-500">{product.category}</p>
                <p className="text-right text-sm font-semibold text-slate-900">{product.priceLabel}</p>
                <p className={`text-right text-sm font-medium ${product.stockOnHand <= 10 ? 'text-amber-600' : 'text-slate-600'}`}>
                  {product.stockOnHand}
                </p>
                <div className="flex justify-end">
                  <span className={`flex items-center gap-1.5 text-xs font-medium ${statusText[product.status]}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${statusDot[product.status]}`} />
                    {product.status}
                  </span>
                </div>
              </button>

              {expanded === product.sku && (
                <div className="grid grid-cols-4 gap-4 border-t border-slate-50 bg-[#f7fbff] px-5 py-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">SKU</p>
                    <p className="mt-1 text-sm font-medium text-slate-800">{product.sku}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">หมวดหมู่</p>
                    <p className="mt-1 text-sm font-medium text-slate-800">{product.category}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">สต็อกคงเหลือ</p>
                    <p className={`mt-1 text-sm font-semibold ${product.stockOnHand <= 10 ? 'text-amber-600' : 'text-slate-800'}`}>
                      {product.stockOnHand} ชิ้น{product.stockOnHand <= 10 ? ' ⚠ ใกล้หมด' : ''}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">ราคา</p>
                    <p className="mt-1 text-sm font-semibold text-[#1f56c5]">{product.priceLabel}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {isPending && <p className="mt-3 text-xs text-slate-400">กำลังอัปเดต...</p>}

      {showModal && (
        <Modal title="เพิ่มสินค้าใหม่" onClose={closeModal}>
          <form onSubmit={handleAdd} className="space-y-4">
            <Field label="ชื่อสินค้า" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="เช่น กาแฟดำ" />
            <Field label="SKU" value={form.sku} onChange={v => setForm(f => ({ ...f, sku: v }))} placeholder="เช่น COFFEE-001" />
            <Field label="หมวดหมู่" value={form.category} onChange={v => setForm(f => ({ ...f, category: v }))} placeholder="เช่น เครื่องดื่ม" />
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
