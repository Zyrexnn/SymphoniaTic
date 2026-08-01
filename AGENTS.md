# Frontend — SymphoniaTic (Astro + React + Tailwind)

Platform pemesanan tiket konser. SSR Astro (adapter Node, output `server`) + island React + Tailwind v4 + GSAP/Framer Motion.

## Menjalankan
```bash
astro dev --background   # background mode, kelola via `astro dev status|logs|stop`
astro build / preview
```
Dev server: `http://127.0.0.1:4321`.

## Stack & Versi
- Astro 7 (SSR, adapter `@astrojs/node` standalone) + React 19 (`@astrojs/react`)
- Tailwind CSS v4 via `@tailwindcss/vite` plugin
- `framer-motion`, `gsap` (animasi)
- `lucide-react` (ikon)
- `html2canvas` + `jspdf` (export/unduh tiket)
- TypeScript, Node >= 22.12

## Struktur
- `src/pages/*.astro` — route (SSR), termasuk `admin.astro`, `redeem.astro`, `refund.astro`, `concert/[id].astro`, `ticket/[code].astro`
- `src/components/**` — island React, dikelompokkan: `admin/`, `landing/`, `redeem/`, `refund/`, plus `SymphoniaTicApp.tsx`
- `src/layouts/Layout.astro` — layout global
- `src/styles/global.css` — global styling
- `public/audio`, `public/*.jpg` — aset statis

## Backend API
- Base URL: env `PUBLIC_API_BASE_URL` (fallback `http://localhost:8082/api/v1`), dibaca di `src/components/landing/data.ts`.
- Backend Go di port `8082`; CORS allowlist localhost.

## Konvensi
- UI & copy dalam Bahasa Indonesia.
- Design directives: lihat `.skills/design-taste-frontend.md` & `.skills/frontend-design.md` (aesthetic intent, GSAP motion, bento grid, AIDA).
- Komponen berat interaksi & animasi: React island. Halaman konten statis: `.astro`.
- Client-side fetch ke API pakai helper di `landing/data.ts`.

## Perintah
```bash
astro dev
astro build
npm run astro -- check   # type/astro check
```
Verifikasi: `astro build` & `astro check` sebelum selesai.
