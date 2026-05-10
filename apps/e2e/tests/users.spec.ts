// cSpell:disable
import { expect, test } from '@playwright/test';

test.describe('Users', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pos/users');
  });

  test('shows users page heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'พนักงาน' })).toBeVisible();
    await page.screenshot({ path: 'screenshots/users-table.png', fullPage: true });
  });

  test('shows role badges when users exist', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'พนักงาน' })).toBeVisible({ timeout: 10_000 });
    const roleBadge = page.getByText(/cashier|manager|admin/i).first();
    const hasRoles = await roleBadge.isVisible({ timeout: 5_000 }).catch(() => false);
    if (!hasRoles) {
      test.skip();
      return;
    }
    await expect(roleBadge).toBeVisible();
    await page.screenshot({ path: 'screenshots/users-roles.png' });
  });

  test('shows status toggles when users exist', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'พนักงาน' })).toBeVisible({ timeout: 10_000 });
    const toggleBtn = page.getByRole('button', { name: /Activate|Deactivate/i }).first();
    const hasToggles = await toggleBtn.isVisible({ timeout: 5_000 }).catch(() => false);
    if (!hasToggles) {
      test.skip();
      return;
    }
    await expect(toggleBtn).toBeVisible();
    await page.screenshot({ path: 'screenshots/users-toggles.png' });
  });

  test('can open add user modal', async ({ page }) => {
    await page.getByRole('button', { name: 'เพิ่มพนักงาน' }).click();
    await expect(page.getByText('เพิ่มพนักงานใหม่')).toBeVisible();
    await page.screenshot({ path: 'screenshots/users-modal-open.png' });
  });

  test('add user modal validates required fields', async ({ page }) => {
    await page.getByRole('button', { name: 'เพิ่มพนักงาน' }).click();
    await page.getByRole('button', { name: 'เพิ่มพนักงาน' }).last().click();
    await expect(page.getByText('กรุณากรอกชื่อและ PIN')).toBeVisible();
    await page.screenshot({ path: 'screenshots/users-modal-validation.png' });
  });

  test('can close add user modal', async ({ page }) => {
    await page.getByRole('button', { name: 'เพิ่มพนักงาน' }).click();
    await page.getByRole('button', { name: 'ยกเลิก' }).click();
    await expect(page.getByText('เพิ่มพนักงานใหม่')).not.toBeVisible();
    await page.screenshot({ path: 'screenshots/users-modal-closed.png' });
  });
});
