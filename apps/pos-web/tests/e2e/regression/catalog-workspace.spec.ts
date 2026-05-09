import { expect, test } from '@playwright/test';
import { adminRoutes } from '../support/admin-constants';
import { loginAsAdmin, openAdminRoute } from '../support/admin-helpers';

test.describe('regression: catalog workspace', () => {
  test('loads the master product and catalog workspace', async ({ page }) => {
    await loginAsAdmin(page);
    await openAdminRoute(page, adminRoutes.catalog);

    await expect(page.getByRole('heading', { name: 'จัดการ master product และ catalog' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Catalog governance' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'รายการสินค้าใน catalog กลาง' })).toBeVisible();
    await expect(page.getByText('Hydra Serum 30ml')).toBeVisible();
    await expect(page.getByText('Skincare').first()).toBeVisible();
  });
});