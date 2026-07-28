# Product Requirement Document (PRD): SymphoniaTic

## 1. Project Context & Stack
**SymphoniaTic** is a high-performance classical concert ticket booking platform featuring a Go (Golang) REST API backend and an Astro.js SSR Web Application with React 19 components & Glassmorphism UI.

- **Repository Frontend (FE):** [https://github.com/Zyrexnn/SymphoniaTic](https://github.com/Zyrexnn/SymphoniaTic)
- **Repository Backend (BE):** [https://github.com/Zyrexnn/SymphoniaTic-BE](https://github.com/Zyrexnn/SymphoniaTic-BE)

### Core Stack Requirements:
- **Backend:** Go (Golang 1.25+) with Fiber v2 framework (`github.com/gofiber/fiber/v2`) & Native SQL Driver (`github.com/lib/pq`)
- **Frontend:** Astro.js 5+ (SSR Mode: `output: 'server'`) + React 19 + Tailwind CSS + Framer Motion
- **Export & Canvas Engine:** Native HTML5 Canvas API + `jspdf` (for PDF ticket passes) & `html2canvas`
- **Database:** PostgreSQL 16 Native (Containerized in Docker) with ACID Transactional Support & Row Locking (`FOR UPDATE`) for Ticket Quota Safety

---

## 2. Core Features & Architecture Overview

### 📋 Task Execution Checklist (Daftar Tugas & Status Pengerjaan)

#### 🎨 Frontend Development (FE)
- [x] Refactor landing page components (`AudioPlayer.tsx`, `Layout.tsx`, `Modals.tsx`, `Sections.tsx`, `data.ts`)
- [x] Cleanup dead code & unused legacy components (`EventCard.astro`, `Navbar.astro`, `QuietPressHero.tsx`)
- [x] Implement **Guest Checkout System** (Form Pemesanan Instan tanpa Login: Nama, Email, Kategori Kursi)
- [x] Implement **No-Login Order Code Lookup** (Drawer Cek Tiket & Invoice publik via Kode Pesanan `SYM-XXXXXX`)
- [x] Add **Quick Copy Code Button** (*"Salin Kode"* dengan feedback visual *"Tersalin!"*)
- [x] Implement **Instant E-Ticket Pass Display** (Glassmorphism Pass Card + QR Code Resmi)
- [x] Implement **High-Res PNG E-Ticket Pass Download** (HTML5 Native Canvas API Engine)
- [x] Implement **Centered A4 PDF E-Ticket Pass Download** (PDF rendering via `jspdf` & static client imports)
- [x] Implement **Full Admin Dashboard Portal** (`AdminDashboard.tsx` Glassmorphism Overlay UI)
- [x] Implement **Admin Authentication & Login PIN** (`POST /api/v1/admin/login`)
- [x] Implement **Event Concert & Ticket Category CRUD System** (Tambah, Edit, Hapus Event & Kuota Kursi)
- [x] Implement **Real-time Revenue Analytics & Breakdown** (Metrik total pendapatan, tiket terjual, sisa kuota, dan breakdown per event)
- [x] Implement **Customer Order Management & CSV Export** (Search, filter status pesanan, dan ekspor laporan CSV)
- [x] Integrate frontend with remote GitHub repository (`https://github.com/Zyrexnn/SymphoniaTic`)

#### ⚙️ Backend Development (BE)
- [x] Setup Golang Fiber v2 project structure (`main.go`, `controllers`, `database`, `models`, `.env`)
- [x] Setup PostgreSQL 16 Native Docker Container (`symphoniatic-db` at port `5432`)
- [x] Implement Database Connection Pooling & Auto-Migration (`database/database.go`)
- [x] Implement SQL DDL Schema & DML Initial Seeding (`setup.sql` & `seedInitialData()`)
- [x] Implement **Atomic Row Locking (`SELECT ... FOR UPDATE`)** for ticket war concurrency protection
- [x] Implement **Guest Checkout Endpoint (`POST /api/v1/orders`)** with auto Sandbox Payment Verification
- [x] Implement **Public Ticket Lookup Endpoint (`GET /api/v1/tickets/lookup?code=...`)**
- [x] Implement **Complete Admin API Suite** (`/api/v1/admin/login`, `/api/v1/admin/dashboard`, `/api/v1/admin/events`, `/api/v1/admin/categories`, `/api/v1/admin/orders`)
- [x] Push backend repository with conventional industry-standard commits (`https://github.com/Zyrexnn/SymphoniaTic-BE`)


#### 🟡 Phase 2: Post-MVP & Future Enhancements
- [ ] Implement automated expiration for `PENDING` orders (> 30 minutes)
- [ ] Build Live Scanner QR Code interface for gate check-in staff
- [ ] Integrate SMTP / SendGrid email notification service for automated receipt dispatch

---

## 3. Directory & File Structure

```text
SymphoniaTic/
├── fe/                         # Astro.js + React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── landing/
│   │   │   │   ├── AudioPlayer.tsx   # Floating concert audio player
│   │   │   │   ├── data.ts          # Concert data & TypeScript DTOs
│   │   │   │   ├── Layout.tsx        # Navigation Header & Hero
│   │   │   │   ├── Modals.tsx        # Booking, E-Ticket Confirmation, Lookup & Admin Drawers
│   │   │   │   └── Sections.tsx      # Concert Catalog, Lineup & FAQs
│   │   │   ├── BoomerangVideoBg.tsx # Background video component
│   │   │   └── SymphoniaTicApp.tsx  # Main React App Root
│   │   ├── layouts/
│   │   │   └── Layout.astro     # Global Astro layout template
│   │   └── pages/
│   │       └── index.astro      # Main SSR Page
│   ├── astro.config.mjs
│   ├── package.json
│   └── PRD.md
│
└── be/                         # Native Golang + PostgreSQL Backend
    ├── cmd/
    │   └── server/
    │       └── main.go          # Main entrypoint (Standard Go Layout)
    ├── controllers/
    │   └── controllers.go       # Fiber handlers (Events, Checkout, Lookup, Admin)
    ├── database/
    │   └── database.go          # Postgres connection & auto-migration
    ├── models/
    │   └── models.go            # Go Structs & API DTOs
    ├── .env                     # Database & Server environment configuration
    ├── go.mod
    └── setup.sql                # Complete PostgreSQL DDL & DML initial seed script
```

---

## 4. Data Models & Database Schema (PostgreSQL Native)

### 4.1 Events (`events`)
- `id` (VARCHAR(64), Primary Key)
- `title` (VARCHAR(255), Required)
- `artist` (VARCHAR(255), Required)
- `venue` (VARCHAR(255), Required)
- `date` (VARCHAR(100), Required)
- `time` (VARCHAR(50), Required)
- `category` (VARCHAR(100), Required, Indexed)
- `category_badge_color` (VARCHAR(255))
- `image` (TEXT, Required)
- `audio_url` (TEXT, Required)
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
- `status` (VARCHAR(50), Default `'VERIFIED'`)
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
  - Action: Returns list of all active concerts along with their ticket categories and remaining seat quotas.
- `GET /api/v1/events/:id`
  - Action: Returns detailed info for a single concert event.
- `POST /api/v1/orders`
  - Body: `{ "eventId": "evt-1", "ticketCategoryId": "cat-1-1", "quantity": 2, "userName": "Budi Santoso", "userEmail": "budi@example.com" }`
  - Validation: Quantity must be 1 to 4; required customer details.
  - Action: Executes database transaction with row locking (`FOR UPDATE`), deducts quota, generates `orderCode`, sets status to `VERIFIED`, and returns complete Order Record.
- `GET /api/v1/tickets/lookup?code=SYM-123456`
  - Query: `code` (Order Code)
  - Action: Returns verified order details & QR Code for no-login ticket inspection.
- `POST /api/v1/admin/login`
  - Body: `{ "username": "admin", "password": "123" }`
  - Action: Verifies admin credentials and returns access session token.
- `GET /api/v1/admin/dashboard`
  - Action: Returns real-time metrics including total revenue, tickets sold, remaining seats, total events, total orders, event revenue breakdown, and 5 recent orders.
- `POST /api/v1/admin/events`
  - Body: Create event JSON payload with title, artist, venue, date, time, image, description, and initial ticket categories.
  - Action: Creates new event concert in database.
- `PUT /api/v1/admin/events/:id`
  - Action: Updates existing event details.
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
  - Body: `{ "status": "CHECKED_IN" }`
  - Action: Updates order status (`VERIFIED`, `CHECKED_IN`, `CANCELLED`).


---

## 6. Business Logic & Technical Rules

1. **Row Locking (`FOR UPDATE`)**:
   - Quota check and deduction inside `CreateOrder` MUST execute `SELECT ... FOR UPDATE` on `ticket_categories` within a database transaction block (`tx.Begin() ... tx.Commit()`).
2. **Native Canvas Render Safety**:
   - E-Ticket PNG/PDF generation MUST render graphics through `drawTicketCanvas` via HTML5 Canvas API to avoid cross-origin CORS or DOM styling truncation errors.
3. **No-Login Ticket Lookup**:
   - Order lookup exclusively relies on the unique `orderCode` for simple, fast access.

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
```

### Frontend (`fe/.env`)
```env
PUBLIC_API_BASE_URL=http://localhost:8082/api/v1
```
