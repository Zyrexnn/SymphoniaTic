import { test, expect } from '@playwright/test';

const API_BASE = process.env.PUBLIC_API_BASE_URL || 'http://localhost:8082/api/v1';

test('petugas can login, enable gate bypass, check in a ticket, and see duplicate/invalid rejections', async ({
  page,
  request,
}) => {
  const eventsRes = await request.get(`${API_BASE}/events`);
  expect(eventsRes.ok()).toBeTruthy();
  const eventsBody = await eventsRes.json();
  const events = eventsBody.data as Array<{
    id: string;
    isClosed?: boolean;
    categories: Array<{ id: string; quota: number; remainingQuota?: number }>;
  }>;

  const targetEvent = events.find(
    (e) =>
      !e.isClosed &&
      Array.isArray(e.categories) &&
      e.categories.some((c) => (c.remainingQuota ?? c.quota) > 0)
  );
  expect(targetEvent).toBeDefined();

  const targetCategory = targetEvent!.categories.find(
    (c) => (c.remainingQuota ?? c.quota) > 0
  )!;

  let seatNumbers: string[] | undefined;
  const seatsRes = await request.get(`${API_BASE}/events/${targetEvent!.id}/seats`);
  if (seatsRes.ok()) {
    const seatsBody = await seatsRes.json();
    const availableSeat = (seatsBody.data as Array<{ categoryId: string; status: string; seatCode: string }> | undefined)?.find(
      (s) => s.categoryId === targetCategory.id && s.status === 'AVAILABLE'
    );
    if (availableSeat) {
      seatNumbers = [availableSeat.seatCode];
    }
  }

  const orderRes = await request.post(`${API_BASE}/orders`, {
    data: {
      eventId: String(targetEvent!.id),
      ticketCategoryId: targetCategory.id,
      quantity: 1,
      userName: 'Penonton Gate E2E',
      userEmail: `gate_e2e_${Date.now()}@example.com`,
      seatNumbers,
    },
  });
  expect(orderRes.ok()).toBeTruthy();
  const orderBody = await orderRes.json();
  expect(orderBody.success).toBe(true);
  const orderCode: string = orderBody.data.orderCode;
  expect(orderCode).toMatch(/^SYM-/);

  await page.goto('/admin');

  await page.getByLabel('Username Staf').fill('petugas');
  await page.getByRole('textbox', { name: 'Kata Sandi' }).fill('123');
  await page.locator('form button[type="submit"]').click();

  await expect(page.getByText('Pemindai Gate Masuk (QR Scanner)')).toBeVisible({ timeout: 15000 });

  const bypassBtn = page.getByRole('button', { name: /Mode Uji Coba Gate/i });
  await expect(bypassBtn).toBeVisible();
  await bypassBtn.click();

  const activeBypassBtn = page.getByRole('button', { name: /Bypass Open Gate: Aktif/i });
  await expect(activeBypassBtn).toHaveAttribute('aria-pressed', 'true');

  const codeInput = page.getByLabel('Input kode tiket manual');
  const checkBtn = page.getByRole('button', { name: 'Cek Manual' });

  await codeInput.fill(orderCode);
  await checkBtn.click();

  const statusCard = page.locator('[role="status"]');
  await expect(statusCard).toContainText('CHECK-IN BERHASIL (VALID)', { timeout: 10000 });
  await expect(statusCard).toContainText(orderCode);

  await codeInput.fill(orderCode);
  await checkBtn.click();

  await expect(statusCard).toContainText('TIKET SUDAH DIGUNAKAN', { timeout: 10000 });
  await expect(statusCard).toContainText(/sudah pernah/i);

  await codeInput.fill('SYM-INVALID999');
  await checkBtn.click();

  await expect(statusCard).toContainText('TIKET TIDAK VALID / VOID', { timeout: 10000 });
  await expect(statusCard).toContainText(/tidak ditemukan/i);
});
