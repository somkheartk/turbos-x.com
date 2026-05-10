import type { Product } from '../../_lib';

const CATEGORY_THEME: Record<string, { bg: string; icon: string }> = {
  'สกินแคร์':   { bg: 'from-rose-400 to-pink-500',     icon: '✨' },
  'ครีมกันแดด': { bg: 'from-amber-400 to-orange-500',  icon: '☀️' },
  'เซรั่ม':     { bg: 'from-violet-400 to-purple-500', icon: '💧' },
  'คลีนเซอร์':  { bg: 'from-sky-400 to-cyan-500',      icon: '🫧' },
  'มอยส์เจอ':  { bg: 'from-teal-400 to-emerald-500',  icon: '🌿' },
  'Serum':      { bg: 'from-violet-400 to-purple-500', icon: '💧' },
  'Sunscreen':  { bg: 'from-amber-400 to-orange-500',  icon: '☀️' },
  'Cleanser':   { bg: 'from-sky-400 to-cyan-500',      icon: '🫧' },
  'Mask':       { bg: 'from-indigo-400 to-blue-500',   icon: '🌙' },
  'Booster':    { bg: 'from-fuchsia-400 to-pink-500',  icon: '⚡' },
};

const DEFAULT_THEME = { bg: 'from-slate-400 to-slate-500', icon: '📦' };

const STATUS_STYLE = {
  Active:   { dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  Draft:    { dot: 'bg-amber-400',   badge: 'bg-amber-50 text-amber-700 border-amber-200'       },
  Archived: { dot: 'bg-slate-300',   badge: 'bg-slate-50 text-slate-500 border-slate-200'       },
};

function resolveTheme(category: string, name: string) {
  if (CATEGORY_THEME[category]) return CATEGORY_THEME[category];
  for (const [key, theme] of Object.entries(CATEGORY_THEME)) {
    if (name.toLowerCase().includes(key.toLowerCase()) || category.toLowerCase().includes(key.toLowerCase())) {
      return theme;
    }
  }
  return DEFAULT_THEME;
}

type Props = { readonly product: Product };

export function ProductCard({ product }: Props) {
  const theme = resolveTheme(product.category, product.name);
  const style = STATUS_STYLE[product.status];
  const isOutOfStock = product.stockOnHand === 0;
  const isLowStock = product.stockOnHand > 0 && product.stockOnHand <= 10;

  let stockColor = 'text-slate-700';
  if (isOutOfStock) stockColor = 'text-red-500';
  else if (isLowStock) stockColor = 'text-amber-500';

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:shadow-md hover:-translate-y-0.5">
      <div className={`relative flex h-36 items-center justify-center bg-gradient-to-br ${theme.bg}`}>
        <span className="text-5xl drop-shadow-sm">{theme.icon}</span>

        <span className={`absolute right-3 top-3 flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${style.badge}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
          {product.status}
        </span>

        {isOutOfStock && (
          <span className="absolute left-3 top-3 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">หมด</span>
        )}
        {isLowStock && (
          <span className="absolute left-3 top-3 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold text-white">ใกล้หมด</span>
        )}
      </div>

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
}
