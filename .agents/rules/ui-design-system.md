---
trigger: always_on
description: Permanent rule mandating reuse of shared UI components and global design system standards.
---

## UI Design System & Shared Primitives Mandate

All new and refactored pages in POINER SMADAP must reuse the shared design system components and standards:

### 1. Mandatory Shared Primitives
- **Page Header**: Reuse [`PageHeader`](file:///home/anrigupa/Desktop/poiner/src/components/ui/PageHeader.tsx) (`src/components/ui/PageHeader.tsx`) for top-level page titles, metadata, and primary page actions.
- **Section Header**: Reuse [`SectionHeader`](file:///home/anrigupa/Desktop/poiner/src/components/ui/SectionHeader.tsx) (`src/components/ui/SectionHeader.tsx`) for every content section (title, description, icon container, badge, action).
- **Statistics Cards**: Reuse [`StatsCard`](file:///home/anrigupa/Desktop/poiner/src/components/ui/StatCard.tsx) / [`StatCard`](file:///home/anrigupa/Desktop/poiner/src/components/ui/StatCard.tsx) (`src/components/ui/StatCard.tsx`) enforcing the 3-step hierarchy:
  ```
  Value (Large numeric, font-mono / font-black)
    ↓
  Label (Semibold descriptive title, text-slate-800)
    ↓
  Description (Small supporting context, text-slate-500)
  ```
- **Table Styles**: Apply shared `tables` tokens from [`src/lib/design-system.ts`](file:///home/anrigupa/Desktop/poiner/src/lib/design-system.ts) (`tables.table`, `tables.thead`, `tables.th`, `tables.td`, `tables.row`).
- **Badge Variants**: Reuse [`Badge`](file:///home/anrigupa/Desktop/poiner/src/components/ui/Badge.tsx) (`src/components/ui/Badge.tsx`) and `badges` tokens from `src/lib/design-system.ts`.
- **Selection Inputs (> 10 options)**: All selection inputs, comboboxes, and dropdowns with more than 10 options MUST use the **Popover + Command (`cmdk`)** pattern (e.g. [`ClassSelector`](file:///home/anrigupa/Desktop/poiner/src/components/ui/ClassSelector.tsx)) instead of native HTML `<select>`. Applied to `students`, `teachers`, `classes`, `violations`, and `counseling records`. Native HTML `<select>` is strictly prohibited for large datasets.

### 2. Strictly Prohibited: Page-Specific Color Systems
- Do NOT introduce custom page-specific color palettes (e.g. arbitrary purple, violet, pink, or custom gradient themes) unless explicitly required by the user.
- All UI states must use only the 5 approved semantic color families:
  1. **Success**: `emerald` (`bg-emerald-100 text-emerald-900 border-emerald-300`)
  2. **Warning**: `amber` (`bg-amber-100 text-amber-950 border-amber-300`)
  3. **Danger**: `rose` / `red` (`bg-rose-100 text-rose-950 border-rose-300`)
  4. **Info**: `blue` (`bg-blue-100 text-blue-950 border-blue-300`)
  5. **Neutral**: `slate` (`bg-slate-100 text-slate-800 border-slate-300`)

### 3. Section Hierarchy & Accessibility
- Remove technical prefixes like `SECTION 1:`, `MODULE 1:`, `STEP 1:`.
- Every section must provide a clean title, supporting description, and content container.
- All interactive elements and badges must meet **WCAG AA** contrast requirements (4.5:1 ratio minimum).
- Spacing: Minimum `32px` (`space-y-8`) between major sections, `16px` (`gap-4 sm:gap-6`) between cards.
