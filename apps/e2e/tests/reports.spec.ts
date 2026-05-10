// cSpell:disable
import { expect, test } from '@playwright/test';

test.describe('Reports', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pos/reports');
  });

  test('shows report header', async ({ page }) => {
    await expect(page.getByText('Sales report')).toBeVisible();
    await expect(page.getByText('Analytics lane')).toBeVisible();
    await page.screenshot({ path: 'screenshots/reports-header.png', fullPage: false });
  });

  test('shows summary cards', async ({ page }) => {
    await expect(page.getByText('ยอดขายรวม')).toBeVisible();
    await expect(page.getByText('รายการทั้งหมด')).toBeVisible();
    await expect(page.getByText('ค่าเฉลี่ยต่อบิล')).toBeVisible();
    await expect(page.getByText('สินค้าที่ขาย')).toBeVisible();
    await page.screenshot({ path: 'screenshots/reports-summary-cards.png' });
  });

  test('shows shift revenue breakdown', async ({ page }) => {
    await expect(page.getByText('Revenue by shift')).toBeVisible();
    await expect(page.getByText('Morning').first()).toBeVisible();
    await expect(page.getByText('Evening').first()).toBeVisible();
    await expect(page.getByText('Night').first()).toBeVisible();
    await page.screenshot({ path: 'screenshots/reports-by-shift.png' });
  });

  test('shows daily trend bar chart', async ({ page }) => {
    await expect(page.getByText('Daily trend')).toBeVisible();
    await expect(page.getByText('ยอดขายรายวัน (7 วันล่าสุด)')).toBeVisible();
    await page.screenshot({ path: 'screenshots/reports-daily-chart.png' });
  });

  test('shows top products table', async ({ page }) => {
    await expect(page.getByText('สินค้าขายดี 5 อันดับ')).toBeVisible();
    await page.screenshot({ path: 'screenshots/reports-top-products.png' });
  });

  test('shows cashier performance table', async ({ page }) => {
    await expect(page.getByText('ยอดขายต่อพนักงาน')).toBeVisible();
    await page.screenshot({ path: 'screenshots/reports-by-cashier.png' });
  });

  test('full page screenshot', async ({ page }) => {
    await expect(page.getByText('Sales report')).toBeVisible();
    await page.screenshot({ path: 'screenshots/reports-full.png', fullPage: true });
  });
});
