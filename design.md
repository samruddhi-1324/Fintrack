---
name: Obsidian Kinetic Finance
colors:
  surface: '#0f131d'
  surface-dim: '#0f131d'
  surface-bright: '#353944'
  surface-container-lowest: '#0a0e18'
  surface-container-low: '#171b26'
  surface-container: '#1c1f2a'
  surface-container-high: '#262a35'
  surface-container-highest: '#313540'
  on-surface: '#dfe2f1'
  on-surface-variant: '#c7c4d7'
  inverse-surface: '#dfe2f1'
  inverse-on-surface: '#2c303b'
  outline: '#908fa0'
  outline-variant: '#464554'
  surface-tint: '#c0c1ff'
  primary: '#c0c1ff'
  on-primary: '#1000a9'
  primary-container: '#8083ff'
  on-primary-container: '#0d0096'
  inverse-primary: '#494bd6'
  secondary: '#4edea3'
  on-secondary: '#003824'
  secondary-container: '#00a572'
  on-secondary-container: '#00311f'
  tertiary: '#ffb2b7'
  on-tertiary: '#67001b'
  tertiary-container: '#ff516a'
  on-tertiary-container: '#5b0017'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e1e0ff'
  primary-fixed-dim: '#c0c1ff'
  on-primary-fixed: '#07006c'
  on-primary-fixed-variant: '#2f2ebe'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffdadb'
  tertiary-fixed-dim: '#ffb2b7'
  on-tertiary-fixed: '#40000d'
  on-tertiary-fixed-variant: '#92002a'
  background: '#0f131d'
  on-background: '#dfe2f1'
  surface-variant: '#313540'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: 0em
  title-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 22px
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-lg:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-md:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
  financial-mono:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: -0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  space-2xs: 0.25rem
  space-xs: 0.5rem
  space-sm: 0.75rem
  space-md: 1rem
  space-lg: 1.25rem
  space-xl: 1.5rem
  space-2xl: 2rem
  space-3xl: 3rem
  margin-mobile: 1rem
  margin-tablet: 1.5rem
  gutter-default: 1rem
---

# FinTrack — Design System Specification

## 1. Brand & Style Identity

This design system establishes a high-performance neo-banking aesthetic tailored for modern wealth monitoring and tactical expense management. The interface merges the technical rigor of institutional trading terminals with the fluid warmth of consumer-grade mobile ergonomics.

### Emotional Demeanor
- **Tactile Security**: Surfaces evoke obsidian stone and precision-etched architectural glass, projecting bedrock fiscal permanence.
- **Electric Precision**: Vivid primary accents punctuate neutral dark space, transforming numerical data into clear visual hierarchies.
- **Effortless Mastery**: Micro-interactions are frictionless and confident, offering low cognitive strain during split-second logging and monthly budgeting.

### Visual Dialect
The visual vocabulary combines frosted glassmorphic containers with structural dark minimalism. Frosted overlays separate dense transaction datasets from baseline canvas planes, using luminous sub-surface color bleeds rather than harsh dividers to demarcate interface zones.

---

## 2. Color Palette & Theming

The palette operates on a base of layered obsidian and graphite sheets, engineered to eliminate OLED backlight glare while maximizing chromatic legibility.

### Core Roles
| Token / Role | Hex Code | Purpose & Semantic Application |
|---|---|---|
| **Primary** | `#6366F1` / `#C0C1FF` | Electric Indigo: Primary CTA, active navigation, focus indicators, selection anchors |
| **Secondary** | `#10B981` / `#4EDEA3` | Neon Emerald: Inflows, positive yields, savings targets reached, surplus |
| **Tertiary / Warning** | `#F43F5E` / `#FFB2B7` | Crimson Coral: Outflows, expense alerts, budget overruns, destructive actions |
| **Neutral Canvas** | `#0B0F19` / `#0F131D` | Deep Obsidian baseline canvas |
| **Surface Tier 1** | `#111827` / `#171B26` | Card body foundation & container lows |
| **Surface Tier 2** | `#1C1F2A` / `#262A35` | Elevated surfaces, ledger containers |
| **Surface Tier 3** | `#313540` / `#353944` | High elevation, hover highlights, active tracks |
| **Outline** | `#908FA0` / `#464554` | Refraction borders, separators, subtle dividers |
| **Text Primary** | `#F8FAFC` / `#DFE2F1` | High contrast text, numbers, primary headings (98% luminance) |
| **Text Secondary** | `#94A3B8` / `#C7C4D7` | Labels, subtitles, secondary context |
| **Text Muted** | `#475569` | Disabled text, placeholders |

---

## 3. Typography Hierarchy

The typographic pairing balances character and utility. **Plus Jakarta Sans** handles titles, display metrics, and hero summaries, introducing sculpted geometry that offsets visual fatigue. **Inter** manages continuous data, micro-copy, logs, and monetary lists, providing balanced tabular numbers.

### Font Families
- **Headline / Display**: `Plus Jakarta Sans`, sans-serif
- **Body / Interface**: `Inter`, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif
- **Monospace / Financial**: `Inter` with `font-variant-numeric: tabular-nums`

### Typography Scale
| Token | Font Family | Size | Weight | Line Height | Tracking | Application |
|---|---|---|---|---|---|---|
| `display-lg` | Plus Jakarta Sans | 40px | 700 (Bold) | 48px | -0.02em | Hero balance figures, display metrics |
| `display-lg-mobile` | Plus Jakarta Sans | 32px | 700 (Bold) | 40px | -0.02em | Hero balance (mobile viewports) |
| `headline-lg` | Plus Jakarta Sans | 28px | 600 (SemiBold) | 36px | -0.015em | Screen titles, primary section headers |
| `headline-md` | Plus Jakarta Sans | 22px | 600 (SemiBold) | 28px | -0.01em | Card modal headers, drawer titles |
| `headline-sm` | Plus Jakarta Sans | 18px | 600 (SemiBold) | 24px | 0em | Subsection headers, list group titles |
| `title-lg` | Inter | 16px | 600 (SemiBold) | 22px | -0.005em | Card headers, prominent item labels |
| `body-lg` | Inter | 16px | 400 (Regular) | 24px | 0em | Primary content body |
| `body-md` | Inter | 14px | 400 (Regular) | 20px | 0em | Standard table/list items, description |
| `body-sm` | Inter | 12px | 400 (Regular) | 16px | +0.01em | Metadata, timestamp captions |
| `label-lg` | Inter | 13px | 600 (SemiBold) | 16px | +0.02em | Button labels, chip text, badges |
| `label-md` | Inter | 11px | 600 (SemiBold) | 14px | +0.04em | Form micro-labels, tag badges |
| `financial-mono` | Inter | 15px | 500 (Medium) | 20px | -0.02em | Transaction table rows, tabular data |

### Typographic Principles
- **Tabular Numerics**: Financial figures, currency markers, timestamps, and balance totals must render with tabular figures enabled (`font-variant-numeric: tabular-nums`) to prevent horizontal jitter during real-time recalculations.
- **Optical Weight Balancing**: When displaying large monetary units, place the currency symbol (`$`, `₹`, `€`) one size step below the integer sum to maintain typographic rhythm.
- **Dense Data Tracking**: Body labels at 12px or below adopt positive letter tracking (+0.01em to +0.04em) to preserve crisp legibility against dark translucent grounds.

---

## 4. Spacing & Corner Radii

### Spacing Scale
- `space-2xs`: `0.25rem` (4px)
- `space-xs`: `0.5rem` (8px)
- `space-sm`: `0.75rem` (12px)
- `space-md`: `1rem` (16px)
- `space-lg`: `1.25rem` (20px)
- `space-xl`: `1.5rem` (24px)
- `space-2xl`: `2rem` (32px)
- `space-3xl`: `3rem` (48px)
- `margin-mobile`: `1rem` (16px)
- `margin-tablet`: `1.5rem` (24px)
- `gutter-default`: `1rem` (16px)

### Corner Radius
- `rounded-sm`: `0.25rem` (4px)
- `rounded-DEFAULT` / `rounded-md`: `0.5rem` (8px) — Buttons, form inputs, segmented control tracks
- `rounded-lg`: `0.75rem` (12px) to `1rem` (16px) — Standard cards, ledger rows, alert tiles
- `rounded-xl`: `1.5rem` (24px) — Primary hero cards, bottom sheets, modals
- `rounded-full`: `9999px` — Badges, pills, circular avatar anchors

---

## 5. Elevation & Surface Depth

Visual hierarchy does not rely on opaque stacking or heavy drop shadows. Depth is articulated through **spectral glassmorphic diffusion** and **luminous rim refraction**.

### The Elevation Stack
1. **Level 0 (Canvas Void)**: Solid `#0B0F19` / `#0F131D`. Zero elevation.
2. **Level 1 (Docked Surfaces & Base Shelves)**: Background `#111827` overlaid with a 1px top border of `rgba(255, 255, 255, 0.05)`.
3. **Level 2 (Glassmorphic Cards & Ledger Tiles)**: Background `rgba(30, 41, 59, 0.70)` with `backdrop-filter: blur(16px) saturate(180%)`. Border: 1px solid `rgba(51, 65, 85, 0.55)`.
4. **Level 3 (Focused Modals & Floating Action Trays)**: Background `rgba(30, 41, 59, 0.88)` with `backdrop-filter: blur(24px)`. Outer shadow: `0 12px 32px -4px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(255, 255, 255, 0.1)`.

### Chromatic Glow Anchors
- **Primary CTA Glow**: `0 8px 24px -2px rgba(99, 102, 241, 0.35)`
- **Positive / Income Glow**: `0 6px 20px -2px rgba(16, 185, 129, 0.25)`
- **Deficit / Expense Glow**: `0 6px 20px -2px rgba(244, 63, 94, 0.25)`

---

## 6. Component Guidelines

### Buttons
- **Primary Action**: Electric Indigo background (`#6366F1`), white text (`#FFFFFF`), 16px corner radius, 52px height, glow shadow. Hover/active shifts to `#4F46E5`.
- **Secondary Action**: Translucent glass background `rgba(30, 41, 59, 0.80)`, 1px border `rgba(51, 65, 85, 0.80)`, text `#F8FAFC`.
- **Tertiary / Ghost**: Transparent base with `#94A3B8` label, transitioning to `#F8FAFC` on hover/press.

### Transaction Cards & Ledger Tiles
- Deep graphite `#111827` background with top-edge specular highlight (`1px solid rgba(255, 255, 255, 0.08)`).
- Internal horizontal padding: 16px, corner radius: 16px.
- Leading category icons housed within 40x40px 12px-rounded container filled with `rgba(255, 255, 255, 0.03)` and subtle 1px border.

### Badges & Category Chips
- **Income / Positive**: Fill `rgba(16, 185, 129, 0.12)`, text `#10B981`, border `1px solid rgba(16, 185, 129, 0.25)`.
- **Expense / Outflow**: Fill `rgba(244, 63, 94, 0.12)`, text `#F43F5E`, border `1px solid rgba(244, 63, 94, 0.25)`.
- **Neutral Category**: Fill `rgba(51, 65, 85, 0.40)`, text `#94A3B8`, interactive hover transitioning to `#6366F1`.

### Form Inputs
- Background `rgba(17, 24, 39, 0.75)` with inset depth, 1px border `rgba(51, 65, 85, 0.60)`, height 52px, text `#F8FAFC` at 16px.
- Focus state: 1px border `#6366F1` with halo `0 0 0 3px rgba(99, 102, 241, 0.20)`.
