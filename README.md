# SymphoniaTic Frontend

Aplikasi web resmi untuk platform pemesanan tiket konser musik klasik **SymphoniaTic**, dibangun menggunakan **Astro v7 (SSR)**, **React 19**, dan **Tailwind CSS v4** dengan sistem visual *Concert Hall & Warm Playbill*.

---

## Tech Stack

- **Framework:** Astro v7 (`output: 'server'`, adapter `@astrojs/node` standalone)
- **UI Library:** React 19 (`@astrojs/react`) + TypeScript
- **Styling:** Tailwind CSS v4 (`@tailwindcss/vite`)
- **Icons:** Lucide React (`lucide-react`)
- **Animations:** Framer Motion & GSAP
- **E-Ticket & Pass:** HTML5 Canvas, `jspdf`, `html2canvas`, `qrcode.react`
- **Gate Scanner:** `html5-qrcode`

---

## Prasyarat & Setup Lokal

### 1. Konfigurasi Environment (`.env`)
Buat file `.env` di direktori `fe/` (referensi dari `.env.example`):

```env
PUBLIC_API_BASE_URL=http://localhost:8082/api/v1
```

Pastikan backend Go (`SymphoniaTic-BE`) berjalan di port `8082` sebelum menjalankan frontend.

### 2. Instalasi & Menjalankan Server

```bash
# Masuk ke direktori frontend
cd fe

# Instal dependensi
npm install

# Jalankan server development (http://localhost:4321)
npm run dev
```

---

## Perintah CLI

| Perintah | Keterangan |
| :--- | :--- |
| `npm run dev` | Menjalankan server development Astro SSR di `http://localhost:4321` |
| `npm run build` | Membangun bundle produksi SSR ke direktori `dist/` |
| `npm run preview` | Menjalankan preview dari hasil build produksi lokal |
| `npm test` | Menjalankan unit test utilitas (`src/lib/*.test.ts`) |
| `npm run test:e2e` | Menjalankan pengujian browser Playwright E2E |
| `npx tsc --noEmit --ignoreDeprecations 6.0` | Memeriksa validitas tipe TypeScript tanpa mengemit file |
| `npm run astro -- --help` | Menampilkan daftar perintah Astro CLI |

---

## Struktur Direktori

```text
fe/
├── public/                      # Aset statis, font, dan sampel audio konser
├── src/
│   ├── components/
│   │   ├── admin/               # Portal Admin & Gate Officer (Metrik, Konser, Pesanan, Refund, Scanner)
│   │   ├── auth/                # Komponen registrasi OTP, login, dan reset kata sandi
│   │   ├── dashboard/           # Dashboard akun penonton (riwayat tiket, profil, refund)
│   │   ├── landing/             # Katalog konser, detail konser, modal checkout, dan klien API (data.ts)
│   │   ├── redeem/              # Lookup kode tiket publik & cetak e-ticket
│   │   ├── refund/              # Pengajuan refund publik & verifikasi OTP
│   │   └── ui/                  # Primitif UI bersama (dialog konfirmasi, kontrol form, badge)
│   ├── layouts/                 # Layout HTML dasar, metadata, dan audio player konser
│   ├── lib/                     # Utilitas waktu, jadwal open gate, dan format tampilan
│   ├── pages/                   # Halaman rute Astro SSR (index, concerts/[id], admin, redeem, refund, auth/*)
│   └── styles/                  # Definisi global CSS dan konfigurasi Tailwind v4
├── DESIGN.md                    # Panduan sistem desain dan token visual
└── PRD.md                       # Dokumen kebutuhan produk
```

---

## Fitur Utama Berdasarkan Peran (Role)

### 1. Penonton (`USER`)
- **Eksplorasi Konser:** Melihat katalog pertunjukan orkestra, jadwal *open gate*, konduktor, solois, daftar kategori kursi, dan rundown acara.
- **Pemesanan & E-Ticket:** Checkout tiket dengan kode unik `SYM-XXXXXX`, tampilan QR Code e-ticket, serta ekspor pas konser ke **PNG** resolusi tinggi atau **PDF A4**.
- **Pengajuan Refund:** Formulir permohonan pengembalian dana terverifikasi OTP email serta pelacakan status pengajuan.
- **Dashboard Akun:** Mengelola profil, mengganti kata sandi, dan memantau riwayat transaksi.

### 2. Super Administrator (`SUPER_ADMIN`)
- **Supervisi & Kontrol Akses (RBAC):** Mengelola akun staf operasional (`SUPER_ADMIN`, `ADMIN`, dan `PETUGAS`), mengaktifkan/menonaktifkan akun, serta mereset kata sandi secara dinamis.
- **Log Audit Sistem:** Memantau jejak aktivitas kronologis (login, perubahan event/promo, persetujuan refund, dan mutasi akun staf) lengkap dengan ekspor CSV.
- **Hak Akses Penuh:** Memiliki seluruh wewenang Administrator Operasional dan Petugas Gate.

### 3. Administrator Operasional (`ADMIN`)
- **Metrik & Finansial:** Ringkasan pendapatan, tiket terjual, sisa kuota, distribusi kategori kursi, serta ekspor laporan keuangan CSV.
- **Manajemen Konser & Kategori:** Membuat, memperbarui, menutup/membuka penjualan tiket, dan menghapus event maupun kategori kursi.
- **Manajemen Pesanan, Promo & Refund:** Mengelola kode promo, melihat seluruh pesanan, mengubah status transaksi, mengekspor data pesanan ke CSV, serta menyetujui atau menolak pengajuan refund.
- **Gate Operations:** Akses penuh ke pemindai QR gate dan check-in manual.

### 4. Petugas Gate (`PETUGAS`)
- **Pemindai QR Gate:** Validasi tiket penonton di pintu masuk menggunakan kamera perangkat atau input kode manual dengan umpan balik audio.
- **Progres Kehadiran Penonton:** Kartu ringkasan jumlah tiket yang sudah masuk vs total tiket aktif (dapat difilter per konser) yang diperbarui otomatis setiap scan berhasil.
- **Pencarian Pesanan (*Read-Only*) & Check-in Manual:** Mencari data pesanan penonton berdasarkan nama/email saat QR terkendala di lapangan, disertai tombol **Check-in Manual** dengan konfirmasi. Akses ubah status pembayaran dan ekspor CSV dinonaktifkan sesuai prinsip *Least Privilege*.

---

## Panduan Desain

Seluruh antarmuka mengikuti standar visual *Concert Hall & Warm Playbill* yang terdokumentasi di [DESIGN.md](./DESIGN.md). Semua panggilan API wajib menggunakan `getApiBaseUrl()` dari `src/components/landing/data.ts`.
