'use client';

import { useEffect, useState } from 'react';
import type { PosProduct, PosTransaction } from '../_lib/pos-api';
import { posCheckout } from '../_lib/pos-api';
import { ReceiptModal } from './receipt-modal';

const CASHIER_NAME_KEY = 'smartstore-cashier-name';

type CartItem = PosProduct & { qty: number };
type PaymentMethod = 'Cash' | 'QR' | 'Card';

function thb(value: number) {
  return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(value);
}

const PAYMENT_ICONS: Record<PaymentMethod, string> = { Cash: '💵', QR: '📱', Card: '💳' };

const CATEGORY_THEME: Record<string, { emoji: string; from: string; to: string }> = {
  'เครื่องดื่ม':  { emoji: '☕', from: '#fef3c7', to: '#fde68a' },
  'ขนม':         { emoji: '🍰', from: '#fce7f3', to: '#fbcfe8' },
  'อาหาร':       { emoji: '🍱', from: '#d1fae5', to: '#a7f3d0' },
  'ของสด':       { emoji: '🥦', from: '#dcfce7', to: '#bbf7d0' },
  'ของแห้ง':     { emoji: '🌾', from: '#fef9c3', to: '#fef08a' },
  'ผลไม้':       { emoji: '🍊', from: '#ffedd5', to: '#fed7aa' },
  'เนื้อสัตว์':  { emoji: '🥩', from: '#fee2e2', to: '#fecaca' },
  'นมและไข่':    { emoji: '🥛', from: '#eff6ff', to: '#dbeafe' },
  'เครื่องปรุง': { emoji: '🧂', from: '#f5f3ff', to: '#ede9fe' },
  default:        { emoji: '🛍️', from: '#f0f9ff', to: '#e0f2fe' },
};

function checkoutButtonLabel(loading: boolean, cartLength: number, subtotal: number): string {
  if (loading) return 'กำลังบันทึก…';
  if (cartLength > 0) return `ชำระ ${thb(subtotal)}`;
  return 'ชำระเงิน';
}

function getTheme(category: string) {
  return CATEGORY_THEME[category] ?? CATEGORY_THEME['default'];
}

type Props = { readonly products: PosProduct[]; readonly categories: string[] };

export function CashierTerminal({ products, categories }: Props) {
  const [cart, setCart]               = useState<CartItem[]>([]);
  const [category, setCategory]       = useState('ทั้งหมด');
  const [payment, setPayment]         = useState<PaymentMethod>('Cash');
  const [cash, setCash]               = useState('');
  const [receipt, setReceipt]         = useState<PosTransaction | null>(null);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [cashierName, setCashierName] = useState('');
  const [editingName, setEditingName] = useState(false);

  useEffect(() => {
    const saved = globalThis.localStorage?.getItem(CASHIER_NAME_KEY) ?? '';
    setCashierName(saved || 'Cashier');
    if (!saved) setEditingName(true);
  }, []);

  const filtered  = category === 'ทั้งหมด' ? products : products.filter(p => p.category === category);
  const subtotal  = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const itemCount = cart.reduce((s, i) => s + i.qty, 0);
  const change    = payment === 'Cash' && cash ? Math.max(0, Number(cash) - subtotal) : 0;
  const canPay    = payment !== 'Cash' || (Number(cash) >= subtotal && subtotal > 0);

  function add(product: PosProduct) {
    setCart(prev => {
      const hit = prev.find(i => i.sku === product.sku);
      return hit
        ? prev.map(i => i.sku === product.sku ? { ...i, qty: i.qty + 1 } : i)
        : [...prev, { ...product, qty: 1 }];
    });
  }

  function adjustQty(sku: string, d: number) {
    setCart(prev => prev.map(i => i.sku === sku ? { ...i, qty: i.qty + d } : i).filter(i => i.qty > 0));
  }

  function reset() { setCart([]); setCash(''); setError(''); }

  function saveName(name: string) {
    const trimmed = name.trim() || 'Cashier';
    setCashierName(trimmed);
    globalThis.localStorage?.setItem(CASHIER_NAME_KEY, trimmed);
    setEditingName(false);
  }

  async function checkout() {
    if (!cart.length) return;
    setLoading(true); setError('');
    try {
      const res = await posCheckout({
        items: cart.map(i => ({ productSku: i.sku, productName: i.name, qty: i.qty, unitPrice: i.price })),
        paymentMethod: payment,
        cashReceived: payment === 'Cash' ? Number(cash) : undefined,
        cashierName,
      });
      setReceipt(res.transaction);
      setCart([]);
    } catch {
      setError('Checkout ล้มเหลว กรุณาลองใหม่');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {receipt && (
        <ReceiptModal
          tx={receipt}
          onClose={() => { setReceipt(null); setCash(''); reset(); }}
        />
      )}

      <div className="flex h-full overflow-hidden" style={{ background: '#f8fafc' }}>
        {/* Product grid */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Category filter */}
          <div className="flex shrink-0 items-center gap-2 overflow-x-auto border-b border-slate-200 bg-white px-5 py-3.5">
            {['ทั้งหมด', ...categories].map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                  category === cat
                    ? 'bg-[#2563eb] text-white shadow-[0_2px_8px_rgba(37,99,235,0.30)]'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {cat === 'ทั้งหมด' ? `ทั้งหมด (${products.length})` : cat}
              </button>
            ))}
          </div>

          {/* Products */}
          <div className="flex-1 overflow-y-auto p-5">
            <div className="grid grid-cols-3 gap-3 xl:grid-cols-4 2xl:grid-cols-5">
              {filtered.map(product => {
                const theme = getTheme(product.category);
                const inCart = cart.find(i => i.sku === product.sku);
                return (
                  <button
                    key={product.sku}
                    onClick={() => add(product)}
                    className={`group relative flex flex-col rounded-2xl border bg-white p-4 text-left transition-all hover:shadow-md active:scale-95 ${
                      inCart
                        ? 'border-[#2563eb] shadow-[0_0_0_3px_rgba(37,99,235,0.12)]'
                        : 'border-slate-100 hover:border-[#93c5fd]'
                    }`}
                  >
                    {inCart && (
                      <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[#2563eb] text-[10px] font-bold text-white">
                        {inCart.qty}
                      </span>
                    )}
                    <div
                      className="flex h-16 items-center justify-center rounded-xl text-3xl"
                      style={{ background: `linear-gradient(135deg, ${theme.from}, ${theme.to})` }}
                    >
                      {theme.emoji}
                    </div>
                    <p className="mt-3 line-clamp-2 text-xs font-semibold leading-snug text-slate-800">{product.name}</p>
                    <p className="mt-auto pt-2 text-sm font-bold text-[#1d4ed8]">{product.priceLabel}</p>
                  </button>
                );
              })}
            </div>
            {filtered.length === 0 && (
              <p className="py-16 text-center text-sm text-slate-400">ไม่มีสินค้าในหมวดนี้</p>
            )}
          </div>
        </div>

        {/* Cart panel */}
        <div className="relative flex w-80 shrink-0 flex-col border-l border-slate-200 bg-white">

          {/* Cashier name */}
          <div className="flex shrink-0 items-center gap-2 border-b border-slate-100 px-4 py-3">
            {editingName ? (
              <form
                className="flex flex-1 gap-2"
                onSubmit={e => { e.preventDefault(); saveName((e.currentTarget.elements.namedItem('name') as HTMLInputElement).value); }}
              >
                <input
                  name="name"
                  defaultValue={cashierName === 'Cashier' ? '' : cashierName}
                  placeholder="ชื่อแคชเชียร์..."
                  autoFocus
                  className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold outline-none focus:border-[#2563eb]"
                />
                <button type="submit" className="rounded-lg bg-[#2563eb] px-3 py-1.5 text-xs font-bold text-white">ตกลง</button>
              </form>
            ) : (
              <>
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#dbeafe] text-xs font-bold text-[#1d4ed8]">
                  {cashierName.charAt(0).toUpperCase()}
                </div>
                <p className="flex-1 text-xs font-semibold text-slate-700">{cashierName}</p>
                <button onClick={() => setEditingName(true)} className="text-[10px] text-slate-400 hover:text-slate-600">เปลี่ยน</button>
              </>
            )}
          </div>

          {/* Cart header */}
          <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-3.5">
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-slate-900">ตะกร้า</p>
              {itemCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#2563eb] px-1.5 text-[10px] font-bold text-white">
                  {itemCount}
                </span>
              )}
            </div>
            {cart.length > 0 && (
              <button onClick={reset} className="text-xs font-medium text-slate-400 transition-colors hover:text-red-500">
                ล้าง
              </button>
            )}
          </div>

          {/* Cart items */}
          <div className="flex-1 divide-y divide-slate-50 overflow-y-auto">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-2xl">🛒</div>
                <p className="mt-3 text-xs font-medium text-slate-400">กดสินค้าเพื่อเพิ่มลงตะกร้า</p>
              </div>
            ) : (
              cart.map(item => {
                const theme = getTheme(item.category);
                return (
                  <div key={item.sku} className="flex items-center gap-3 px-4 py-3">
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-base"
                      style={{ background: `linear-gradient(135deg, ${theme.from}, ${theme.to})` }}
                    >
                      {theme.emoji}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-slate-800">{item.name}</p>
                      <p className="mt-0.5 text-xs font-bold text-[#1d4ed8]">{thb(item.price * item.qty)}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => adjustQty(item.sku, -1)} className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600 hover:bg-slate-200">−</button>
                      <span className="w-5 text-center text-sm font-bold text-slate-900">{item.qty}</span>
                      <button onClick={() => adjustQty(item.sku, +1)} className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#dbeafe] text-xs font-bold text-[#1d4ed8] hover:bg-[#bfdbfe]">+</button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Payment panel */}
          <div className="shrink-0 space-y-3 border-t border-slate-100 p-4">
            <div className="flex items-baseline justify-between rounded-xl bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold text-slate-500">ยอดรวม</p>
              <p className="text-2xl font-bold tracking-tight text-slate-900">{thb(subtotal)}</p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {(['Cash', 'QR', 'Card'] as PaymentMethod[]).map(m => (
                <button
                  key={m}
                  onClick={() => setPayment(m)}
                  className={`flex flex-col items-center gap-1 rounded-xl py-2.5 text-xs font-bold transition-all ${
                    payment === m
                      ? 'bg-[#2563eb] text-white shadow-[0_4px_10px_rgba(37,99,235,0.25)]'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  <span className="text-lg">{PAYMENT_ICONS[m]}</span>
                  {m}
                </button>
              ))}
            </div>

            {payment === 'Cash' && (
              <div>
                <input
                  type="number"
                  placeholder="รับเงิน (บาท)"
                  value={cash}
                  onChange={e => setCash(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-900 outline-none placeholder:font-normal placeholder:text-slate-400 focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/10"
                />
                {cash && Number(cash) >= subtotal && subtotal > 0 && (
                  <p className="mt-2 text-sm font-bold text-emerald-600">ทอน {thb(change)}</p>
                )}
              </div>
            )}

            {error && <p className="text-xs font-medium text-red-500">{error}</p>}

            <button
              onClick={checkout}
              disabled={!cart.length || loading || (payment === 'Cash' && !canPay)}
              className="w-full rounded-2xl bg-[#2563eb] py-3.5 text-sm font-bold text-white shadow-[0_4px_14px_rgba(37,99,235,0.30)] transition-all hover:bg-[#1d4ed8] disabled:opacity-30 disabled:shadow-none"
            >
              {checkoutButtonLabel(loading, cart.length, subtotal)}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
