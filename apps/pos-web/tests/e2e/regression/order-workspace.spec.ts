import { expect, test } from '@playwright/test';
import { adminRoutes } from '../support/admin-constants';
import { loginAsAdmin, openAdminRoute } from '../support/admin-helpers';

test.describe('regression: order workspace', () => {
  test('loads the order management workspace and shows fulfillment content', async ({ page }) => {
    await loginAsAdmin(page);
    await openAdminRoute(page, adminRoutes.orders);

    await expect(page.getByRole('heading', { name: 'จัดการออเดอร์ลูกค้า' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Order control board' })).toBeVisible();
    await expect(page.getByText('New orders')).toBeVisible();
    await expect(page.getByText('Ready to ship').first()).toBeVisible();
    await expect(page.locator('article').filter({ hasText: 'SO-240502-001' }).first()).toBeVisible();
    await expect(page.locator('article').filter({ hasText: 'Kamonwan P.' }).first()).toBeVisible();
  });
});