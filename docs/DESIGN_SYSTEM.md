# POINER SMADAP Global UI Design System & Accessibility Standards

## 1. Overview & Objectives

The POINER SMADAP UI Design System standardizes typography, colors, spacing, statistics cards, status badges, hero sections, and data tables across all application portals:
- **Admin Dashboard** (`/admin`, rules, students, teachers, settings)
- **Teacher Dashboard** (`/guru`, profile, classes, history, report)
- **Counselor Dashboard** (`/guru/counseling`)
- **Student Dashboard** (`/siswa`, merits, history)

The system targets **WCAG AA contrast compliance** and consistent information architecture across both mobile and desktop screens.

---

## 2. Typography Standards

| Element | Specifications | Tailwind Token | Example |
| :--- | :--- | :--- | :--- |
| **Page Title** | Large size, high contrast, bold | `text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight` | *Dashboard Guru*, *Pengaturan Sistem* |
| **Section Title** | Medium size, semibold | `text-base sm:text-lg font-semibold text-slate-800 tracking-tight` | *Verifikasi Prestasi*, *Riwayat Pemutihan* |
| **Section Description**| Short supporting sentence, muted | `text-xs sm:text-sm text-slate-500 mt-1 leading-normal` | *Verifikasi pengajuan prestasi siswa...* |
| **Body Text** | Standard readable body | `text-sm text-slate-700 leading-relaxed` | General descriptive content |
| **Metadata** | Compact metadata | `text-xs font-medium text-slate-600` | NIP, NISN, Email, Tanggal, Role |
| **Muted Content** | Low-priority hints | `text-xs text-slate-400` | Format guidance, timestamp notes |

---

## 3. Section Hierarchy Rules

All technical and developer prefixes have been completely removed:
- ❌ `SECTION 1:`, `SECTION 2:`
- ❌ `MODULE 1:`, `MODULE 2:`
- ❌ `STEP 1:`, `STEP 2:`, `Langkah 1:`

Standard user-centric section structure:
- **Title**: Clear domain concept (`Dashboard Konseling BK`, `Verifikasi Prestasi`, `Profil Guru`)
- **Supporting Description**: One short sentence explaining the section's purpose
- **Content Area**: Solid cards, high-contrast tables, or interactive workflows

---

## 4. Card Hierarchy Rules

Statistics and summary KPI cards strictly follow the 3-step descending hierarchy:

```
Value (Large numeric metric, font-mono / font-black)
  ↓
Label (Semibold descriptive title, text-slate-800)
  ↓
Description (Small supporting context, text-slate-500)
```

**Standard Card Anatomy (`StatCard` / `cards.statCard`):**
- **Background**: Solid white (`bg-white`), border (`border-slate-200/90`), subtle shadow (`shadow-sm`)
- **Top Bar**: Semantic status badge + icon container
- **Step 1 (Value)**: `text-3xl sm:text-4xl font-extrabold text-slate-900 font-mono tracking-tight`
- **Step 2 (Label)**: `text-sm font-semibold text-slate-800 mt-2`
- **Step 3 (Description)**: `text-xs text-slate-500 mt-1`

---

## 5. Color Palette & WCAG AA Contrast

| State | Palette | Tailwind Classes | Usage |
| :--- | :--- | :--- | :--- |
| **Primary / Heading** | Slate 900 | `text-slate-900` | Page titles, primary numerical metrics |
| **Secondary Title** | Slate 800 | `text-slate-800` | Section titles, card titles, table row headers |
| **Body Content** | Slate 700 | `text-slate-700` | Table cells, form labels, narrative copy |
| **Supporting / Meta**| Slate 500 / 600| `text-slate-500`, `text-slate-600` | Section subtext, metadata |
| **Success** | Emerald | `bg-emerald-100 text-emerald-900 border-emerald-300` | Approved, verified, active, 0 violation points |
| **Warning** | Amber | `bg-amber-100 text-amber-950 border-amber-300` | Pending review, SP1 notice, moderate risk |
| **Danger** | Red / Rose | `bg-rose-100 text-rose-950 border-rose-300` | Rejected, SP2/SP3, heavy violation points |
| **Info** | Blue | `bg-blue-100 text-blue-950 border-blue-300` | Informational badges, role indicators |

---

## 6. Hero Sections & Anti-Glassmorphism Policy

To maintain strict WCAG AA readability:
- **No low-contrast glassmorphism**: Eliminated white text on bright/washed-out semi-transparent backgrounds.
- **Solid Hero Banners**: High-contrast blue-to-indigo gradient (`from-blue-700 via-indigo-700 to-blue-800` or `from-slate-900 via-blue-950 to-indigo-950`) with high-contrast text (`text-white`, `text-blue-100`).
- **Scorecards inside Hero**: Solid backdrops (`bg-slate-900/90 border-slate-700/80` or `bg-white`) with bright numeric text (`text-white`, `text-rose-400`, `text-emerald-400`).

---

## 7. Data Tables

Every table across Admin, Guru, BK, and Siswa modules shares identical styling:
- **Table Container**: `bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden`
- **Table Header**: `bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700 uppercase tracking-wider`
- **Row Styling**: `hover:bg-slate-50/75 transition-colors divide-y divide-slate-100`
- **Cell Padding**: `py-3.5 sm:py-4 px-4 sm:px-6 text-sm text-slate-700`
- **Responsive Handling**: Stacked mobile cards on narrow viewports (`< 768px`) and horizontal scrolling on wide tables.

---

## 8. Spacing System

- **Between Sections**: Minimum `32px` (`space-y-8` / `my-8`)
- **Between Cards / Grids**: Minimum `16px` (`gap-4 sm:gap-6`)
- **Between Section Title & Description**: `8px` (`mt-2` / `mt-1`)
- **Between Section Header & Content**: `16px` (`mt-4`)

---

## 9. Permanent Project Rule: Shared Component Reuse

All new and refactored pages in POINER SMADAP must strictly reuse shared UI primitives from `@/components/ui`:

| Shared Primitive | Import Path | Purpose |
| :--- | :--- | :--- |
| **`PageHeader`** | `@/components/ui/PageHeader` | Standard page titles, descriptions, icons, top actions |
| **`SectionHeader`** | `@/components/ui/SectionHeader` | Standard section headers with domain icons and descriptions |
| **`StatsCard` / `StatCard`** | `@/components/ui/StatCard` | Metric indicators adhering to Value → Label → Description hierarchy |
| **`Badge`** | `@/components/ui/Badge` | Semantic status badges (WCAG AA compliant) |
| **`tables` tokens** | `@/lib/design-system` | Uniform tabular styling (`table`, `thead`, `th`, `td`, `row`) |

### Strict Semantic Color Policy:
Do not introduce page-specific color palettes (e.g., custom purple, pink, or neon gradients) unless explicitly required. All UI states must use only the 5 approved semantic families:
- **Success**: `emerald`
- **Warning**: `amber`
- **Danger**: `rose` / `red`
- **Info**: `blue`
- **Neutral**: `slate`

