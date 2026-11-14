# SymphoniaTic — Design System & Visual Specification
> Dark Monochrome Atelier — a refined, comfortable, and unified black-and-white classical concert ticketing system where pure white typography and high-contrast photography illuminate a serene darkroom canvas.

**Theme:** Dark Monochrome (Hitam Putih Konsisten)  
**Tone:** Dignified, architectural, high-legibility, comfortable for the eyes (no blinding glare).  
**Chromatic Rule:** Photography is the sole chromatic content. All interface surfaces, buttons, borders, and typography follow strict monochrome discipline.

---

## 1. Core Principles (Hitam Putih Konsisten)

1. **Restraint & Dignity**:
   - Zero color chaos: No random gold, no navy, no purple, no coral/terracotta.
   - All pages (`/`, `/events`, `/concert/[id]`, `/redeem`, `/refund`, `/admin`, `/login`, `/register`, `/dashboard`) share the exact same dark canvas (`#0C0D12`) and card surface (`#14161F`).
2. **Clear Affordance & User Friendliness (antislop-ui)**:
   - **Primary Action (CTA)**: High-contrast Solid White (`bg-white text-black hover:bg-neutral-200 font-medium rounded-lg`). It gives users immediate, effortless visual hierarchy ("Click here to reserve").
   - **Secondary Action**: Subtle Outline (`bg-transparent border border-white/20 text-white hover:bg-white/10 rounded-lg`).
   - **Active State**: Solid white bottom border (`border-b-2 border-white`) replacing colored underlines.
3. **Ergonomic Hierarchy & Comfort**:
   - Contrast ratio strictly meets WCAG AAA for body text (Chalk White `#FFFFFF` on `#0C0D12`).
   - Secondary labels and metadata use Silver Ash (`#A1A1AA`) to prevent visual fatigue.
   - Borders are subtle and precise (`#272A38`) to frame content without visual noise.

---

## 2. Tokens — Colors & Surfaces

| Token | Hex Value | Name | Semantic Role |
| :--- | :--- | :--- | :--- |
| `--color-canvas` | `#0C0D12` | Acoustic Night | Main canvas background across all pages |
| `--color-surface` | `#14161F` | Darkroom Surface | Cards, containers, modals, table rows |
| `--color-surface-raised` | `#1D202D` | Elevated Surface | Dropdowns, hover states, input backgrounds |
| `--color-border` | `#272A38` | Subtle Border | Structural dividers and card outlines |
| `--color-text-primary` | `#FFFFFF` | Chalk White | Primary titles, headlines, active tabs, buttons |
| `--color-text-secondary` | `#A1A1AA` | Silver Ash | Metadata, dates, venues, category descriptions |
| `--color-text-tertiary` | `#71717A` | Slate Muted | Inactive labels, table headers, placeholders |

### Interactive Actions
- **Primary Action:** `bg-white text-black hover:bg-neutral-200` (`rounded-lg`)
- **Secondary Action:** `border border-white/20 text-white hover:bg-white/10` (`rounded-lg`)
- **Focus Ring:** `ring-2 ring-white ring-offset-2 ring-offset-[#0C0D12]`

### Status & Seat Matrix (Monochrome)
- **Available Seat / Quota:** `#272A38` border with white text on hover.
- **Selected Seat:** Solid White `#FFFFFF` with black text `#0C0D12`.
- **Sold Out / Disabled:** `#181920` with muted gray text `#71717A` and `cursor-not-allowed`.
- **Status Confirmed / Valid:** Crisp white badge with checkmark (`bg-white/10 text-white border border-white/20`).

---

## 3. Shape & Spacing Standards

- **Buttons & Inputs:** `8px` (`rounded-lg`)
- **Cards & Venue Panels:** `12px` (`rounded-xl`)
- **Modals & Drawers:** `16px` (`rounded-2xl`)
- **Touch Target:** Minimum 44x44px for touch elements on mobile.
