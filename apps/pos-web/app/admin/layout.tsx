'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import { ACTIVE_ROLE_KEY, SESSION_KEY, UserRole, UserRoleId, getRoleById, userRoles } from '../_lib/session';

const SIDEBAR_KEY = 'smartstore-admin-sidebar';

type ActiveAdminRoute =
  | '/admin'
  | '/admin/stock'
  | '/admin/pos'
  | '/admin/purchase-orders'
  | '/admin/orders'
  | '/admin/catalog'
  | '/admin/members'
  | '/admin/reports';

type RouteMeta = {
  eyebrow: string;
  laneLabel: string;
  title: string;
  detail: string;
  status: string;
};

interface AdminLayoutProps {
  children: ReactNode;
}

interface SidebarItem {
  label: string;
  href: ActiveAdminRoute;
  badge: string;
}

interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

const sidebarSections: SidebarSection[] = [
  {
    title: 'ภาพรวม',
    items: [{ label: 'แดชบอร์ด', href: '/admin', badge: 'DB' }]
  },
  {
    title: 'ปฏิบัติการ',
    items: [
      { label: 'จัดการออเดอร์', href: '/admin/orders', badge: 'SO' },
      { label: 'คลังสินค้า', href: '/admin/stock', badge: 'ST' },
      { label: 'จุดขาย POS', href: '/admin/pos', badge: 'POS' }
    ]
  },
  {
    title: 'จัดซื้อ',
    items: [{ label: 'ใบสั่งซื้อ', href: '/admin/purchase-orders', badge: 'PO' }]
  },
  {
    title: 'Master data',
    items: [{ label: 'สินค้าและแคตตาล็อก', href: '/admin/catalog', badge: 'CAT' }]
  },
  {
    title: 'สมาชิก',
    items: [{ label: 'จัดการสมาชิก', href: '/admin/members', badge: 'MBR' }]
  },
  {
    title: 'รายงาน',
    items: [{ label: 'รายงานยอดขาย', href: '/admin/reports', badge: 'RPT' }]
  }
];

const routeMeta: Record<ActiveAdminRoute, RouteMeta> = {
  '/admin': {
    eyebrow: 'Overview lane',
    laneLabel: 'Command rail',
    title: 'Operations flight deck',
    detail: 'ดูภาพรวมยอดขาย, lane load และ priority queue จาก shell กลางเดียวก่อนกระจายไปแต่ละ workspace',
    status: 'Network online'
  },
  '/admin/stock': {
    eyebrow: 'Inventory lane',
    laneLabel: 'Stock routing',
    title: 'Inventory routing',
    detail: 'จับตาสินค้าขาด, transfer pressure และจังหวะ reorder โดยไม่ต้องออกจาก shell หลัก',
    status: 'Replenishment ready'
  },
  '/admin/pos': {
    eyebrow: 'Counter lane',
    laneLabel: 'POS orchestration',
    title: 'Counter lane board',
    detail: 'ติดตามกะพนักงาน, readiness ของเคาน์เตอร์ และจังหวะรับลูกค้าแบบ realtime',
    status: 'Frontline stable'
  },
  '/admin/purchase-orders': {
    eyebrow: 'Procurement lane',
    laneLabel: 'Approval routing',
    title: 'Procurement watch',
    detail: 'รวมงานอนุมัติและ backlog ของ supplier ไว้ใน command surface เดียวเพื่อกดตัดสินใจได้เร็วขึ้น',
    status: 'Approvals queued'
  },
  '/admin/orders': {
    eyebrow: 'Order lane',
    laneLabel: 'Fulfillment routing',
    title: 'Order control board',
    detail: 'คุม customer orders, assignment, payment exceptions และ fulfillment progress จากจุดเดียว',
    status: 'Fulfillment active'
  },
  '/admin/catalog': {
    eyebrow: 'Master lane',
    laneLabel: 'Catalog governance',
    title: 'Catalog control desk',
    detail: 'ดู master product, category spread และความพร้อมของ SKU ในแต่ละช่องทางขายจาก workspace กลาง',
    status: 'Catalog synced'
  },
  '/admin/members': {
    eyebrow: 'People lane',
    laneLabel: 'Member management',
    title: 'Member control desk',
    detail: 'จัดการสมาชิก บทบาท กะทำงาน และสถานะการเข้าถึงระบบของพนักงานทั้งหมดจากจุดเดียว',
    status: 'Directory synced'
  },
  '/admin/reports': {
    eyebrow: 'Analytics lane',
    laneLabel: 'Sales analytics',
    title: 'Sales report',
    detail: 'ดูยอดขายรายวัน สินค้าขายดี ประสิทธิภาพแต่ละกะและพนักงาน รวมถึง trend เปรียบเทียบช่วงก่อนหน้า',
    status: 'Data refreshed'
  }
};

const routeOrder = new Set<ActiveAdminRoute>([
  '/admin',
  '/admin/stock',
  '/admin/pos',
  '/admin/purchase-orders',
  '/admin/orders',
  '/admin/catalog',
  '/admin/members',
  '/admin/reports'
]);

function isActiveRoute(pathname: string): pathname is ActiveAdminRoute {
  return routeOrder.has(pathname as ActiveAdminRoute);
}

function getRoleTone(role: UserRole) {
  switch (role.id) {
    case 'operations':
      return 'Service lanes online';
    case 'inventory':
      return 'Stock lanes focused';
    case 'cashier':
      return 'Counter lanes ready';
    default:
      return 'Executive view ready';
  }
}

function clearSessionAndRedirect() {
  globalThis.sessionStorage.removeItem(SESSION_KEY);
  globalThis.sessionStorage.removeItem(ACTIVE_ROLE_KEY);
  globalThis.location.replace('/');
}

export default function AdminLayout({ children }: Readonly<AdminLayoutProps>) {
  const pathname = usePathname();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const [hasResolvedSession, setHasResolvedSession] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [activeRole, setActiveRole] = useState<UserRole>(userRoles[0]);

  const activeRoute = isActiveRoute(pathname) ? pathname : '/admin';
  const activeMeta = routeMeta[activeRoute];

  useEffect(() => {
    if (globalThis.window === undefined) {
      return;
    }

    if (globalThis.sessionStorage.getItem(SESSION_KEY) !== 'active') {
      setHasResolvedSession(true);
      clearSessionAndRedirect();
      return;
    }

    setHasSession(true);
    setHasResolvedSession(true);
    setIsSidebarCollapsed(globalThis.localStorage.getItem(SIDEBAR_KEY) === 'collapsed');
    setActiveRole(getRoleById(globalThis.sessionStorage.getItem(ACTIVE_ROLE_KEY)));
  }, []);

  useEffect(() => {
    if (globalThis.window === undefined || !hasSession) {
      return;
    }

    globalThis.localStorage.setItem(SIDEBAR_KEY, isSidebarCollapsed ? 'collapsed' : 'expanded');
  }, [hasSession, isSidebarCollapsed]);

  useEffect(() => {
    setIsRoleMenuOpen(false);
  }, [pathname]);

  function handleRoleSwitch(roleId: UserRoleId) {
    const nextRole = getRoleById(roleId);
    setActiveRole(nextRole);
    setIsRoleMenuOpen(false);
    globalThis.sessionStorage.setItem(ACTIVE_ROLE_KEY, nextRole.id);
  }

  function handleLogout() {
    clearSessionAndRedirect();
  }

  if (!hasResolvedSession || !hasSession) {
    return <main className="min-h-screen bg-[#edf4ff]" />;
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#eaf3ff_0%,#f7fbff_100%)] p-3 text-ink sm:p-4 lg:p-5">
      <div className="flex min-h-[calc(100vh-1.5rem)] overflow-hidden rounded-[34px] border border-[#d6e4fb] bg-[#f6faff] shadow-[0_24px_80px_rgba(37,99,235,0.10)] sm:min-h-[calc(100vh-2rem)] lg:min-h-[calc(100vh-2.5rem)]">
        <aside className={`flex shrink-0 flex-col border-r border-[#d6e4fb] bg-[linear-gradient(180deg,#1f56c5_0%,#153c95_100%)] text-white transition-[width] duration-300 ${isSidebarCollapsed ? 'w-[92px]' : 'w-[304px]'}`}>
          <div className={`flex items-center gap-3 border-b border-white/10 px-5 py-5 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-sm font-bold tracking-[0.18em] text-[#1b4fb7] shadow-[0_14px_30px_rgba(10,34,90,0.26)]">
              SS
            </div>
            {isSidebarCollapsed ? null : (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/58">Smartstore</p>
                <p className="mt-1 text-sm font-semibold tracking-[0.02em]">Multi-Role Command</p>
              </div>
            )}
          </div>

          <div className="px-3 py-4">
            <div className="rounded-[24px] border border-white/12 bg-white/8 p-3 backdrop-blur-sm">
              <div className={`flex items-start gap-3 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                <div className="mt-1 h-2.5 w-2.5 rounded-full bg-[#86efac] shadow-[0_0_18px_rgba(134,239,172,0.9)]" />
                {isSidebarCollapsed ? null : (
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/55">{activeRole.focus}</p>
                    <p className="mt-2 text-sm font-medium text-white">{getRoleTone(activeRole)}</p>
                    <p className="mt-1 text-xs leading-5 text-white/68">สลับมุมมองบทบาทและเก็บ shell เดียวกันได้ทันที</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <nav aria-label="Admin navigation" className="flex-1 overflow-y-auto px-3 pb-4 custom-scrollbar">
            <div className="space-y-6">
              {sidebarSections.map((section) => (
                <div key={section.title} className="space-y-2">
                  {isSidebarCollapsed ? null : (
                    <p className="px-2 text-[10px] font-bold uppercase tracking-[0.26em] text-white/38">{section.title}</p>
                  )}

                  <div className="space-y-1.5">
                    {section.items.map((item) => {
                      const isActive = item.href === activeRoute;

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          title={item.label}
                          aria-current={isActive ? 'page' : undefined}
                          className={`group flex items-center rounded-[22px] border transition ${isActive ? 'border-[#8ab4ff] bg-white text-[#173eaa] shadow-[0_14px_30px_rgba(12,31,85,0.18)]' : 'border-transparent bg-transparent text-white/78 hover:border-white/12 hover:bg-white/10 hover:text-white'} ${isSidebarCollapsed ? 'justify-center px-0 py-3' : 'gap-3 px-3 py-3'}`}
                        >
                          <span className={`flex h-10 ${item.badge.length > 2 ? 'w-12 text-[11px]' : 'w-10 text-xs'} shrink-0 items-center justify-center rounded-2xl font-bold tracking-[0.14em] ${isActive ? 'bg-[#dce9ff] text-[#173eaa]' : 'bg-white/12 text-white'}`}>
                            {item.badge}
                          </span>
                          {isSidebarCollapsed ? null : (
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-medium">{item.label}</span>
                              <span className={`mt-0.5 block truncate text-[11px] uppercase tracking-[0.18em] ${isActive ? 'text-[#3d66c4]' : 'text-white/50'}`}>
                                {routeMeta[item.href].laneLabel}
                              </span>
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </nav>

          <div className="border-t border-white/10 p-3">
            <button
              type="button"
              onClick={() => setIsSidebarCollapsed((currentValue) => !currentValue)}
              aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className={`flex w-full items-center rounded-[20px] border border-white/12 bg-white/10 text-sm font-medium text-white transition hover:bg-white/14 ${isSidebarCollapsed ? 'justify-center px-0 py-3' : 'justify-between px-4 py-3'}`}
            >
              <span className="text-lg leading-none">{isSidebarCollapsed ? '→' : '←'}</span>
              {isSidebarCollapsed ? null : <span>Collapse sidebar</span>}
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col bg-[linear-gradient(180deg,#fafdff_0%,#f1f7ff_100%)]">
          <header className="border-b border-[#d6e4fb] bg-white/82 px-5 py-5 backdrop-blur-sm lg:px-8">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3 text-[11px] font-bold uppercase tracking-[0.22em] text-[#2563eb]">
                  <span>{activeMeta.eyebrow}</span>
                  <span className="h-1 w-1 rounded-full bg-[#b9ccef]" />
                  <span className="text-[#6782a8]">{activeMeta.laneLabel}</span>
                </div>
                <h1 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[#10233f]">{activeMeta.title}</h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-[#597391]">{activeMeta.detail}</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-[minmax(0,220px)_auto]">
                <div className="rounded-[24px] border border-[#d6e4fb] bg-[#f5f9ff] px-4 py-3 shadow-[0_12px_28px_rgba(37,99,235,0.06)]">
                  <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#6f87a8]">Control deck</p>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-[#10233f]">{activeMeta.status}</p>
                    <span className="rounded-full bg-[#2563eb] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white">Live</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-[22px] border border-[#d6e4fb] bg-white px-5 py-3 text-sm font-semibold text-[#10233f] transition hover:border-[#b7cdf2] hover:bg-[#f5f9ff]"
                >
                  ออกจากระบบ
                </button>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-[#d6e4fb] bg-[#eff5ff] px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#1e57cf]">
                {activeRole.consoleLabel}
              </span>
              <div className="relative">
                <button
                  type="button"
                  aria-label={`Switch role, current role ${activeRole.label}`}
                  aria-expanded={isRoleMenuOpen}
                  aria-controls="role-switch-menu"
                  onClick={() => setIsRoleMenuOpen((currentValue) => !currentValue)}
                  className="flex min-w-[240px] items-center justify-between gap-3 rounded-[20px] border border-[#d6e4fb] bg-white px-4 py-3 text-left shadow-[0_10px_22px_rgba(37,99,235,0.08)] transition hover:border-[#b7cdf2] hover:bg-[#f5f9ff]"
                >
                  <span>
                    <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6782a8]">Switch role</span>
                    <span className="mt-1 block text-sm font-semibold text-[#10233f]">{activeRole.label}</span>
                  </span>
                  <span className="rounded-full bg-[#edf4ff] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#2563eb]">
                    {activeRole.shortLabel}
                  </span>
                </button>

                {isRoleMenuOpen ? (
                  <div
                    id="role-switch-menu"
                    className="absolute left-0 z-10 mt-2 w-full rounded-[22px] border border-[#d6e4fb] bg-white p-2 shadow-[0_18px_40px_rgba(37,99,235,0.16)]"
                  >
                    {userRoles.map((role) => (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => handleRoleSwitch(role.id)}
                        className={`flex w-full items-center justify-between rounded-[16px] px-3 py-3 text-left transition ${role.id === activeRole.id ? 'bg-[#edf4ff] text-[#173eaa]' : 'text-[#35557f] hover:bg-[#f5f9ff]'}`}
                      >
                        <span>
                          <span className="block text-sm font-semibold">{role.label}</span>
                          <span className="mt-1 block text-xs text-[#6782a8]">{role.consoleLabel}</span>
                        </span>
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${role.id === activeRole.id ? 'bg-[#2563eb] text-white' : 'bg-[#edf4ff] text-[#2563eb]'}`}>
                          {role.shortLabel}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </header>

          <div className="flex min-h-0 flex-1 overflow-hidden">
            <main className="min-w-0 flex-1 overflow-y-auto px-5 py-5 custom-scrollbar lg:px-8 lg:py-7">
              <div className="mx-auto max-w-7xl">{children}</div>
            </main>

            <aside className="hidden w-[320px] shrink-0 border-l border-[#d6e4fb] bg-white/76 p-6 backdrop-blur-sm xl:block">
              <div className="rounded-[28px] border border-[#d6e4fb] bg-[linear-gradient(145deg,#ffffff_0%,#edf4ff_100%)] p-5 shadow-[0_18px_40px_rgba(37,99,235,0.08)]">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#6e86a8]">Role lane</p>
                <div className="mt-4 rounded-[22px] border border-[#d6e4fb] bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[#17304f]">{activeRole.label}</p>
                      <p className="mt-1 text-xs text-[#6782a8]">{activeRole.consoleLabel}</p>
                    </div>
                    <span className="rounded-full bg-[#edf4ff] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#2563eb]">
                      {activeRole.shortLabel}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[#5a7494]">{activeRole.description}</p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}
