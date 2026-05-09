import { expect, test } from '@playwright/test';
import { adminRoutes } from '../support/admin-constants';
import { loginAsAdmin, openAdminRoute } from '../support/admin-helpers';

test.describe('regression: stock workspace', () => {
  test('loads the rewritten stock workspace and shows tracked inventory rows', async ({ page }) => {
    await loginAsAdmin(page);
    await openAdminRoute(page, adminRoutes.stock);

    await expect(page.getByRole('heading', { name: 'ภาพรวมคลังสินค้า' })).toBeVisible();
    await expect(page.getByText('Inventory routing watch')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Export inventory report' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'SKU-001' })).toBeVisible();
  });
});