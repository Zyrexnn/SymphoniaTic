# Product Requirement Document (PRD): SymphoniaTic

## 1. Project Context & Stack
**SymphoniaTic** is a high-performance concert ticket booking platform featuring a Go (Golang) REST API backend and an Astro.js SSR Web Admin Dashboard.

- **Repository FE:** [https://github.com/Zyrexnn/SymphoniaTic](https://github.com/Zyrexnn/SymphoniaTic)

### Core Stack Requirements:
- **Backend:** Go (Golang) with Fiber framework (`github.com/gofiber/fiber/v2`)
- **Web Admin Frontend:** Astro.js (SSR Mode enabled: `output: 'server'`) + Tailwind CSS
- **Authentication:** JWT (JSON Web Token) with bcrypt password hashing
- **Database:** SQLite / PostgreSQL (with ACID transactional support & Row Locking for ticket quotas)


---

## 2. MVP Core Features & Priority Matrix (Fitur Utama MVP)

Untuk memastikan rilis versi awal yang solid, fungsional, dan dapat diuji secara langsung, pengembangannya dibagi berdasarkan prioritas berikut:

### 🔴 Phase 1: High Priority (Must-Have for MVP Launch)
1. **Guest Checkout System (No-Login Flow)**:
   - Pembelian tiket instan tanpa wajib registrasi/login akun.
   - Form checkout hanya membutuhkan **Nama Lengkap**, **Email**, dan **Nomor WhatsApp/HP**.
   - Generasi otomatis Kode Pemesanan/Invoice Unik (`SYM-YYYY-XXXXX`).
2. **Instant E-Receipt & Email Dispatch**:
   - Pengiriman tanda terima pembayaran / invoice dan E-Ticket otomatis ke email pemesan setelah transaksi dikonfirmasi.
3. **Download E-Ticket (PDF & PNG Format)**:
   - Pengunjung dapat mengunduh E-Ticket ber-Kode QR resmi dalam format **PNG** (`html2canvas`) dan **PDF** (`jspdf`) secara langsung dari web.
4. **Invoice & Ticket Lookup (Cek Tiket Saya)**:
   - Modul pencarian tiket tanpa login di mana user cukup memasukkan **Kode Invoice** atau **Email** untuk melihat status pesanan dan E-Ticket mereka kapan saja.
5. **Master Data Management (Admin Only)**:
   - CRUD Data Artis (`artists`).
   - CRUD Data Event Konser (`events`) + Toggle status aktif/non-aktif penjualan tiket.
   - Manajemen Kategori Tiket (`ticket_categories`) beserta penetapan harga dan alokasi kuota awal.
6. **Atomic Quota Deduction & Transactional Security**:
   - Transaksi pemesanan tiket dengan batasan maksimal 4 tiket per transaksi.
   - Penguncian baris basis data (`FOR UPDATE`) pada backend Go untuk menjamin tidak ada *overbooking* saat *ticket war*.
7. **Basic Admin Dashboard & Verification**:
   - Dashboard daftar order untuk proses verifikasi/approval pembayaran oleh Admin (`GET /api/v1/admin/orders`).
   - Generasi otomatis QR Code `QR-SYM-[ORDER_CODE]` setelah order diverifikasi.

---

### 🟡 Phase 2: Medium Priority (Post-MVP Enhancements)
1. User Authentication (Optional Registered Customer Portal & History).
2. Otomatisasi pembatalan order `PENDING` yang kedaluwarsa (`expires_at` > 30 menit).
3. Scanner QR Code E-Ticket untuk petugas check-in di lokasi konser.

---

## 3. Directory & File Structure

```text
SymphoniaTic/
├── apps/
│   ├── api/                    # Golang REST API
│   │   ├── config/             # DB & Env setup
│   │   ├── controllers/        # Route Handlers / Controllers
│   │   ├── middleware/         # Auth, Role Guards, CORS & Rate Limiter
│   │   ├── models/             # Data Structs & Request/Response DTOs
│   │   ├── routes/             # Fiber Router registration
│   │   ├── go.mod
│   │   └── main.go
│   │
│   └── web/                    # Astro.js Web Admin
│       ├── src/
│       │   ├── components/     # UI Components (Sidebar, Table, Modals)
│       │   ├── layouts/        # Layout Templates
│       │   ├── pages/          # Astro SSR Pages & API Proxy Routes
│       │   └── services/       # API Fetch Client
│       ├── astro.config.mjs
│       └── package.json
│
├── docs/                       # Diagrams & Specifications
├── .gitignore
└── PRD.md
```

---

## 4. Data Models & Database Schema

### 4.1 Users (`users`)
- `id` (UUID / Integer, Primary Key)
- `name` (String)
- `email` (String, Unique, Indexed)
- `password` (String, Hashed with bcrypt)
- `role` (Enum/String: `ADMIN`, `CUSTOMER`)
- `created_at`, `updated_at` (Timestamp)
- `deleted_at` (Timestamp, Nullable - Soft Delete)

### 4.2 Artists (`artists`)
- `id` (UUID / Integer, Primary Key)
- `name` (String)
- `genre` (String)
- `bio` (Text)
- `created_at`, `updated_at` (Timestamp)
- `deleted_at` (Timestamp, Nullable - Soft Delete)

### 4.3 Events (`events`)
- `id` (UUID / Integer, Primary Key)
- `artist_id` (Foreign Key -> Artists.id, Indexed)
- `title` (String)
- `description` (Text)
- `venue` (String)
- `event_date` (Timestamp)
- `is_active` (Boolean, Default: `true`, Indexed)
- `created_at`, `updated_at` (Timestamp)
- `deleted_at` (Timestamp, Nullable - Soft Delete)

### 4.4 Ticket Categories (`ticket_categories`)
- `id` (UUID / Integer, Primary Key)
- `event_id` (Foreign Key -> Events.id, Indexed)
- `name` (String, e.g., "VIP", "CAT 1", "Festival")
- `price` (Float/Decimal)
- `quota` (Integer, Total capacity)
- `remaining_quota` (Integer, Available capacity)
- `created_at`, `updated_at` (Timestamp)
- `deleted_at` (Timestamp, Nullable - Soft Delete)

### 4.5 Orders (`orders`)
- `id` (UUID / Integer, Primary Key)
- `order_code` (String, Unique, Indexed, e.g., `SYM-2026-X8K9L`)
- `customer_name` (String, Required for Guest Checkout)
- `customer_email` (String, Required for Guest Checkout, Indexed)
- `customer_phone` (String, Required for Guest Checkout)
- `user_id` (Foreign Key -> Users.id, Nullable for Guest Checkout)
- `ticket_category_id` (Foreign Key -> TicketCategories.id, Indexed)
- `quantity` (Integer, Max 4 per transaction)
- `total_price` (Float/Decimal)
- `status` (Enum/String: `PENDING`, `VERIFIED`, `REJECTED`, `EXPIRED`)
- `expires_at` (Timestamp, Auto-cancel pending orders after 30 minutes)
- `qr_code` (String, Generated upon verification: `QR-SYM-[ORDER_CODE]`)
- `created_at`, `updated_at` (Timestamp)

---

## 5. API Specification & Endpoints (Go Backend)

### Standardized JSON Response Structure
All API responses must follow this format:
```json
{
  "success": true,
  "message": "Operation description",
  "data": null,
  "error": null
}
```

### Public Ticket & Order Routes (`/api/v1/public`)
- `POST /api/v1/orders` (Public / Guest Checkout)
  - Body: `{ customer_name, customer_email, customer_phone, ticket_category_id, quantity }`
  - Validation: Quantity between 1 and 4, valid email format.
  - Action: Create order, generate `order_code`, send receipt/e-ticket email asynchronously, and set `status = PENDING`.
- `GET /api/v1/tickets/lookup?code=SYM-2026-X8K9L` (Public / No-Login Ticket Check)
  - Query: `code` (Order Code) or `email`
  - Action: Return order status, ticket details, and QR Code string for guest ticket lookup.

### Auth Routes (`/api/v1/auth`)
- `POST /api/v1/auth/register`
  - Body: `{ name, email, password, role }`
  - Action: Registers admin/internal account, hashes password using bcrypt.
- `POST /api/v1/auth/login`
  - Body: `{ email, password }`
  - Action: Authenticates admin user and returns JWT Token (1-day expiry) + User Info & Role.

### Master Data Routes (Admin Only)
- `GET /api/v1/artists` & `POST /api/v1/artists` (CRUD Artists)
- `GET /api/v1/events` & `POST /api/v1/events` (CRUD Events)
- `PATCH /api/v1/events/:id/toggle`
  - Action: Toggle event active status (Open/Close ticket sales).
- `POST /api/v1/categories`
  - Body: `{ event_id, name, price, quota }`
  - Action: Create ticket categories for an event. Set `remaining_quota = quota`.

### Order & Verification Routes
- `POST /api/v1/orders` (Customer / Authenticated)
  - Body: `{ ticket_category_id, quantity }`
  - Validation: Quantity must be between 1 and 4.
  - Action: Create new order with status `PENDING` and set `expires_at = now() + 30 mins`.
- `GET /api/v1/admin/orders` (Admin Only)
  - Action: List all orders for verification.
- `PATCH /api/v1/admin/orders/:id/verify` (Admin Only)
  - Body: `{ status: "VERIFIED" | "REJECTED" }`
  - Action: Approve or Reject payment status with atomic transaction & row locking.
- `GET /api/v1/admin/dashboard` (Admin Only)
  - Action: Returns total revenue, tickets sold, and remaining quota metrics.

---

## 6. Strict Business Logic & Execution Rules

### 6.1 Concurrency & Atomic Quota Deduction (Ticket War Handling)
When approving an order in Go (`PATCH /api/v1/admin/orders/:id/verify` with status `VERIFIED`):
1. **Database Transaction:** Initialize a database transaction (`tx, err := db.Begin()`).
2. **Row Locking:** Read `remaining_quota` of target `ticket_category` with explicit row locking (`SELECT remaining_quota FROM ticket_categories WHERE id = ? FOR UPDATE`).
3. **Insufficient Quota:** If `remaining_quota < quantity`, ROLLBACK transaction and return HTTP 400 Bad Request (`"Kuota tidak mencukupi"`).
4. **Valid Quota:** Decrement `remaining_quota` by `quantity`, update order status to `VERIFIED`, generate QR code string `QR-SYM-[ORDER_CODE]`, and COMMIT transaction.

### 6.2 Security & Access Control
- **CORS & Rate Limiting:** Configure Fiber middleware to restrict CORS origins and rate limit sensitive auth/order endpoints.
- **Role-Based Access Control (RBAC):** Middleware must verify JWT and validate `role == 'ADMIN'` for all `/api/v1/admin/*` and master data mutation endpoints.

### 6.3 Order Expiration Logic
- Orders left in `PENDING` status past their `expires_at` timestamp are automatically treated as `EXPIRED` and cannot be verified.

### 6.4 Astro Web Setup
- `astro.config.mjs` MUST be set to `output: 'server'` mode for SSR fetching.
- Admin views must check JWT presence in cookies/headers before rendering restricted pages.

---

## 7. Environment Variables (`.env`)

### Go Backend (`apps/api/.env.example`)
```env
PORT=8080
DB_URL=postgres://user:password@localhost:5432/symphoniatic?sslmode=disable
JWT_SECRET=super-secret-jwt-key
CORS_ALLOWED_ORIGINS=http://localhost:4321
```

### Astro Frontend (`apps/web/.env.example`)
```env
PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
```

---

## 8. Development & Quality Guidelines
- Write fully functional, production-ready code.
- Strictly omit placeholders, TODO comments, or incomplete logic.
