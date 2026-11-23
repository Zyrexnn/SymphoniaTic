import { test, expect } from '@playwright/test';

const MOCK_SMOKE_EVENTS = [
  {
    id: 'evt-smoke-1',
    title: 'Simfoni Mahakarya Beethoven No. 9',
    subtitle: 'Pertunjukan Mahakarya Simfoni',
    artist: 'Orkestra Filharmoni Jakarta & Solois Vokal',
    conductor: 'Maestro Addie MS',
    venue: 'Aula Simfonia Jakarta, Kemayoran',
    address: 'Jl. Industri Blok B14 No.1, Kemayoran, Jakarta Pusat',
    date: '15 Agustus 2027',
    time: '19:30 WIB',
    openGate: '18:00 WIB',
    category: 'SIMFONI UTAMA',
    categoryBadgeColor: 'bg-white/10 text-white border-white/20',
    image: '/poster_1.jpg',
    audioUrl: '',
    organizer: 'SymphoniaTic Production',
    description: 'Pertunjukan karya simfoni Ode to Joy bersama 80 musisi orkestra dan paduan suara.',
    isClosed: false,
    rundown: [{ time: '18:00 WIB', activity: 'Open Gate & Registrasi Tiket' }],
    categories: [
      { id: 'cat-s1-1', name: 'VIP Pit', price: 1500000, quota: 20, remainingQuota: 14, benefits: [] },
      { id: 'cat-s1-2', name: 'Festival', price: 450000, quota: 60, remainingQuota: 35, benefits: [] },
    ],
  },
  {
    id: 'evt-smoke-2',
    title: 'Malam Balet Klasik: Danau Angsa',
    subtitle: 'Pertunjukan Balet & Opera Romantis',
    artist: 'Nusantara Ballet Company & Chamber Orchestra',
    conductor: 'Maestro Hikotaro Yazaki',
    venue: 'Teater Jakarta, Taman Ismail Marzuki',
    address: 'Jl. Cikini Raya No.73, Menteng, Jakarta Pusat',
    date: '22 Agustus 2027',
    time: '20:00 WIB',
    openGate: '18:30 WIB',
    category: 'BALET & OPERA',
    categoryBadgeColor: 'bg-white/10 text-white border-white/20',
    image: '/poster_2.jpg',
    audioUrl: '',
    organizer: 'SymphoniaTic Production',
    description: 'Pertunjukan balet klasik karya Tchaikovsky dengan iringan langsung chamber orchestra.',
    isClosed: false,
    rundown: [{ time: '18:30 WIB', activity: 'Open Gate & Registrasi Tiket' }],
    categories: [
      { id: 'cat-s2-1', name: 'VVIP Box', price: 2000000, quota: 12, remainingQuota: 6, benefits: [] },
      { id: 'cat-s2-2', name: 'CAT 1', price: 950000, quota: 40, remainingQuota: 22, benefits: [] },
    ],
  },
  {
    id: 'evt-smoke-3',
    title: 'Resital Piano Tunggal: Malam Chopin',
    subtitle: 'Pertunjukan Piano Solo Virtuoso',
    artist: 'Solois Pianis Muda Internasional',
    conductor: 'Resital Tunggal',
    venue: 'Gedung Kesenian Jakarta, Pasar Baru',
    address: 'Jl. Gedung Kesenian No.1, Pasar Baru, Jakarta Pusat',
    date: '05 September 2027',
    time: '19:00 WIB',
    openGate: '17:30 WIB',
    category: 'RESITAL PIANO',
    categoryBadgeColor: 'bg-white/10 text-white border-white/20',
    image: '/poster_3.jpg',
    audioUrl: '',
    organizer: 'SymphoniaTic Production',
    description: 'Nocturne Chopin dan Rhapsody Liszt dalam format resital akustik intim.',
    isClosed: false,
    rundown: [{ time: '17:30 WIB', activity: 'Open Gate & Registrasi Tiket' }],
    categories: [
      { id: 'cat-s3-1', name: 'VIP Diamond', price: 1250000, quota: 16, remainingQuota: 9, benefits: [] },
      { id: 'cat-s3-2', name: 'Student Pass', price: 300000, quota: 50, remainingQuota: 28, benefits: [] },
    ],
  },
];

test.beforeEach(async ({ page }) => {
  await page.route('**/api/v1/events', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, message: 'OK', data: MOCK_SMOKE_EVENTS }),
    });
  });

  await page.route('**/api/v1/promos/active', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, message: 'OK', data: [] }),
    });
  });
});

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

test('admin portal renders 3-role login, super admin supervision panels, and zero mobile overflow', async ({
  page,
}) => {
  await page.route('**/api/v1/admin/login', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        message: 'Login SUPER_ADMIN berhasil',
        data: {
          token: 'mock-super-admin-jwt',
          user: {
            id: 'staff-superadmin-1',
            email: 'superadmin@symphoniatic.id',
            name: 'Kepala Penyelenggara (Super Admin)',
            role: 'SUPER_ADMIN',
            isVerified: true,
          },
        },
      }),
    });
  });

  await page.route('**/api/v1/admin/dashboard', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: { totalRevenue: 1500000, ticketsSold: 2, remainingQuota: 50, totalEvents: 3, totalOrders: 1 },
      }),
    });
  });

  await page.route('**/api/v1/admin/orders*', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [] }) });
  });

  await page.route('**/api/v1/admin/refunds', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [] }) });
  });

  await page.route('**/api/v1/admin/promos', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [] }) });
  });

  await page.route('**/api/v1/admin/staff*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: [
          {
            id: 'staff-superadmin-1',
            username: 'superadmin',
            name: 'Kepala Penyelenggara',
            email: 'superadmin@symphoniatic.id',
            role: 'SUPER_ADMIN',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 'staff-petugas-1',
            username: 'petugas',
            name: 'Petugas Gate Utama',
            email: 'petugas@symphoniatic.id',
            role: 'PETUGAS',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
      }),
    });
  });

  const mockAuditItems = [
    {
      id: 'audit-smoke-1',
      actorId: 'staff-superadmin-1',
      actorName: 'superadmin@symphoniatic.id',
      actorRole: 'SUPER_ADMIN',
      action: 'ADMIN_LOGIN',
      targetResource: 'auth:superadmin',
      details: 'Login portal operasional sebagai SUPER_ADMIN',
      ipAddress: '127.0.0.1',
      category: 'AUTH',
      severity: 'INFO',
      statusCode: 200,
      createdAt: new Date().toISOString(),
    },
  ];

  await page.route('**/api/v1/admin/audit-logs/search*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: { items: mockAuditItems, total: mockAuditItems.length, page: 1, limit: 25 },
      }),
    });
  });

  await page.route('**/api/v1/admin/audit-logs*', async (route) => {
    if (route.request().url().includes('/audit-logs/search')) {
      await route.fallback();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: mockAuditItems }),
    });
  });

  const mockBlockedList: Array<Record<string, unknown>> = [];
  await page.route('**/api/v1/admin/security/blocked-ips**', async (route) => {
    const method = route.request().method();
    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: mockBlockedList }),
      });
      return;
    }
    if (method === 'POST') {
      const payload = route.request().postDataJSON() as { ipAddress: string; reason: string; durationMinutes: number };
      const created = {
        id: 'blk-smoke-1',
        ipAddress: payload.ipAddress,
        reason: payload.reason,
        blockedBy: 'superadmin@symphoniatic.id',
        isAuto: false,
        isActive: true,
        createdAt: new Date().toISOString(),
      };
      mockBlockedList.push(created);
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, message: `Alamat IP ${payload.ipAddress} berhasil diblokir`, data: created }),
      });
      return;
    }
    if (method === 'DELETE') {
      const target = decodeURIComponent(route.request().url().split('/').pop() || '');
      const idx = mockBlockedList.findIndex((item) => item.ipAddress === target || item.id === target);
      if (idx >= 0) mockBlockedList.splice(idx, 1);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, message: 'Blokir alamat IP berhasil dibuka' }),
      });
    }
  });

  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/admin');

  await expect(page.getByRole('tab', { name: 'Super Admin' })).toBeVisible({ timeout: 15000 });
  await expect(page.getByRole('tab', { name: 'Admin', exact: true })).toBeVisible();
  await expect(page.getByRole('tab', { name: 'Petugas' })).toBeVisible();

  await page.getByRole('tab', { name: 'Super Admin' }).click();
  await page.getByLabel('Username Staf').fill('superadmin');
  await page.getByRole('textbox', { name: 'Kata Sandi' }).fill('123');
  await page.locator('form button[type="submit"]').click();

  await expect(page.getByText('Manajemen Staf')).toBeVisible({ timeout: 15000 });
  await expect(page.getByText('Log Audit Sistem')).toBeVisible();

  await page.getByRole('button', { name: /Manajemen Staf/i }).click();
  const staffTable = page.getByRole('table');
  await expect(staffTable.getByText('@superadmin')).toBeVisible();
  await expect(staffTable.getByText('Anda')).toBeVisible();
  await expect(staffTable.getByRole('button', { name: 'Nonaktifkan superadmin' })).toBeDisabled();

  await page.getByRole('button', { name: /Log Audit Sistem/i }).click();
  await expect(page.getByRole('table').getByText('ADMIN_LOGIN')).toBeVisible();
  await expect(page.getByRole('table').getByText('INFO')).toBeVisible();

  await page.getByRole('button', { name: /IP Diblokir/i }).click();
  await page.getByLabel('Alamat IP').fill('203.0.113.99');
  await page.getByLabel('Alasan Pemblokiran').fill('Simulasi serangan E2E');
  await page.getByRole('button', { name: 'Blokir IP' }).click();
  await expect(page.getByRole('table').getByText('203.0.113.99')).toBeVisible();

  await page.getByRole('button', { name: 'Buka Blokir' }).click();
  await expect(page.getByText('Tidak Ada IP yang Diblokir')).toBeVisible();

  await page.setViewportSize({ width: 375, height: 812 });
  await page.waitForTimeout(200);
  const noOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth <= window.innerWidth
  );
  expect(noOverflow).toBeTruthy();
});
