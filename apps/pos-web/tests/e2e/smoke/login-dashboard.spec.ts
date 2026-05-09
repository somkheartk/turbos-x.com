import { expect, test } from '@playwright/test';
import { adminRoutes } from '../support/admin-constants';
import { loginAsAdmin, openAdminRoute } from '../support/admin-helpers';

test.describe('smoke: admin login and dashboard', () => {
  test('logs in and shows the dashboard shell', async ({ page }) => {
    await loginAsAdmin(page);

    const shellHeader = page.locator('header').first();

    await expect(page.getByText('Multi-Role Command')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Operations flight deck' })).toBeVisible();
    await expect(page.getByText('Control deck', { exact: true })).toBeVisible();
    await expect(page.getByText('Network online').first()).toBeVisible();
    await expect(shellHeader.getByText('Owner Control')).toBeVisible();

    await shellHeader.getByRole('button', { name: 'Switch role, current role เจ้าของร้าน' }).click();
    await shellHeader.getByRole('button', { name: /ผู้จัดการปฏิบัติการ/ }).click();
    await expect(shellHeader.getByText('Operations Command')).toBeVisible();
  });

  test('loads the admin POS workspace', async ({ page }) => {
    await loginAsAdmin(page);
    await openAdminRoute(page, adminRoutes.pos);

    await expect(page.getByRole('heading', { name: 'จัดการหน้าขายและกะพนักงาน' })).toBeVisible();
    await expect(page.getByText('Live Registers')).toBeVisible();
    await expect(page.getByText('POS Operations')).toBeVisible();
  });
});
