import { test, expect } from '@playwright/test';

test('super admin can login, create staff, toggle status, delete staff, and verify live audit logs', async ({
  page,
}) => {
  const uniqueSuffix = Date.now();
  const tempUsername = `gate_e2e_${uniqueSuffix}`;
  const tempName = `Petugas E2E ${uniqueSuffix}`;
  const tempEmail = `${tempUsername}@symphoniatic.id`;

  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/admin');

  await page.getByRole('tab', { name: 'Super Admin' }).click();
  await page.getByLabel('Username Staf').fill('superadmin');
  await page.getByRole('textbox', { name: 'Kata Sandi' }).fill('123');
  await page.locator('form button[type="submit"]').click();

  await expect(page.getByRole('button', { name: /Manajemen Staf/i })).toBeVisible({ timeout: 15000 });
  await page.getByRole('button', { name: /Manajemen Staf/i }).click();

  const staffTable = page.getByRole('table');
  await expect(staffTable.getByText('@superadmin')).toBeVisible({ timeout: 10000 });

  await page.getByRole('button', { name: /Tambah Staf Baru/i }).click();
  await page.getByLabel(/Username Login/i).fill(tempUsername);
  await page.getByLabel(/Nama Lengkap Staf/i).fill(tempName);
  await page.getByLabel(/Email Resmi/i).fill(tempEmail);
  await page.getByLabel(/Kata Sandi Awal/i).fill('Rahasia123!');
  await page.getByRole('button', { name: /Daftarkan Akun Staf/i }).click();

  await expect(staffTable.getByText(`@${tempUsername}`)).toBeVisible({ timeout: 10000 });

  await staffTable.getByRole('button', { name: `Nonaktifkan ${tempUsername}` }).click();
  await page.getByRole('button', { name: 'Nonaktifkan', exact: true }).click();
  await expect(staffTable.getByText('NONAKTIF').first()).toBeVisible({ timeout: 10000 });

  await staffTable.getByRole('button', { name: `Hapus ${tempUsername}` }).click();
  await page.getByRole('button', { name: 'Hapus Akun', exact: true }).click();
  await expect(staffTable.getByText(`@${tempUsername}`)).toHaveCount(0, { timeout: 10000 });

  await page.getByRole('button', { name: /Log Audit Sistem/i }).click();
  const auditTable = page.getByRole('table');
  await expect(auditTable.getByText('CREATE_STAFF').first()).toBeVisible({ timeout: 10000 });
  await expect(auditTable.getByText('TOGGLE_STAFF_STATUS').first()).toBeVisible();
  await expect(auditTable.getByText('DELETE_STAFF').first()).toBeVisible();
});
