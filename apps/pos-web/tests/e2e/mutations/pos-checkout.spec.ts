import { expect, test } from '@playwright/test';
import { posRoutes } from '../support/admin-constants';

test.describe('mutations: POS checkout', () => {
  test('checkout สำเร็จด้วย QR — แสดงใบเสร็จ', async ({ page }) => {
    await page.goto(posRoutes.cashier);

    // เพิ่มสินค้า
    await page.getByText('Hydra Serum 30ml').click();

    // เลือก QR
    await page.getByRole('button', { name: /📱 QR/ }).click();

    // ชำระเงิน
    await page.getByRole('button', { name: /ชำระเงิน/ }).click();

    // รอใบเสร็จ
    await expect(page.getByText('ชำระเงินสำเร็จ')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/TXN-/)).toBeVisible();
  });

  test('checkout ด้วย Cash — แสดงเงินทอน', async ({ page }) => {
    await page.goto(posRoutes.cashier);

    await page.getByText('Hydra Serum 30ml').click();

    // Cash + ใส่เงินรับ
    const cashInput = page.locator('input[placeholder="รับเงิน (บาท)"]');
    await cashInput.fill('2000');

    await page.getByRole('button', { name: /ชำระเงิน/ }).click();

    await expect(page.getByText('ชำระเงินสำเร็จ')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/เงินทอน/)).toBeVisible();
  });

  test('หลัง checkout — กด "ออเดอร์ถัดไป" ล้างตะกร้าได้', async ({ page }) => {
    await page.goto(posRoutes.cashier);

    await page.getByText('Hydra Serum 30ml').click();
    await page.getByRole('button', { name: /📱 QR/ }).click();
    await page.getByRole('button', { name: /ชำระเงิน/ }).click();

    await expect(page.getByText('ชำระเงินสำเร็จ')).toBeVisible({ timeout: 5000 });

    await page.getByRole('button', { name: 'ออเดอร์ถัดไป' }).click();

    await expect(page.getByText('กดสินค้าเพื่อเพิ่มลงตะกร้า')).toBeVisible();
  });

  test('transaction ใหม่ปรากฏในหน้า Orders', async ({ page }) => {
    // ทำ checkout ก่อน
    await page.goto(posRoutes.cashier);
    await page.getByText('Hydra Serum 30ml').click();
    await page.getByRole('button', { name: /📱 QR/ }).click();
    await page.getByRole('button', { name: /ชำระเงิน/ }).click();
    await expect(page.getByText('ชำระเงินสำเร็จ')).toBeVisible({ timeout: 5000 });

    // ไปหน้า Orders
    await page.goto(posRoutes.orders);

    await expect(page.getByText(/TXN-/)).toBeVisible();
    await expect(page.getByText('Completed').first()).toBeVisible();
  });
});

test.describe('mutations: POS user management', () => {
  test('toggle Som จาก Inactive → Active', async ({ page }) => {
    await page.goto(posRoutes.users);

    // Som อยู่ในสถานะ Inactive → ปุ่ม Activate
    const somRow = page.locator('div').filter({ hasText: /^Som/ }).first();
    const activateBtn = somRow.getByRole('button', { name: 'Activate' });

    if (await activateBtn.isVisible()) {
      await activateBtn.click();
      await page.waitForLoadState('networkidle');
      // หลัง toggle ปุ่มต้องเปลี่ยนเป็น Deactivate
      await expect(page.locator('div').filter({ hasText: /^Som/ }).first().getByRole('button', { name: 'Deactivate' })).toBeVisible({ timeout: 5000 });
    }
  });
});
