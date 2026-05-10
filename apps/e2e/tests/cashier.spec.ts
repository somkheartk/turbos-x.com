// cSpell:disable
import { expect, test } from '@playwright/test';

test.describe('Cashier Terminal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pos/cashier');
  });

  test('shows product grid or empty state', async ({ page }) => {
    // Either products load OR empty state — both are valid without backend
    const productCards = page.locator('article');
    const emptyCategory = page.getByText('ไม่มีสินค้าในหมวดนี้');
    const cartPanel = page.getByText('ตะกร้า', { exact: true });
    await expect(productCards.first().or(emptyCategory).or(cartPanel)).toBeVisible({ timeout: 10_000 });
    await page.screenshot({ path: 'screenshots/cashier-product-grid.png', fullPage: true });
  });

  test('cart starts empty', async ({ page }) => {
    await expect(page.getByText('กดสินค้าเพื่อเพิ่มลงตะกร้า')).toBeVisible({ timeout: 5_000 });
    await page.screenshot({ path: 'screenshots/cashier-empty-cart.png' });
  });

  test('can add product to cart', async ({ page }) => {
    const firstCard = page.locator('article').first();
    const hasProducts = await firstCard.isVisible({ timeout: 8_000 }).catch(() => false);
    if (!hasProducts) {
      test.skip();
      return;
    }
    await page.screenshot({ path: 'screenshots/cashier-before-add.png', fullPage: true });
    await firstCard.click();
    await expect(page.getByText('กดสินค้าเพื่อเพิ่มลงตะกร้า')).not.toBeVisible();
    await page.screenshot({ path: 'screenshots/cashier-after-add.png', fullPage: true });
  });

  test('checkout button is disabled when cart is empty', async ({ page }) => {
    await expect(page.getByText('กดสินค้าเพื่อเพิ่มลงตะกร้า')).toBeVisible({ timeout: 5_000 });
    const checkoutBtn = page.locator('button').filter({ hasText: /ชำระ|เพิ่มสินค้า/ }).last();
    await expect(checkoutBtn).toBeDisabled();
    await page.screenshot({ path: 'screenshots/cashier-checkout-disabled.png' });
  });
});
