import { expect, test } from '@playwright/test';
import { posRoutes } from '../support/admin-constants';

test.describe('smoke: POS system pages', () => {
  test('โหลดหน้า POS Dashboard ได้', async ({ page }) => {
    await page.goto(posRoutes.dashboard);

    await expect(page.getByText('POS System')).toBeVisible();
    await expect(page.getByText('Dashboard')).toBeVisible();
    await expect(page.getByText('Live counters')).toBeVisible();
  });

  test('โหลดหน้า Cashier terminal ได้และแสดง product grid', async ({ page }) => {
    await page.goto(posRoutes.cashier);

    await expect(page.getByText('ตะกร้า')).toBeVisible();
    await expect(page.getByText('ทั้งหมด')).toBeVisible();
    await expect(page.getByText('ชำระเงิน')).toBeVisible();
  });

  test('โหลดหน้า Products ได้', async ({ page }) => {
    await page.goto(posRoutes.products);

    await expect(page.getByRole('heading', { name: 'สินค้า' })).toBeVisible();
    await expect(page.getByText('ทั้งหมด')).toBeVisible();
    await expect(page.getByText('Active')).toBeVisible();
  });

  test('โหลดหน้า Orders ได้', async ({ page }) => {
    await page.goto(posRoutes.orders);

    await expect(page.getByRole('heading', { name: 'Orders' })).toBeVisible();
    await expect(page.getByText('Completed')).toBeVisible();
    await expect(page.getByText('Voided')).toBeVisible();
  });

  test('โหลดหน้า Users ได้และแสดงรายชื่อพนักงาน', async ({ page }) => {
    await page.goto(posRoutes.users);

    await expect(page.getByRole('heading', { name: 'พนักงาน' })).toBeVisible();
    await expect(page.getByText('Mint')).toBeVisible();
    await expect(page.getByText('Beam')).toBeVisible();
    await expect(page.getByText('Nida')).toBeVisible();
  });

  test('sidebar navigation ครบทุกลิงก์', async ({ page }) => {
    await page.goto(posRoutes.dashboard);

    await expect(page.getByRole('link', { name: /Dashboard/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /Cashier/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /Orders/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /Products/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /Users/ })).toBeVisible();
  });
});
