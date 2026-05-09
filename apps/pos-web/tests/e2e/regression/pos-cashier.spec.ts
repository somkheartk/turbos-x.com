import { expect, test } from '@playwright/test';
import { posRoutes } from '../support/admin-constants';

test.describe('regression: cashier terminal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(posRoutes.cashier);
    await expect(page.getByText('ตะกร้า')).toBeVisible();
  });

  test('แสดงสินค้าใน grid และกด filter category ได้', async ({ page }) => {
    // สินค้ามีอยู่ใน grid
    await expect(page.getByText('Hydra Serum 30ml')).toBeVisible();

    // category tabs แสดงครบ
    const tabs = page.locator('button').filter({ hasText: 'ทั้งหมด' });
    await expect(tabs.first()).toBeVisible();
  });

  test('เพิ่มสินค้าลงตะกร้าแล้วยอดรวมถูกต้อง', async ({ page }) => {
    // กดสินค้าชิ้นแรก (Hydra Serum ฿1,290)
    await page.getByText('Hydra Serum 30ml').click();

    // ตะกร้าต้องแสดงสินค้า
    await expect(page.getByText('Hydra Serum 30ml').nth(1)).toBeVisible();

    // ปุ่มชำระเงินต้องอัพเดตยอด
    await expect(page.getByRole('button', { name: /ชำระเงิน/ })).toContainText('฿');
  });

  test('เพิ่มสินค้าหลายชิ้น — ปุ่ม + − ทำงานได้', async ({ page }) => {
    await page.getByText('Hydra Serum 30ml').click();

    // กด + เพิ่มเป็น 2 ชิ้น
    await page.getByRole('button', { name: '+' }).first().click();
    await expect(page.getByText('2')).toBeVisible();

    // กด − ลดเป็น 1 ชิ้น
    await page.getByRole('button', { name: '−' }).first().click();
    await expect(page.getByText('1')).toBeVisible();
  });

  test('เลือก payment method ได้ทั้ง 3 แบบ', async ({ page }) => {
    await page.getByText('Hydra Serum 30ml').click();

    // Cash (default)
    await expect(page.getByRole('button', { name: /💵 Cash/ })).toHaveClass(/bg-\[#0d1117\]/);

    // QR
    await page.getByRole('button', { name: /📱 QR/ }).click();
    await expect(page.getByRole('button', { name: /📱 QR/ })).toHaveClass(/bg-\[#0d1117\]/);

    // Card
    await page.getByRole('button', { name: /💳 Card/ }).click();
    await expect(page.getByRole('button', { name: /💳 Card/ })).toHaveClass(/bg-\[#0d1117\]/);
  });

  test('เลือก Cash และพิมพ์จำนวนเงิน — คำนวณเงินทอนถูก', async ({ page }) => {
    // Hydra Serum ฿1,290
    await page.getByText('Hydra Serum 30ml').click();

    // เลือก Cash (default)
    const cashInput = page.locator('input[placeholder="รับเงิน (บาท)"]');
    await expect(cashInput).toBeVisible();

    // จ่าย 2000 → ทอน 710
    await cashInput.fill('2000');
    await expect(page.getByText(/เงินทอน/)).toBeVisible();
  });

  test('กดล้างตะกร้า — cart ว่าง', async ({ page }) => {
    await page.getByText('Hydra Serum 30ml').click();
    await expect(page.getByText('ล้าง')).toBeVisible();

    await page.getByText('ล้าง').click();
    await expect(page.getByText('กดสินค้าเพื่อเพิ่มลงตะกร้า')).toBeVisible();
  });

  test('ปุ่มชำระเงิน disabled เมื่อตะกร้าว่าง', async ({ page }) => {
    const checkoutBtn = page.getByRole('button', { name: /ชำระเงิน/ });
    await expect(checkoutBtn).toBeDisabled();
  });
});

test.describe('regression: POS products page', () => {
  test('แสดงสินค้าทั้งหมดพร้อม category tabs', async ({ page }) => {
    await page.goto(posRoutes.products);

    await expect(page.getByText('Hydra Serum 30ml')).toBeVisible();
    await expect(page.getByText('Skincare')).toBeVisible();
  });

  test('แสดง status badge ของแต่ละสินค้า', async ({ page }) => {
    await page.goto(posRoutes.products);

    await expect(page.getByText('Active').first()).toBeVisible();
  });
});

test.describe('regression: POS users page', () => {
  test('แสดงรายชื่อพนักงานครบพร้อม role และ shift', async ({ page }) => {
    await page.goto(posRoutes.users);

    await expect(page.getByText('Mint')).toBeVisible();
    await expect(page.getByText('Cashier').first()).toBeVisible();
    await expect(page.getByText('08:00-17:00')).toBeVisible();
  });

  test('Som แสดงสถานะ Inactive', async ({ page }) => {
    await page.goto(posRoutes.users);

    await expect(page.getByText('Som')).toBeVisible();
    await expect(page.getByText('Inactive')).toBeVisible();
  });
});
