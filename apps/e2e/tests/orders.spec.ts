// cSpell:disable
import { expect, test } from '@playwright/test';

test.describe('Orders', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pos/orders');
  });

  test('shows orders page header', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Orders' })).toBeVisible();
    await page.screenshot({ path: 'screenshots/orders-page.png', fullPage: true });
  });

  test('shows summary cards', async ({ page }) => {
    // Total revenue is unique on the page; Completed/Voided appear in multiple places so use .first()
    await expect(page.getByText('Total revenue')).toBeVisible();
    await expect(page.getByText('Completed').first()).toBeVisible();
    await expect(page.getByText('Voided').first()).toBeVisible();
    await page.screenshot({ path: 'screenshots/orders-summary.png' });
  });

  test('can switch filter to Completed', async ({ page }) => {
    await page.getByRole('button', { name: 'Completed' }).click();
    await expect(page.getByRole('button', { name: 'Completed' })).toHaveClass(/bg-\[#2563eb\]/);
    await page.screenshot({ path: 'screenshots/orders-filter-completed.png', fullPage: true });
  });

  test('can switch filter to Voided', async ({ page }) => {
    await page.getByRole('button', { name: 'Voided' }).click();
    await expect(page.getByRole('button', { name: 'Voided' })).toHaveClass(/bg-\[#2563eb\]/);
    await page.screenshot({ path: 'screenshots/orders-filter-voided.png', fullPage: true });
  });

  test('shows empty state or transaction rows', async ({ page }) => {
    const emptyState = page.getByText('ไม่มี transactions');
    const tableRow = page.getByText(/TXN-/);
    await expect(emptyState.or(tableRow).first()).toBeVisible({ timeout: 10_000 });
    await page.screenshot({ path: 'screenshots/orders-list.png', fullPage: true });
  });

  test('can open receipt modal if transactions exist', async ({ page }) => {
    const receiptBtn = page.getByRole('button', { name: 'ใบเสร็จ' }).first();
    const hasTransactions = await receiptBtn.isVisible().catch(() => false);
    if (!hasTransactions) {
      test.skip();
      return;
    }
    await receiptBtn.click();
    await expect(page.getByText('ใบเสร็จรับเงิน')).toBeVisible();
    await page.screenshot({ path: 'screenshots/orders-receipt-modal.png' });
    await page.keyboard.press('Escape');
  });
});
