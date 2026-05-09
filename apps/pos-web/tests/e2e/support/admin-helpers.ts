import { expect, Page } from '@playwright/test';
import { adminRoutes, demoCredentials } from './admin-constants';

function toRoutePattern(route: string) {
  return new RegExp(String.raw`${route.replaceAll('/', '\\/')}(?:\?.*)?$`);
}

export async function loginAsAdmin(page: Page) {
  await page.goto('/');
  await page.locator('input[type="email"]').fill(demoCredentials.email);
  await page.locator('input[type="password"]').fill(demoCredentials.password);
  await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click();
  await expect(page).toHaveURL(toRoutePattern(adminRoutes.dashboard));
}

export async function openAdminRoute(page: Page, route: string) {
  await page.goto(route);
  await expect(page).toHaveURL(toRoutePattern(route));
}
