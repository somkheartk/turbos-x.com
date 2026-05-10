// cSpell:disable
import { expect, test } from '@playwright/test';

test.describe('Products', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pos/products');
  });

  test('shows product cards or empty state', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'สินค้า' })).toBeVisible();
    const cards = page.locator('article');
    const emptyState = page.getByText('ไม่มีสินค้าในหมวดนี้');
    await expect(cards.first().or(emptyState)).toBeVisible({ timeout: 10_000 });
    await page.screenshot({ path: 'screenshots/products-grid.png', fullPage: true });
  });

  test('shows category filter buttons', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'ทั้งหมด' })).toBeVisible();
    await page.screenshot({ path: 'screenshots/products-categories.png' });
  });

  test('can filter by category', async ({ page }) => {
    const categoryBtns = page.getByRole('button').filter({ hasText: /เครื่องดื่ม|ขนม|ของสด/ });
    const count = await categoryBtns.count();
    if (count > 0) {
      await categoryBtns.first().click();
      await page.screenshot({ path: 'screenshots/products-filtered.png', fullPage: true });
      await expect(categoryBtns.first()).toHaveClass(/bg-\[#2563eb\]/);
    }
  });

  test('can open add product modal', async ({ page }) => {
    await page.getByRole('button', { name: 'เพิ่มสินค้า' }).click();
    await expect(page.getByText('เพิ่มสินค้าใหม่')).toBeVisible();
    await page.screenshot({ path: 'screenshots/products-modal-open.png' });
    await expect(page.getByLabel('ชื่อสินค้า')).toBeVisible();
    await expect(page.getByLabel('SKU')).toBeVisible();
    await expect(page.getByLabel('ราคา (บาท)')).toBeVisible();
  });

  test('add product modal validates required fields', async ({ page }) => {
    await page.getByRole('button', { name: 'เพิ่มสินค้า' }).click();
    await page.getByRole('button', { name: 'เพิ่มสินค้า' }).last().click();
    await expect(page.getByText('กรุณากรอกข้อมูลให้ครบ')).toBeVisible();
    await page.screenshot({ path: 'screenshots/products-modal-validation.png' });
  });

  test('can close add product modal', async ({ page }) => {
    await page.getByRole('button', { name: 'เพิ่มสินค้า' }).click();
    await page.getByRole('button', { name: 'ยกเลิก' }).click();
    await expect(page.getByText('เพิ่มสินค้าใหม่')).not.toBeVisible();
    await page.screenshot({ path: 'screenshots/products-modal-closed.png' });
  });
});
