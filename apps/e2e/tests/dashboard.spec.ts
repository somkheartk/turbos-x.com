// cSpell:disable
import { expect, test } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pos');
  });

  test('shows page heading and KPI cards', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    // KPI labels always render (fallback data when backend is down)
    await expect(page.getByText('ยอดขายวันนี้')).toBeVisible({ timeout: 10_000 });
    await page.screenshot({ path: 'screenshots/dashboard-kpis.png', fullPage: false });
  });

  test('shows quick stats strip', async ({ page }) => {
    await expect(page.getByText('ส่วนลดรวม')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('เฉลี่ยต่อบิล')).toBeVisible();
    await expect(page.getByText('บิลโมฆะ')).toBeVisible();
    await page.screenshot({ path: 'screenshots/dashboard-stats.png' });
  });

  test('shows top cashier section', async ({ page }) => {
    await expect(page.getByText('Top Cashier วันนี้')).toBeVisible({ timeout: 10_000 });
    await page.screenshot({ path: 'screenshots/dashboard-cashiers.png', fullPage: true });
  });

  test('sidebar navigation is visible', async ({ page }) => {
    await expect(page.getByRole('link', { name: /Dashboard/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /Cashier/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /Products/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /Orders/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /Users/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /Reports/i }).first()).toBeVisible();
    await page.screenshot({ path: 'screenshots/dashboard-sidebar.png' });
  });

  test('can navigate to cashier via button', async ({ page }) => {
    await page.getByRole('link', { name: 'เปิด Cashier' }).click();
    await expect(page).toHaveURL('/pos/cashier');
    await page.screenshot({ path: 'screenshots/dashboard-nav-cashier.png', fullPage: true });
  });
});
