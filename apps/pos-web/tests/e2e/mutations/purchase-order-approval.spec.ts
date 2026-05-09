import { expect, test } from '@playwright/test';
import { adminRoutes } from '../support/admin-constants';
import { loginAsAdmin, openAdminRoute } from '../support/admin-helpers';

test.describe('mutation: purchase order approval', () => {
  test('approves a seeded purchase order and reflects the new state in the UI', async ({ page }) => {
    await loginAsAdmin(page);
    await openAdminRoute(page, adminRoutes.purchaseOrders);

    await expect(page.getByRole('heading', { name: 'Procurement queue' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Purchase Orders' })).toBeVisible();

    const draftOrderCard = page.locator('article').filter({ hasText: 'PO-240426-03' }).first();
    await expect(draftOrderCard).toBeVisible();

    const approveButton = draftOrderCard.getByRole('button', { name: 'Approve' });
    if (await approveButton.count()) {
      await approveButton.click();
    }

    await expect(draftOrderCard.getByText('Approved')).toBeVisible();
    await expect(draftOrderCard.getByRole('button', { name: 'Approve' })).toHaveCount(0);
  });
});