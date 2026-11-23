import { test, expect } from '@playwright/test';

test('homepage loads and displays SymphoniaTic title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/SymphoniaTic/i);
});

test('catalog grids on home and events render cleanly without dummy data or grey grid voids', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });

  await page.goto('/');
  const scheduleGrid = page.locator('#jadwal .grid.lg\\:grid-cols-3').first();
  await expect(scheduleGrid.locator('h3').first()).toBeVisible({ timeout: 15000 });
  await expect(scheduleGrid).not.toHaveClass(/bg-\[#DFDDD6\]/);
  await expect(page.locator('body')).not.toContainText('DADADADA');

  const homeCards = scheduleGrid.locator('h3');
  const homeCardCount = await homeCards.count();
  expect(homeCardCount).toBeGreaterThan(0);

  const firstHomeDateBadge = scheduleGrid.locator('.bg-\\[\\#D4FF2A\\]').first();
  await expect(firstHomeDateBadge).toBeVisible();
  await expect(firstHomeDateBadge).toContainText(/202\d/);

  await page.goto('/events');
  await expect(page.getByRole('link', { name: 'Lihat Tiket' }).first()).toBeVisible({
    timeout: 15000,
  });
  await expect(page.locator('body')).not.toContainText('DADADADA');

  const eventsGrid = page
    .locator('section .grid')
    .filter({ has: page.getByRole('link', { name: 'Lihat Tiket' }) })
    .first();
  await expect(eventsGrid).toBeVisible();
  await expect(eventsGrid).not.toHaveClass(/bg-\[#DFDDD6\]/);

  const eventDateBadges = eventsGrid.locator('.bg-\\[\\#D4FF2A\\]');
  expect(await eventDateBadges.count()).toBeGreaterThan(0);
  await expect(eventDateBadges.first()).toBeVisible();
});

test('responsive viewports prevent horizontal overflow and expose tablet search toggle', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  for (const route of ['/', '/events']) {
    await page.goto(route);
    await page.waitForLoadState('networkidle');
    const hasNoOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    );
    expect(hasNoOverflow).toBeTruthy();
  }

  await page.setViewportSize({ width: 1024, height: 768 });
  await page.goto('/events');
  const searchToggle = page.getByRole('button', { name: 'Buka pencarian konser' });
  await expect(searchToggle).toBeVisible();
  await searchToggle.click();

  const searchRegion = page.getByRole('region', { name: 'Panel pencarian konser' });
  await expect(searchRegion).toBeVisible();
  await expect(
    searchRegion.getByRole('textbox', { name: /Cari konser/i })
  ).toBeFocused();
});
