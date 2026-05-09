import { expect, test } from '@playwright/test';
import { adminRoutes } from '../support/admin-constants';
import { loginAsAdmin } from '../support/admin-helpers';

test.describe('regression: login theme and sidebar shell', () => {
  test('renders the rewritten login theme content', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText('Smartstore Multi-Role Console')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Full-screen operations workspace สำหรับหลายบทบาทในธีมสีน้ำเงินขาว' })).toBeVisible();
    await expect(page.getByText('Secure access')).toBeVisible();
    await expect(page.getByText('Role ready')).toBeVisible();
    await expect(page.getByText('Full screen')).toBeVisible();
    await expect(page.getByText('Switch role in shell')).toBeVisible();
    await expect(page.getByRole('button', { name: 'เข้าสู่ระบบ' })).toBeVisible();
  });

  test('keeps the sidebar collapsed across reload and route navigation', async ({ page }) => {
    await loginAsAdmin(page);

    const shellHeader = page.locator('header').first();
    await shellHeader.getByRole('button', { name: 'Switch role, current role เจ้าของร้าน' }).click();
    await shellHeader.getByRole('button', { name: /ผู้จัดการปฏิบัติการ/ }).click();
    await expect(shellHeader.getByText('Operations Command')).toBeVisible();

    const collapseButton = page.getByRole('button', { name: 'Collapse sidebar' });
    await expect(collapseButton).toBeVisible();
    await collapseButton.click();

    const expandButton = page.getByRole('button', { name: 'Expand sidebar' });
    await expect(expandButton).toBeVisible();
    await expect(page.locator('nav[aria-label="Admin navigation"]').getByText('ปฏิบัติการ')).toHaveCount(0);
    await expect(page.getByText('Control deck')).toBeVisible();
    await expect(page.getByTitle('คลังสินค้า')).toBeVisible();

    await page.reload();
    await expect(page.locator('header').first().getByText('Operations Command')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Expand sidebar' })).toBeVisible();
    await expect(page.getByTitle('คลังสินค้า')).toBeVisible();

    await page.getByTitle('คลังสินค้า').click();
    await expect(page).toHaveURL(new RegExp(`${adminRoutes.stock}$`));
    await expect(page.getByRole('heading', { name: 'Inventory routing', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Expand sidebar' })).toBeVisible();
  });
});