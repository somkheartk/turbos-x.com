import { expect, test } from '@playwright/test';
import { adminRoutes } from '../support/admin-constants';
import { loginAsAdmin, openAdminRoute } from '../support/admin-helpers';

test.describe('regression: route guard and logout', () => {
  test('redirects protected route access back to login without a session', async ({ page }) => {
    await page.goto(adminRoutes.orders);
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole('heading', { name: 'เข้าสู่ Smartstore console' })).toBeVisible();
  });

  test('logs out from the admin shell and returns to login', async ({ page }) => {
    await loginAsAdmin(page);
    await openAdminRoute(page, adminRoutes.dashboard);
    await page.getByRole('button', { name: 'ออกจากระบบ' }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole('heading', { name: 'เข้าสู่ Smartstore console' })).toBeVisible();
  });
});
