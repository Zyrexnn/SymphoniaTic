# Product Requirement Document (PRD): SymphoniaTic

## 1. Project Context & Stack
**SymphoniaTic** is a high-performance classical concert ticket booking platform featuring a Go (Golang) REST API backend and an Astro.js SSR Web Application with React 19 components & Glassmorphism UI styled strictly according to `DESIGN.md` guidelines.

- **Repository Frontend (FE):** [https://github.com/Zyrexnn/SymphoniaTic](https://github.com/Zyrexnn/SymphoniaTic)
- **Repository Backend (BE):** [https://github.com/Zyrexnn/SymphoniaTic-BE](https://github.com/Zyrexnn/SymphoniaTic-BE)

### Core Stack Requirements:
- **Backend:** Go (Golang 1.25+) with Fiber v2 framework (`github.com/gofiber/fiber/v2`), Native SQL Driver (`github.com/lib/pq`), & Standard `net/smtp` for email delivery.
- **Frontend:** Astro.js 5+ (SSR Mode: `output: 'server'`) + React 19 + Tailwind CSS + Framer Motion + Lucide Icons.
- **Export & Canvas Engine:** Native HTML5 Canvas API + `jspdf` (for PDF ticket passes) & `html2canvas`.
- **Database:** PostgreSQL 16 Native (Containerized in Docker) with JSONB column support & ACID Transactional Row Locking (`FOR UPDATE`) for Ticket Quota Safety.
- **Email Testing Server:** Mailpit (Docker container at `localhost:1025` SMTP / `localhost:8025` Web UI).

---

## 2. Core Features & Architecture Overview

### 📋 Task Execution Checklist (Daftar Tugas & Status Pengerjaan)

#### 🎨 Frontend Development (FE)
- [x] Refactor landing page components (`AudioPlayer.tsx`, `Layout.tsx`, `Modals.tsx`, `Sections.tsx`, `data.ts`, `ConcertDetailPage.tsx`)
- [x] Cleanup dead code & unused legacy components (`EventCard.astro`, `Navbar.astro`, `QuietPressHero.tsx`)
- [x] Implement **Guest Checkout System** (Form Pemesanan Instan tanpa Login: Nama, Email, Kategori Kursi)
- [x] Implement **Dedicated Ticket Redemption Portal Page (`/redeem`)** (Halaman khusus tenang & elegan untuk verifikasi kode `SYM-XXXXXX`, cetak PDF, dan QR gate pass)
- [x] Add **Quick Copy Code Button** (*"Salin Kode"* dengan feedback visual *"Tersalin!"*)
- [x] Implement **Instant E-Ticket Pass Display** (Glassmorphism Pass Card + QR Code Resmi)
- [x] Implement **High-Res PNG E-Ticket Pass Download** (HTML5 Native Canvas API Engine)
- [x] Implement **Export & Print E-Ticket PDF with Location Map Guide** (`jspdf` A4 layout with dedicated `📍 PETUNJUK LOKASI VENUE & MAPS` box)
- [x] Implement **Interactive Dark Google Maps Embed & Navigation Button** on Concert Detail Page & Admin Form
- [x] Implement **Full Admin Dashboard Portal** (`AdminApp.tsx` & `AdminLogin` Glassmorphism Overlay UI)
- [x] Implement **Admin Authentication & Login PIN** (`POST /api/v1/admin/login`)
- [x] Implement **Event Concert & Ticket Category CRUD System** (Tambah, Edit, Hapus Event & Kuota Kursi)
- [x] Implement **Dynamic Concert Rundown Builder CRUD** (Add/Edit/Delete interactive schedule items in Admin Modal)
- [x] Implement **Custom Google Maps URL Input** support in Admin Event Modal & Frontend Auto Fallback
- [x] Implement **Real-time Revenue Analytics & Breakdown** (Metrik total pendapatan, tiket terjual, sisa kuota, dan breakdown per event)
- [x] Implement **Customer Order Management & CSV Export** (Search, filter status pesanan, dan ekspor laporan CSV)
- [x] Integrate frontend with remote GitHub repository (`https://github.com/Zyrexnn/SymphoniaTic`)

#### ⚙️ Backend Development (BE)
- [x] Setup Golang Fiber v2 project structure (`main.go`, `controllers`, `database`, `models`, `services`, `.env`)
- [x] Setup PostgreSQL 16 Native Docker Container (`symphoniatic-db` at port `5432`)
- [x] Implement Database Connection Pooling & Auto-Migration (`database/database.go`)
- [x] Implement SQL DDL Schema & DML Initial Seeding (`setup.sql` with 4 official concerts, JSONB rundowns & full address metadata)
- [x] Implement **Atomic Row Locking (`SELECT ... FOR UPDATE`)** for ticket war concurrency protection
- [x] Implement **Guest Checkout Endpoint (`POST /api/v1/orders`)** with auto E-Ticket Email Delivery via Mailpit
- [x] Implement **Automated H-1 Event Reminder Email Service** (`SendEventReminderEmail` triggered on `REMINDED` order status via Mailpit)
- [x] Implement **Public Ticket Lookup Endpoint (`GET /api/v1/tickets/lookup?code=...`)**
- [x] Implement **Complete Admin API Suite** (`/api/v1/admin/login`, `/api/v1/admin/dashboard`, `/api/v1/admin/events`, `/api/v1/admin/categories`, `/api/v1/admin/orders`)
- [x] Push backend repository with conventional industry-standard commits (`https://github.com/Zyrexnn/SymphoniaTic-BE`)

---

## 3. Directory & File Structure

```text
SymphoniaTic/
├── fe/                         # Astro.js + React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/
│   │   │   │   ├── AdminApp.tsx         # Full Admin Dashboard Portal
│   │   │   │   └── EventFormModal.tsx   # Event & Dynamic Rundown Builder Modal
│   │   │   ├── landing/
│   │   │   │   ├── AudioPlayer.tsx       # Floating concert audio player
│   │   │   │   ├── ConcertDetailPage.tsx # Interactive Concert Details + Dark Maps Embed
│   │   │   │   ├── data.ts              # Concert data DTOs & API fetchers
│   │   │   │   ├── Layout.tsx            # Navigation Header & Smooth Scroll
│   │   │   │   ├── Modals.tsx            # E-Ticket PDF/PNG Export Canvas & Lookups
│   │   │   │   └── Sections.tsx          # Concert Catalog, Bento Grid & FAQ Section
│   │   │   └── SymphoniaTicApp.tsx      # Main React Application Root
│   │   ├── pages/
│   │   │   └── index.astro          # Main SSR Page
│   │   └── DESIGN.md                # Style tokens & guidelines
│   ├── astro.config.mjs
│   ├── package.json
│   └── PRD.md                       # Product Requirement Document
│
└── be/                         # Native Golang + PostgreSQL Backend
    ├── cmd/
    │   └── server/
    │       └── main.go          # Main entrypoint
    ├── controllers/
    │   └── controllers.go       # Fiber handlers (Events, Checkout, Lookup, Admin)
    ├── database/
    │   └── database.go          # Postgres connection & auto-migration
    ├── models/
    │   └── models.go            # Go Structs & API DTOs (EventItem, RundownItem, etc.)
    ├── services/
    │   └── mailer.go            # HTML E-Ticket & H-1 Reminder Email Delivery Service (Mailpit)
    ├── .env                     # Server & SMTP Environment Config
    ├── go.mod
    └── setup.sql                # Complete DDL & Real Data Seed (4 Official Concerts)
```

---

## 4. Data Models & Database Schema (PostgreSQL Native)

### 4.1 Events (`events`)
- `id` (VARCHAR(64), Primary Key)
- `title` (VARCHAR(255), Required)
- `subtitle` (VARCHAR(255))
- `artist` (VARCHAR(255), Required)
- `conductor` (VARCHAR(255))
- `venue` (VARCHAR(255), Required)
- `address` (TEXT, Full Address)
- `google_maps_url` (TEXT, Optional custom embed/search URL)
- `date` (VARCHAR(100), Required)
- `time` (VARCHAR(50), Required)
- `open_gate` (VARCHAR(50))
- `category` (VARCHAR(100), Required, Indexed)
- `category_badge_color` (VARCHAR(255))
- `image` (TEXT, Required)
- `audio_url` (TEXT)
- `organizer` (VARCHAR(255))
- `rundown` (JSONB, Structured array of `{ "time": "...", "activity": "..." }`)
- `description` (TEXT, Required)
- `created_at` (TIMESTAMP WITH TIME ZONE, Default `CURRENT_TIMESTAMP`)

### 4.2 Ticket Categories (`ticket_categories`)
- `id` (VARCHAR(64), Primary Key)
- `event_id` (VARCHAR(64), Foreign Key -> `events.id`, Indexed)
- `name` (VARCHAR(100), e.g., "VIP Pit", "CAT 1", "Festival")
- `price` (NUMERIC(12, 2), Required)
- `quota` (INT, Total venue capacity)
- `remaining_quota` (INT, Available seat quota)
- `created_at` (TIMESTAMP WITH TIME ZONE, Default `CURRENT_TIMESTAMP`)

### 4.3 Orders (`orders`)
- `id` (VARCHAR(64), Primary Key)
- `order_code` (VARCHAR(100), Unique, Indexed, e.g., `SYM-123456`)
- `event_id` (VARCHAR(64), Foreign Key -> `events.id`)
- `event_title` (VARCHAR(255))
- `artist` (VARCHAR(255))
- `venue` (VARCHAR(255))
- `date` (VARCHAR(100))
- `category_name` (VARCHAR(100))
- `quantity` (INT, Range 1 - 4 per transaction)
- `total_price` (NUMERIC(12, 2))
- `user_name` (VARCHAR(255), Customer Full Name)
- `user_email` (VARCHAR(255), Customer Email, Indexed)
- `qr_code` (VARCHAR(255), Format: `QR-SYM-[ORDER_CODE]`)
- `status` (VARCHAR(50), Default `'VERIFIED'`, values: `VERIFIED`, `REMINDED`, `CHECKED_IN`, `CANCELLED`)
- `payment_method` (VARCHAR(50), Default `'SANDBOX_PAYMENT'`)
- `created_at` (TIMESTAMP WITH TIME ZONE, Default `CURRENT_TIMESTAMP`)

---

## 5. API Specification & Endpoints (Go Backend)

### Standardized JSON Response Structure
```json
{
  "success": true,
  "message": "Operation status description",
  "data": null,
  "error": null
}
```

### Endpoints List (`http://localhost:8082/api/v1`)
- `GET /api/v1/events`
  - Action: Returns list of all active concerts with categories, remaining quotas, JSONB rundowns, and location details.
- `GET /api/v1/events/:id`
  - Action: Returns detailed info for a single concert event.
- `POST /api/v1/orders`
  - Body: `{ "eventId": "evt-1", "ticketCategoryId": "cat-1-1", "quantity": 2, "userName": "Budi Santoso", "userEmail": "budi@example.com" }`
  - Validation: Quantity must be 1 to 4; required customer details.
  - Action: Executes database transaction with row locking (`FOR UPDATE`), deducts quota, generates `orderCode`, triggers instant HTML E-Ticket email dispatch via Mailpit, and returns Order Record.
- `GET /api/v1/tickets/lookup?code=SYM-123456`
  - Action: Returns verified order details & QR Code for no-login ticket inspection.
- `POST /api/v1/admin/login`
  - Body: `{ "username": "admin", "password": "123" }`
  - Action: Verifies admin credentials and returns access session token.
- `GET /api/v1/admin/dashboard`
  - Action: Returns real-time metrics including total revenue, tickets sold, remaining seats, total events, total orders, event revenue breakdown, and 5 recent orders.
- `POST /api/v1/admin/events`
  - Body: Create event JSON payload including title, artist, venue, address, googleMapsUrl, date, time, image, description, rundown JSON array, and initial categories.
  - Action: Creates new event concert in database.
- `PUT /api/v1/admin/events/:id`
  - Action: Updates existing event details and JSONB rundown array.
- `DELETE /api/v1/admin/events/:id`
  - Action: Deletes event and associated ticket categories from database.
- `POST /api/v1/admin/events/:id/categories`
  - Action: Adds new ticket category to event.
- `PUT /api/v1/admin/categories/:id`
  - Action: Updates ticket category price and seat quota.
- `DELETE /api/v1/admin/categories/:id`
  - Action: Deletes ticket category.
- `GET /api/v1/admin/orders?search=...&status=...`
  - Action: Returns list of all customer orders with optional search and status filter.
- `PATCH /api/v1/admin/orders/:id/status`
  - Body: `{ "status": "REMINDED" }`
  - Action: Updates order status (`VERIFIED`, `REMINDED`, `CHECKED_IN`, `CANCELLED`). Triggers automated H-1 Reminder Email when status is updated to `REMINDED`.

---

## 6. Business Logic & Technical Rules

1. **Row Locking (`FOR UPDATE`)**:
   - Quota check and deduction inside `CreateOrder` MUST execute `SELECT ... FOR UPDATE` on `ticket_categories` within a database transaction block (`tx.Begin() ... tx.Commit()`).
2. **Native Canvas & PDF Export Engine**:
   - E-Ticket PNG & PDF generation MUST render graphics through `drawTicketCanvas` via HTML5 Canvas API (`800x1100 px`) to include an explicit `📍 PETUNJUK LOKASI VENUE & MAPS` box and clickable Google Maps links.
3. **Automated Mailpit Integration**:
   - Order creation and status updates (`REMINDED`) trigger background Go routines delivering rich HTML E-Tickets and H-1 Event Reminders directly to Mailpit at `localhost:1025`.
4. **Dynamic Rundown & Google Maps Fallback**:
   - Rundown items are stored as `JSONB` in PostgreSQL and managed dynamically via Admin UI. Google Maps iframe automatically builds dynamic search URLs using `Venue + Address` if a custom URL is omitted.

---

## 7. Environment Variables Configuration

### Backend (`be/.env`)
```env
PORT=8082
DB_HOST=localhost
DB_PORT=5432
DB_USER=symphoniatic
DB_PASSWORD=symphoniatic_secret
DB_NAME=symphoniatic_db
DB_SSLMODE=disable
CORS_ORIGIN=http://localhost:4321,http://localhost:3000
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_SENDER_EMAIL=noreply@symphoniatic.com
SMTP_SENDER_NAME=SymphoniaTic Ticketing
```

### Frontend (`fe/.env`)
```env
PUBLIC_API_BASE_URL=http://localhost:8082/api/v1
```
