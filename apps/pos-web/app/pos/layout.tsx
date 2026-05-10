'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { SESSION_KEY, ACTIVE_ROLE_KEY } from '../_lib/session';

type PosRoute = '/pos' | '/pos/cashier' | '/pos/orders' | '/pos/products' | '/pos/users' | '/pos/reports' | '/pos/settings';

const SIDEBAR_KEY = 'smartstore-pos-sidebar';

function IconDashboard() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}
function IconCashier() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" strokeLinecap="round" />
      <path d="M12 12v4M10 14h4" strokeLinecap="round" />
    </svg>
  );
}
function IconOrders() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" strokeLinecap="round" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
      <path d="M9 12h6M9 16h4" strokeLinecap="round" />
    </svg>
  );
}
function IconProducts() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
      <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconUsers() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" strokeLinecap="round" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" strokeLinecap="round" />
    </svg>
  );
}
function IconReports() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
      <path d="M3 3v18h18" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 16l4-4 4 4 4-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconSettings() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconLogout() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
      <path d="M17 16l4-4m0 0l-4-4m4 4H7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13 21H5a2 2 0 01-2-2V5a2 2 0 012-2h8" strokeLinecap="round" />
    </svg>
  );
}
function IconChevronLeft() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconChevronRight() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const NAV: { href: PosRoute; label: string; sublabel: string; Icon: () => JSX.Element }[] = [
  { href: '/pos',          label: 'Dashboard', sublabel: 'ภาพรวม',    Icon: IconDashboard },
  { href: '/pos/cashier',  label: 'Cashier',   sublabel: 'แคชเชียร์', Icon: IconCashier   },
  { href: '/pos/orders',   label: 'Orders',    sublabel: 'ออเดอร์',   Icon: IconOrders    },
  { href: '/pos/products', label: 'Products',  sublabel: 'สินค้า',    Icon: IconProducts  },
  { href: '/pos/users',    label: 'Users',     sublabel: 'พนักงาน',   Icon: IconUsers     },
  { href: '/pos/reports',  label: 'Reports',   sublabel: 'รายงาน',    Icon: IconReports   },
  { href: '/pos/settings', label: 'Settings',  sublabel: 'ตั้งค่า',   Icon: IconSettings  },
];

function handleLogout() {
  globalThis.sessionStorage?.removeItem(SESSION_KEY);
  globalThis.sessionStorage?.removeItem(ACTIVE_ROLE_KEY);
  globalThis.location.replace('/');
}

export default function PosLayout({ children }: { readonly children: React.ReactNode }) {
  const pathname = usePathname();
  const isCashier = pathname === '/pos/cashier';
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setCollapsed(globalThis.localStorage?.getItem(SIDEBAR_KEY) === 'collapsed');
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    globalThis.localStorage?.setItem(SIDEBAR_KEY, collapsed ? 'collapsed' : 'expanded');
  }, [collapsed, mounted]);

  return (
    <div className="flex h-screen overflow-hidden bg-[#f1f5fb] font-sans antialiased">
      {/* Sidebar */}
      <aside
        className={`relative flex shrink-0 flex-col bg-[linear-gradient(160deg,#1e4fc2_0%,#142e85_100%)] shadow-[4px_0_32px_rgba(14,30,80,0.18)] transition-[width] duration-300 ease-in-out ${
          collapsed ? 'w-[68px]' : 'w-[220px]'
        }`}
      >
        {/* Collapse toggle — floating edge button */}
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="absolute -right-3 top-6 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-[#d0dff5] bg-white text-[#3b6ad4] shadow-[0_2px_8px_rgba(37,99,235,0.18)] transition hover:bg-[#eef4ff] hover:shadow-[0_3px_12px_rgba(37,99,235,0.26)]"
        >
          {collapsed ? <IconChevronRight /> : <IconChevronLeft />}
        </button>
        {/* Logo */}
        <div className={`flex items-center gap-3 border-b border-white/10 px-3 py-4 ${collapsed ? 'justify-center' : ''}`}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-white text-[11px] font-bold tracking-wide text-[#1b4fb7] shadow-[0_6px_18px_rgba(10,30,90,0.22)]">
            SS
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-[9px] font-bold uppercase tracking-[0.28em] text-white/45">Smartstore</p>
              <p className="truncate text-[13px] font-semibold leading-tight text-white">Point of Sale</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-3">
          {NAV.map(({ href, label, sublabel, Icon }) => {
            const isActive = href === '/pos' ? pathname === '/pos' : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                title={collapsed ? label : undefined}
                className={`group flex items-center rounded-[16px] border transition-all duration-150 ${
                  collapsed ? 'justify-center px-0 py-3' : 'gap-3 px-3 py-2.5'
                } ${
                  isActive
                    ? 'border-[#7aabff]/60 bg-white text-[#173eaa] shadow-[0_6px_18px_rgba(12,31,85,0.18)]'
                    : 'border-transparent text-white/70 hover:border-white/10 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl transition-colors ${
                    isActive
                      ? 'bg-[#dce9ff] text-[#173eaa]'
                      : 'bg-white/10 text-white group-hover:bg-white/18'
                  }`}
                >
                  <Icon />
                </span>
                {!collapsed && (
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-semibold leading-tight">{label}</span>
                    <span className={`block truncate text-[10px] leading-tight ${isActive ? 'text-[#5080cc]' : 'text-white/40'}`}>
                      {sublabel}
                    </span>
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="border-t border-white/10 px-2 py-3">
          <button
            type="button"
            onClick={handleLogout}
            title={collapsed ? 'ออกจากระบบ' : undefined}
            className={`group flex w-full items-center rounded-[16px] border border-transparent text-white/50 transition hover:border-white/10 hover:bg-white/10 hover:text-white/90 ${
              collapsed ? 'justify-center px-0 py-3' : 'gap-3 px-3 py-2.5'
            }`}
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-white/8 text-white/60 group-hover:bg-white/16 group-hover:text-white">
              <IconLogout />
            </span>
            {!collapsed && (
              <span className="text-[13px] font-medium">ออกจากระบบ</span>
            )}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className={`min-w-0 flex-1 ${isCashier ? 'overflow-hidden' : 'overflow-y-auto'}`}>
        {isCashier ? (
          children
        ) : (
          <div className="min-h-full px-8 py-8">{children}</div>
        )}
      </main>
    </div>
  );
}
