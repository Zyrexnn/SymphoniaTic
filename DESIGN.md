# SymphoniaTic: Design System & Visual Specification

> **Swiss Editorial Brutalist Event Zine**: A high-contrast architectural classical concert ticketing system pairing dark stage charcoal (`#141413`) with warm newsprint paper (`#F4F3EF`), crisp white (`#FFFFFF`), visible `1px` Swiss hairline gridlines (`#DFDDD6`), tight-tracked Neo-Grotesque typography, and Electric Acid Lime (`#D4FF2A`) reserved strictly for focal actions, featured ticket tiers, and editorial highlights.

**Theme:** Swiss Editorial Brutalist (Stage Charcoal + Warm Newsprint + Electric Acid Lime)
**Antislop Dials:** `ENERGY 3` (Bold) / `RHYTHM 3` (Asymmetric, mixed compositions) / `MOTION 1` (Crisp hover inversions, zero floaty slop)
**Chromatic Rule:** Stage photography carries warmth and atmosphere; interface chrome stays stark in `#141413`, `#F4F3EF`, `#FFFFFF`, and `1px` `#DFDDD6` rules. `#D4FF2A` is deployed sparingly for maximum contrast and focal hierarchy, **always paired with `#141413` ink**.

---

## 1. Core Principles

1. **Stage Charcoal vs. Warm Newsprint Rhythm:**
   - **Stage Surfaces (`#141413`)** anchor full-bleed hero headers, dark ensemble spotlights (*Di Atas Panggung*), and primary solid buttons.
   - **Newsprint Canvas (`#F4F3EF`)** serves as the primary reading surface across all routes (`/`, `/events`, `/concert/[id]`, `/edukasi`, `/redeem`, `/ticket/[code]`, `/refund`, `/login`, `/register`, `/dashboard`, `/admin`).
2. **Acid Lime Contrast Discipline (WCAG AA):**
   - **Electric Acid Lime (`#D4FF2A`, hover `#C2EE1A`)** is the single chromatic accent: used for featured ticket tier cards, primary hero/checkout CTAs, inline editorial word highlights, active indicators, and the full-bleed brand footer.
   - **Mandatory Contrast Lock:** Any text, icon, or label placed on `#D4FF2A` **MUST** use Stage Charcoal (`#141413`). Never place white text on `#D4FF2A`, and never use `#D4FF2A` as small body text on `#F4F3EF` or `#FFFFFF`.
3. **Sharp Geometry & Swiss Hairline Grids:**
   - Default corner radius is `0px` (`rounded-none`) across cards, buttons, inputs, badges, tabs, and modals.
   - Featured media thumbnails and spotlight cards use a 45-degree chamfered corner motif (`.chamfer-br` or `.chamfer-tr` via CSS `clip-path`).
   - Adjacent cards and grids lock together with `1px` `#DFDDD6` hairline dividers (`gap-px bg-[#DFDDD6]` or `border-x border-[#DFDDD6]`) rather than floating drop shadows.
4. **Asymmetric Offset Hierarchy:**
   - Major sections use a 12-column split: left 4 columns carry a micro-eyebrow with bullet marker (`• PILIH TIKET`, `• RANGKAIAN ACARA`), while the right 8 columns present the bold, tight-tracked display headline.

---

## 2. Color & Surface Tokens

| Token | Hex Value | Name | Semantic Role |
| :--- | :--- | :--- | :--- |
| `--color-stage` | `#141413` | Stage Charcoal | Hero canvas, dark spotlight bands, solid dark CTAs, ink on Acid Lime |
| `--color-canvas` | `#F4F3EF` | Warm Newsprint | Primary page canvas across catalog, concert detail, and portals |
| `--color-surface` | `#FFFFFF` | Crisp White | Standard cards, inputs, e-ticket QR pass, data tables |
| `--color-surface-muted` | `#EAE8E1` | Muted Paper | Subtle hover fills, disabled/sold-out states, secondary chips |
| `--color-border` | `#DFDDD6` | Swiss Hairline | Default `1px` structural gridlines, card outlines, table rows |
| `--color-border-strong` | `#141413` | Ink Rule | High-contrast active borders, focus outlines, structural dividers |
| `--color-ink-primary` | `#141413` | Primary Ink | Headlines, primary body copy, ink on `#D4FF2A` |
| `--color-ink-secondary` | `#52514D` | Secondary Ink | Dates, venue metadata, supporting descriptions (>= 4.5:1 on `#F4F3EF`) |
| `--color-ink-tertiary` | `#6E6D68` | Tertiary Ink | Helper hints, table captions, input placeholders (>= 4.5:1 on `#FFFFFF`) |
| `--color-accent` | `#D4FF2A` | Electric Acid Lime | Featured ticket tier fill, hero CTA, editorial highlight, footer canvas |
| `--color-accent-hover` | `#C2EE1A` | Deep Acid Lime | Hover and active press state for Acid Lime surfaces/buttons |
| `--color-status-success` | `#156E3F` | Forest Confirm | Validated e-tickets, confirmed orders |
| `--color-status-warning` | `#8A5A00` | Ochre Pending | Pending verification, low-quota alerts |
| `--color-status-danger` | `#C81E1E` | Crimson Alert | Validation errors, sold-out alerts, refund rejections |

### Dark Mode Tokens (`.dark` for Admin Workspace)
- `--background`: `#141413`, `--foreground`: `#F4F3EF`
- `--card`: `#1C1C1A`, `--popover`: `#222220`, `--sidebar`: `#181816`
- `--primary`: `#D4FF2A`, `--primary-foreground`: `#141413`
- `--secondary`: `#262624`, `--muted-foreground`: `#B8B6AE`
- `--border`: `#2E2E2B`, `--border-strong`: `#52514D`, `--ring`: `#D4FF2A`

### Interactive Actions
- **Dark Solid Action (Primary Default):** `bg-[#141413] text-[#F4F3EF] hover:bg-[#2A2A28] font-semibold rounded-none`
- **Acid Lime Action (Hero / Featured Tier CTA):** `bg-[#D4FF2A] text-[#141413] hover:bg-[#C2EE1A] font-semibold rounded-none`
- **Outline Action:** `bg-transparent border border-[#141413] text-[#141413] hover:bg-[#141413] hover:text-[#F4F3EF] rounded-none`
- **Ghost Action:** `text-[#52514D] hover:text-[#141413] hover:bg-[#EAE8E1] rounded-none`
- **Focus Ring:** `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#141413] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F4F3EF]` (use `focus-visible:ring-[#D4FF2A] ring-offset-[#141413]` on dark stage bands)

### Seat Matrix & Ticket States
- **Available Seat / Tier:** `bg-[#FFFFFF] border border-[#DFDDD6] text-[#141413] hover:border-[#141413]`
- **Featured / Selected Seat / Tier:** `bg-[#D4FF2A] text-[#141413] border border-[#141413]` (or `bg-[#141413] text-[#D4FF2A]` for selected matrix cells)
- **Sold Out / Unavailable:** `bg-[#EAE8E1] text-[#6E6D68] border border-[#DFDDD6] cursor-not-allowed`
- **Confirmed E-Ticket:** `bg-[#156E3F]/10 text-[#156E3F] border border-[#156E3F]/30`

---

## 3. Typography

Replace classical serifs with bold, tight-tracked Neo-Grotesque display typography paired with crisp technical sans-serif UI text.

- **Display Font (`--font-display`):** `'Archivo', 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif`
  - Used for hero titles, concert names, section headers, and the oversized footer wordmark.
  - Weights: `700` (Bold) and `800` (ExtraBold), tight tracking (`-0.04em` to `-0.03em`), tight line-height `0.95` to `1.05`, sentence case.
- **UI & Body Font (`--font-sans`):** `'Plus Jakarta Sans', 'Inter', ui-sans-serif, system-ui, sans-serif`
  - Used for navigation, body copy, form controls, prices, timetables, and admin tables.
  - Apply `tabular-nums` on all prices (`Rp`), concert times (`19:30 WIB`), seat counts, and ticket codes.
- **Monospace (`--font-mono`):** `'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace`
  - Used strictly for booking references, QR ticket codes, and verification tokens.

---

## 4. Layout Patterns & Rhythm

1. **Dark Hero Stage (`/` & `/concert/[id]`):**
   - Full-bleed `#141413` stage visual with directional dark gradient scrim for text legibility.
   - Minimal sharp top navigation bar (`SymphoniaTic.` left, centered navigation links, search & account controls right).
   - Top-right metadata block + `#D4FF2A` CTA button (`#141413` ink); bottom-left oversized tight-tracked display `h1`.
2. **Flush Ticket Tier Matrix (`Pick your way in` on `/concert/[id]`):**
   - 3-column flush grid (`gap-px bg-[#DFDDD6] border border-[#DFDDD6]`) pairing standard `#FFFFFF` cards, dark photo-backed tiers, and a highlighted `#D4FF2A` card (`#141413` ink, bold `tabular-nums` price, `- / +` stepper, full-width dark CTA).
3. **Editorial Split & Dark Spotlight Band:**
   - Newsprint synopsis split with `#D4FF2A` inline highlight span on key phrase, alternating into a full-bleed `#141413` *Di Atas Panggung* section with `1px` `border-white/15` role lines.
4. **Hairline Timetable & Venue Logistics:**
   - `1px` horizontal ruled schedule (`19:00` | `Pintu Dibuka` | `Registrasi & Bar`) followed by monochrome/high-contrast venue split and 2x2 *Sebelum Anda Datang* practical grid.
5. **Full-Bleed Acid Lime Footer (`#D4FF2A`):**
   - Top band: `• CEK CEPAT E-TICKET` quick ticket lookup input (`#FFFFFF` fill, `1px` `#141413` border) + `#141413` submit button.
   - Middle band: 4-column link directory divided by `border-[#141413]/20` hairlines.
   - Bottom band: Edge-to-edge oversized `SymphoniaTic.` display wordmark (`tracking-[-0.05em] leading-[0.82]`) clipped cleanly inside `overflow-x-clip`.
6. **Physical Swiss E-Ticket Pass (`/redeem`, `/ticket/[code]`):**
   - Crisp `#FFFFFF` pass on `#F4F3EF` with `#141413` header bar, `#D4FF2A` tier/date badge (`#141413` ink), hairline dividers, and pure `#141413` QR block on `#FFFFFF` quiet zone.

---

## 5. Shape, Spacing & Guardrails

- **Border Radius Scale:**
  - Buttons, inputs, badges, seat chips, cards, panels, modals, and drawers: `0px` (`rounded-none`).
  - Chamfered Accent Motif: `.chamfer-br` / `.chamfer-tr` (`14px` 45-degree corner cut) on featured photo containers and spotlight cards.
- **Touch Targets:** Minimum `44x44px` for all interactive buttons, links, and form controls on mobile.
- **Glassmorphism Cap:** Maximum 1 element (overlay navigation over hero photography) may use subtle `backdrop-blur-sm`; all content cards, modals, and sidebars remain opaque and solid.
- **Copywriting & Punctuation:** Zero em dashes (`—`) in UI text; no generic AI marketing buzzwords.
- **Responsive Integrity:** Zero horizontal overflow down to `375px` viewport width.
