# AGENTS.md: Frontend (Astro v7 SSR + React 19 + Tailwind CSS)

> Operational instructions for AI coding agents working on the SymphoniaTic frontend web application.

---

## 1. Stack & Tooling

- **Framework**: Astro v7 with SSR mode (`output: 'server'`, adapter: `@astrojs/node` standalone)
- **UI Components**: React 19 (`@astrojs/react`)
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite`)
- **Icons**: Lucide React (`lucide-react`)
- **Animations**: Framer Motion and GSAP
- **E-Ticket Engine**: HTML5 Canvas API, `jspdf` (PDF generation), `html2canvas`, `qrcode.react`
- **QR Scanner**: `html5-qrcode`

---

## 2. Setup & Development Commands

```bash
# Install dependencies
npm install

# Run local development server (http://localhost:4321)
npm run dev

# Compile and verify production SSR build
npm run build

# Preview production build locally
npm run preview
```

---

## 3. Directory Layout & Boundaries

```text
fe/
├── src/
│   ├── pages/                   # Astro SSR route pages
│   │   ├── index.astro          # Landing page and concert catalog
│   │   ├── concerts/[id].astro  # Concert details, seat tiers, and rundown
│   │   ├── redeem.astro         # Public ticket lookup and pass printing
│   │   ├── refund.astro         # Public refund submission and OTP verification
│   │   ├── admin.astro          # Admin dashboard and management portal
│   │   └── auth/                # Customer login, registration, password reset
│   ├── components/
│   │   ├── landing/             # Catalog, hero, checkout modals, and data.ts
│   │   ├── admin/               # Admin tables, event CRUD modals, metrics
│   │   ├── refund/              # Refund form, OTP modal, status checker
│   │   └── ui/                  # Shared primitives (buttons, dialogs, badges)
│   ├── layouts/                 # Base HTML layout, metadata, audio player
│   └── styles/                  # Global CSS and Tailwind definitions
├── public/                      # Static assets, fonts, audio samples
├── dist/                        # Auto-generated SSR build output (DO NOT EDIT)
├── DESIGN.md                    # Visual guidelines and design tokens
└── PRD.md                       # Product requirement documentation
```

---

## 4. Coding Standards & Mandatory Rules

### A. Centralized API Resolution
- Always resolve API URLs through `getApiBaseUrl()` defined in `src/components/landing/data.ts`:
  ```typescript
  import { getApiBaseUrl } from '@/components/landing/data';
  
  const res = await fetch(`${getApiBaseUrl()}/events`);
  ```
- **Fallback behavior**: `getApiBaseUrl()` reads `import.meta.env.PUBLIC_API_BASE_URL` first, checks `window.PUBLIC_API_BASE_URL`, and defaults to `http://localhost:8082/api/v1`.

### B. Astro Islands & Client Directives
- Interactive React components mounted in Astro pages (`.astro`) must declare client directives:
  - `client:load` for immediate interactivity (checkout modals, navigation).
  - `client:visible` for components below the fold.
  - `client:only="react"` for components requiring browser-only APIs (Canvas, jsPDF, Web Audio).

### C. UI / Visual Aesthetics
- **Theme**: Premium classical concert hall aesthetic. Deep dark background (`#0c0d12`), soft gold / bronze / indigo accents, and subtle glassmorphism (`backdrop-blur-md bg-white/[0.03] border border-white/10`).
- Adhere to `DESIGN.md` guidelines. Avoid generic or flat templates.

### D. E-Ticket & Pass Generation
- E-Ticket passes must render cleanly on mobile viewports and support dual export options:
  1. High-resolution PNG via HTML5 Canvas.
  2. Printable A4 PDF via `jspdf` including venue location map notes.

---

## 5. Anti-Slop Discipline for Frontend (`antislop`)

Follow these strict rules to eliminate generic AI frontend slop:

### A. Visual & UI Craftsmanship (`antislop-ui`)
- **Glassmorphism Dose Cap (R-10)**: Maximum 1 to 2 elements using `backdrop-blur` (for example, floating navbar or modal overlay). FORBIDDEN: coating every card, sidebar, and hero section in frosted blur that flattens contrast.
- **Colors & Gradients (R-01)**: FORBIDDEN: generic AI gradients (blue-to-purple, cyan-to-pink). Use the SymphoniaTic palette from `DESIGN.md` (dark charcoal `#0c0d12`, amber gold, brass, and royal indigo).
- **Border Radii (R-11)**: FORBIDDEN: making every button, card, and input pill-shaped. Use a consistent scale (`rounded-xl` for cards, `rounded-lg` for buttons).
- **Glow & Shadow (R-12, R-13)**: Glow is strictly an attention accent for at most 1 to 2 key elements (such as primary checkout button or playing audio state). Avoid overly soft shadows that make the page float without a ground plane.
- **Functional Completeness (R-26, C-2)**: FORBIDDEN: dead controls or ghost links that do nothing. Every button must trigger navigation, open a dialog, or provide clear validation feedback.

### B. Copywriting & Content Integrity (`antislop-copywriting`)
- **No AI Buzzwords**: FORBIDDEN: generic marketing buzzwords (*"seamless"*, *"elevate your experience"*, *"revolutionary"*, *"next-level"*). Use dignified, human copy matching classical symphonies (*"Concert Ticket Reservation"*, *"Seating Plan Guide"*).
- **No Fabricated Claims (R-17, R-18, R-36)**: FORBIDDEN: invented statistics (*"10k+ happy users"*, *"99.9% satisfaction"*) or fictional testimonials with random AI avatars.
- **Natural Punctuation (R-02)**: FORBIDDEN: em dash characters (`—`) in interface copy. Use commas, periods, colons, or parentheses instead.

### C. Accessibility & State Resilience (`antislop-human`)
- **Three Mandatory States (R-27)**: Every component displaying data must handle:
  1. **Loading State**: Subtle skeleton loader or spinner during fetch.
  2. **Empty State**: Dignified empty presentation when no data or tickets are available.
  3. **Error State**: User-friendly Indonesian error message if API fails, with a retry button.
- **Contrast & Keyboard Accessibility (R-25, R-32)**:
  - Text contrast must meet minimum 4.5:1 against dark backgrounds.
  - Complete keyboard navigation (`Tab`, `Shift+Tab`, `Enter`). Modals must close on `Escape`.
  - Never remove focus outline without providing a visible custom focus ring (`focus-visible:ring-2`).

### D. Mobile Layouts (`antislop-layoutmobile`)
- Minimum tap target of 44x44px for touch elements (R-03).
- Zero horizontal overflow on mobile viewports down to 375px.

### E. Code Comment Hygiene (`antislop-code`)
- FORBIDDEN: ASCII banner dividers, decorative comment lines (`// ========`), decorative emojis (`// 🚀`), or step-by-step narration in React/Astro code. Comments should explain technical reasons (**WHY**) or browser quirks.

---

## 6. Guardrails (Never-Do List)

- **NEVER** hardcode `http://localhost:8082` directly inside component JSX/TSX. Always use `getApiBaseUrl()`.
- **NEVER** import server-only packages (like Node `fs` or database drivers) into client React components.
- **NEVER** edit files inside `dist/` directly. They are rebuilt on `npm run build`.
- **NEVER** install conflicting UI or CSS frameworks (stick with Tailwind CSS v4).
- **NEVER** commit `.env` or `.env.production` files.

---

## 7. Verification & Definition of Done

Before declaring any frontend task complete:

1. **Verify Production Build**:
   ```bash
   npm run build
   ```
   *Must build cleanly without TypeScript errors, missing asset references, or unresolved import paths.*

2. **Verify Client Responsiveness**:
   - Ensure layouts do not cause horizontal scrolling on mobile viewports (minimum 375px width).
   - Ensure interactive modals and forms handle loading, success, and error states gracefully.
