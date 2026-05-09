import { expect, test } from '@playwright/test';
import { adminRoutes } from '../support/admin-constants';
import { loginAsAdmin, openAdminRoute } from '../support/admin-helpers';

test.describe('regression: purchase orders workspace', () => {
  test('loads the rewritten procurement workspace and shows summary cards', async ({ page }) => {
    await loginAsAdmin(page);
    await openAdminRoute(page, adminRoutes.purchaseOrders);

    await expect(page.getByRole('heading', { name: 'Purchase Orders' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Procurement queue' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create new PO' })).toBeVisible();

    const pendingApprovalsCard = page.locator('article').filter({ hasText: 'Pending approvals' }).first();
    const weeklySpendCard = page.locator('article').filter({ hasText: 'This week spend' }).first();
    const suppliersActiveCard = page.locator('article').filter({ hasText: 'Suppliers active' }).first();

    await expect(pendingApprovalsCard).toBeVisible();
    await expect(weeklySpendCard).toBeVisible();
    await expect(suppliersActiveCard).toBeVisible();

    await expect(pendingApprovalsCard).toContainText('Pending approvals');
    await expect(weeklySpendCard).toContainText('This week spend');
    await expect(suppliersActiveCard).toContainText('Suppliers active');
    await expect(weeklySpendCard).toContainText(/฿\d[\d,]*/);
    await expect(suppliersActiveCard).toContainText('12');

    await expect(page.getByRole('heading', { name: 'รายการใบสั่งซื้อ' })).toBeVisible();
    await expect(page.locator('article').filter({ hasText: 'PO-240426-01' }).first()).toBeVisible();
  });
});