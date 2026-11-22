import { test, expect } from '@playwright/test';

test('user can browse concerts, pick a seat, complete checkout, and open e-ticket page', async ({ page }) => {
  await page.goto('/events');

  const firstTicketLink = page.getByRole('link', { name: 'Lihat Tiket' }).first();
  await expect(firstTicketLink).toBeVisible({ timeout: 15000 });
  await firstTicketLink.click();

  await expect(page).toHaveURL(/\/concert\//);

  const buyButton = page.getByRole('button', { name: /Pesan ·/i }).first();
  await expect(buyButton).toBeVisible({ timeout: 15000 });
  await buyButton.click();

  const dialog = page.getByRole('dialog');
  await expect(dialog.getByText('1. Pilih Zona & Nomor Kursi')).toBeVisible({ timeout: 10000 });

  const availableSeat = dialog.locator('svg [role="button"][aria-label*="Tersedia"]').first();
  await expect(availableSeat).toBeVisible({ timeout: 10000 });
  await availableSeat.click();

  const uniqueEmail = `e2e_${Date.now()}@example.com`;
  await dialog.getByLabel(/Nama Lengkap/i).fill('Penonton E2E');
  await dialog.getByLabel(/Alamat Email/i).fill(uniqueEmail);

  const submitButton = dialog.locator('aside button[type="submit"]:has-text("Konfirmasi Pemesanan")');
  await expect(submitButton).toBeEnabled({ timeout: 10000 });
  await submitButton.click();

  await expect(page.getByText('Tiket Berhasil Diterbitkan')).toBeVisible({ timeout: 15000 });

  const orderCodeEl = page.locator('[data-ticket-card="true"] span.font-mono', { hasText: /^SYM-/ }).first();
  await expect(orderCodeEl).toBeVisible();
  const fullCode = (await orderCodeEl.textContent())?.trim() || '';
  const orderCodeMatch = fullCode.match(/SYM-[A-Z0-9]+/);
  expect(orderCodeMatch).not.toBeNull();
  const orderCode = orderCodeMatch![0];

  await expect(page.locator('#ticket-real-qrcode')).toBeVisible();

  const openTicketLink = page.getByRole('link', { name: 'Buka Halaman Tiket' });
  await expect(openTicketLink).toBeVisible();
  await openTicketLink.click();

  await expect(page).toHaveURL(new RegExp(`/ticket/${orderCode}`));
  await expect(page.getByText(orderCode).first()).toBeVisible({ timeout: 15000 });
  await expect(page.getByText('Penonton E2E').first()).toBeVisible();
});
