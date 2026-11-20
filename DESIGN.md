# SymphoniaTic: Design System & Visual Specification

> **Concert Hall & Warm Playbill**: An editorial classical concert ticketing system pairing atmospheric dark stage photography (`#11100E`) with a warm ivory reading canvas (`#F6F4EE`) and a single deliberate vermilion accent (`#C93018`).

**Theme:** Hybrid Stage-to-Paper (Dark Stage Hero + Warm Ivory Content & Ticketing)
**Tone:** Dignified, architectural, editorial, high-legibility.
**Chromatic Rule:** Photography and stage imagery carry visual richness. Interface surfaces stay restrained in warm ivory, crisp paper, and charcoal ink, with Stage Vermilion reserved strictly for focal actions and date anchors.

---

## 1. Core Principles

1. **Stage-to-Paper Contrast:**
   - **Stage Surfaces (`#11100E`)** are reserved for full-bleed hero banners, video/orchestra headers, and dark editorial interludes.
   - **Playbill Canvas (`#F6F4EE`)** is the primary reading and transaction background across all pages (`/`, `/events`, `/concert/[id]`, `/redeem`, `/ticket/[code]`, `/refund`, `/login`, `/register`, `/dashboard`, `/admin`).
2. **Restrained Accent Discipline:**
   - **Stage Vermilion (`#C93018`)** is the single chromatic accent. Use it only for Primary CTAs, featured date ribbons/tags, and active navigation or step indicators.
   - Never flood backgrounds, borders, or secondary cards with vermilion.
3. **Architectural Borders Over Shadows:**
   - Cards, seat-tier panels, and form containers sit flat on the canvas with crisp `1px` `#E4DFD3` borders rather than heavy drop shadows.
   - Reserve elevation shadows solely for floating modals, drawers, and sticky navigation bars.
4. **Accessible Contrast & Ergonomics:**
   - Body copy uses Charcoal Ink (`#171614`) on Warm Ivory (`#F6F4EE`) or Crisp Paper (`#FFFFFF`).
   - Primary CTA buttons (`#FFFFFF` text on `#C93018`) and secondary metadata (`#5C5850` on `#F6F4EE`) meet WCAG AA (4.5:1 minimum) contrast.

---

## 2. Color & Surface Tokens

| Token | Hex Value | Name | Semantic Role |
| :--- | :--- | :--- | :--- |
| `--color-stage` | `#11100E` | Concert Hall Stage | Full-bleed hero background, dark scrims, stage interludes |
| `--color-canvas` | `#F6F4EE` | Warm Ivory | Main page background across catalog, detail, checkout, and portals |
| `--color-surface` | `#FFFFFF` | Crisp Paper | Concert cards, order summaries, e-ticket passes, data tables |
| `--color-surface-muted` | `#ECE8DF` | Parchment Tint | Alternating sections, disabled/sold-out states, subtle input fills |
| `--color-border` | `#E4DFD3` | Warm Stone | Default `1px` card outlines and structural dividers |
| `--color-border-strong` | `#CFC9BC` | Etched Stone | Input borders, interactive outlines, hover borders |
| `--color-ink-primary` | `#171614` | Charcoal Ink | Headlines, primary body text, high-contrast dark buttons |
| `--color-ink-secondary` | `#5C5850` | Warm Slate | Dates, venue metadata, supporting descriptions |
| `--color-ink-tertiary` | `#6B665D` | Muted Graphite | Helper hints, table headers, input placeholders |
| `--color-accent` | `#C93018` | Stage Vermilion | Primary CTAs, featured date ribbons, active step/tab markers |
| `--color-accent-hover` | `#A82511` | Deep Vermilion | Hover and active press state for Primary CTAs |
| `--color-status-success` | `#1F6E43` | Forest Confirm | Validated e-tickets, confirmed payments |
| `--color-status-warning` | `#855A0E` | Ochre Pending | Pending payment or verification states |
| `--color-status-danger` | `#B91C1C` | Crimson Alert | Validation errors, failed actions, cancellation notices |

### Interactive Actions
- **Primary Action (CTA):** `bg-[#C93018] text-white hover:bg-[#A82511] font-medium rounded-lg`
- **Dark Solid Action (Secondary High-Contrast):** `bg-[#171614] text-[#F6F4EE] hover:bg-[#2C2A26] font-medium rounded-lg`
- **Outline Action:** `bg-transparent border border-[#CFC9BC] text-[#171614] hover:border-[#171614] hover:bg-[#ECE8DF]/50 rounded-lg`
- **Ghost Action:** `text-[#5C5850] hover:text-[#171614] hover:bg-[#ECE8DF]/60 rounded-lg`
- **Focus Ring:** `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C93018] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F6F4EE]` (use `ring-offset-[#11100E]` on dark stage sections)

### Seat Matrix & Ticket States
- **Available Seat / Tier:** `bg-[#FFFFFF] border border-[#CFC9BC] text-[#171614] hover:border-[#171614]`
- **Selected Seat / Tier:** `bg-[#171614] text-white border border-[#171614]` (with `#C93018` selection badge/dot)
- **Sold Out / Unavailable:** `bg-[#ECE8DF] text-[#6B665D] border border-[#E4DFD3] cursor-not-allowed`
- **Confirmed E-Ticket:** `bg-[#1F6E43]/10 text-[#1F6E43] border border-[#1F6E43]/25`

---

## 3. Typography

Pair an editorial serif display face with a clean geometric sans-serif for transactional clarity.

- **Display Font (`--font-display`):** `'Cormorant Garamond', Georgia, serif`
  - Used for hero titles, concert names, composer spotlights, and section headings.
  - Weights: `500` (Medium) and `600` (SemiBold), tight tracking (`-0.02em`), line-height `1.08` to `1.15`.
- **UI & Body Font (`--font-sans`):** `'Plus Jakarta Sans', 'Inter', ui-sans-serif, system-ui, sans-serif`
  - Used for navigation, body copy, form controls, pricing, dates, and admin tables.
  - Apply `tabular-nums` on all prices (`Rp`), concert times (`19:30 WIB`), seat counts, and ticket codes.
- **Monospace (`--font-mono`):** `ui-monospace, SFMono-Regular, Menlo, monospace`
  - Used strictly for booking references, QR ticket codes, and verification tokens.

---

## 4. Layout Patterns & Rhythm

1. **Hero Stage Banner (`/`):**
   - Full-bleed concert hall or orchestra photography over `#11100E` with a directional dark scrim for legibility.
   - Minimal top navigation bar over the hero; transitions cleanly to `#F6F4EE` with `#E4DFD3` bottom border on scroll or inner pages.
   - Top-right **Featured Date Anchor** styled as a sharp `#C93018` geometric tag/ribbon displaying the upcoming concert date.
   - Lower-left editorial headline in `--font-display` with concise venue and time metadata.
2. **Editorial Split Section (Program Notes & Concert Detail):**
   - Two-column asymmetric layout on `#F6F4EE`: left column holds sticky serif title, venue, and organizer attribution; right column holds uppercase `#C93018` date label and generous readable body copy.
3. **Concert Catalog Grid (`/`, `/events`):**
   - Clean 3-column grid on desktop (`1` column mobile, `2` columns tablet) with `#FFFFFF` cards and `1px` `#E4DFD3` borders.
   - Poster imagery in `4:5` or `3:4` aspect ratio, followed by concise serif title, date/time (`tabular-nums`), venue, starting price, and clear action link.
   - Zero glassmorphism overlays or decorative glow on catalog cards.
4. **Physical Playbill E-Ticket (`/redeem`, `/ticket/[code]`):**
   - Styled as a printable crisp white pass (`#FFFFFF`) on `#F6F4EE` with hairline dividers, clear QR block, and serif event header.

---

## 5. Shape, Spacing & Guardrails

- **Border Radius Scale:**
  - Buttons, inputs, and seat chips: `8px` (`rounded-lg`)
  - Concert cards and info panels: `12px` (`rounded-xl`)
  - Modals and drawers: `16px` (`rounded-2xl`)
  - Date ribbons / editorial tags: `4px` (`rounded`) or sharp `0px`
- **Touch Targets:** Minimum `44x44px` for all interactive buttons, links, and form controls on mobile.
- **Glassmorphism Cap:** Maximum 1 element (sticky navbar over hero photography) may use `backdrop-blur-md`; all content cards, modals, and sidebars remain solid.
- **Responsive Integrity:** Zero horizontal overflow down to `375px` viewport width.
