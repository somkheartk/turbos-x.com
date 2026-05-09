import { expect, test } from '@playwright/test';
import { adminRoutes } from '../support/admin-constants';
import { loginAsAdmin, openAdminRoute } from '../support/admin-helpers';

test.describe('mutation: order status update', () => {
  test('advances a seeded sales order and reflects the new state in the UI', async ({ page }) => {
    await loginAsAdmin(page);
    await openAdminRoute(page, adminRoutes.orders);

    const orderCard = page.locator('article').filter({ hasText: 'SO-240502-001' }).first();
    await expect(orderCard).toBeVisible();
    await expect(orderCard.getByText('New')).toBeVisible();

    await orderCard.getByRole('button', { name: 'Advance order' }).click();

    await expect(orderCard.getByText('Packing')).toBeVisible();
  });
});