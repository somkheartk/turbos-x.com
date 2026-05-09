export const SESSION_KEY = 'smartstore-admin-session';
export const ACTIVE_ROLE_KEY = 'smartstore-active-role';

export type UserRoleId = 'owner' | 'operations' | 'inventory' | 'cashier';

export type UserRole = {
  id: UserRoleId;
  label: string;
  shortLabel: string;
  consoleLabel: string;
  description: string;
  focus: string;
};

export const userRoles: UserRole[] = [
  {
    id: 'owner',
    label: 'เจ้าของร้าน',
    shortLabel: 'OWN',
    consoleLabel: 'Owner Control',
    description: 'ดูภาพรวมธุรกิจ, KPI หลัก และตัดสินใจข้ามทีมจากหน้าเดียว',
    focus: 'Business overview'
  },
  {
    id: 'operations',
    label: 'ผู้จัดการปฏิบัติการ',
    shortLabel: 'OPS',
    consoleLabel: 'Operations Command',
    description: 'คุม lane งานหน้าร้าน, queue และจังหวะการให้บริการแบบ realtime',
    focus: 'Live operations'
  },
  {
    id: 'inventory',
    label: 'ผู้ดูแลคลัง',
    shortLabel: 'INV',
    consoleLabel: 'Inventory Desk',
    description: 'ติดตาม stock movement, reorder pressure และ transfer ระหว่างคลัง',
    focus: 'Stock routing'
  },
  {
    id: 'cashier',
    label: 'หัวหน้าแคชเชียร์',
    shortLabel: 'POS',
    consoleLabel: 'Counter Supervisor',
    description: 'โฟกัส counter readiness, shift handoff และความพร้อมของพนักงานขาย',
    focus: 'Counter readiness'
  }
];

export const defaultRole = userRoles[0];

export function getRoleById(roleId: string | null | undefined): UserRole {
  return userRoles.find((role) => role.id === roleId) ?? defaultRole;
}