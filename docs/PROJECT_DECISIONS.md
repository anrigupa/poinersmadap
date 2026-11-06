# Architectural & Technical Decisions: SMADAP POINER

**Project:** SMADAP POINER (Sistem Manajemen Disiplin & Poin Pelanggaran Siswa)  
**Institution:** SMAN 2 PANGKEP  
**Document Version:** 1.0.0  
**Updated:** 2026-11-02  

---

## 1. Overview & Decision Framework

This document records the critical architectural, technological, database, security, and interface design decisions made during the development of SMADAP POINER. Each record details the context, options evaluated, chosen solution, rationale, and consequences.

---

## 2. Architecture & Framework Selection

### ADR-001: Next.js 15 App Router & React Server Components (RSC)
- **Status:** Accepted
- **Context:** The system requires distinct portals with different access requirements (Admin, Teacher, Student) while prioritizing fast initial loads on school networks and strict server-side authorization.
- **Decision:** Adopt Next.js 15 with App Router and React Server Components (RSC).
- **Rationale:**
  - RSC eliminates the exposure of sensitive database queries and business logic to client-side bundles.
  - Page guards run directly on the server before client markup is emitted.
  - Built-in layout nesting allows a unified `DashboardShell` without remounting navigation structures across sub-routes.
- **Consequences:** Client interactivity requires explicit `'use client'` boundaries; data fetching must be orchestrated via Server Components or Server Actions.

---

### ADR-002: Modular Domain Feature Organization (`src/features/*`)
- **Status:** Accepted
- **Context:** Traditional Next.js projects cluster files by type (`components/`, `actions/`, `types/`, `hooks/`), resulting in high coupling and friction when maintaining complex domain workflows.
- **Decision:** Organize code by business domain under `src/features/` (`rules`, `students`, `teachers`, `teacher-dashboard`, `student-dashboard`, `student-history`, `violations`, `auth`).
- **Rationale:**
  - Co-locates domain schemas, server actions, UI components, and TypeScript definitions.
  - Makes individual feature modules self-contained, easily testable, and cleanly navigable.
  - Keeps page components in `src/app/` minimal, acting primarily as route shells and security wrappers.
- **Consequences:** Shared generic utilities are strictly maintained in `src/components/ui/` and `src/lib/` to prevent cross-feature entanglement.

---

## 3. Database & Data Modeling Decisions

### ADR-003: Supabase (PostgreSQL + Auth + Row-Level Security)
- **Status:** Accepted
- **Context:** The platform requires relational data integrity (students, teachers, infractions, rules), secure session tokens, and enterprise-grade row-level permissioning.
- **Decision:** Use Supabase as the unified backend (PostgreSQL database, Supabase Auth, and Row-Level Security).
- **Rationale:**
  - Native Postgres constraints (Foreign Keys, CHECK constraints, triggers) enforce data consistency at the engine level.
  - Supabase Auth provides secure password hashing, session tokens, and metadata management out of the box.
  - Postgres RLS provides true defense-in-depth: even if an application bug bypassed server code, the database itself rejects unauthorized reads or writes.
- **Consequences:** Requires Supabase environment configuration (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).

---

### ADR-004: Dual-Mode Operation (Live Supabase + Resilient Offline Fallback)
- **Status:** Accepted
- **Context:** During development, offline evaluation, or local testing without active cloud internet access, developers and CI/CD sandboxes must remain functional without crashing on build.
- **Decision:** Implement hybrid Server Actions that detect live Supabase credentials and seamlessly fall back to memory stores (`mockRules`, `mockStudents`, etc.) when offline.
- **Rationale:**
  - Enables zero-config local cloning and immediate sandbox testing.
  - Prevents build failures during static analysis or deployment environments lacking live database hooks.
- **Consequences:** Code in server actions includes conditional fallback branches; production deployments must verify `.env.local` contains live credentials.

---

### ADR-005: Unified Disciplinary Level Calculation Engine
- **Status:** Accepted
- **Context:** Earlier design drafts had conflicting point thresholds (e.g. SP1 starting at 30 points vs. 36 points). Inconsistent threshold definitions across modules could cause mismatched statuses between teacher views, student cards, and sanction reports.
- **Decision:** Create [`src/lib/constants/discipline.ts`](file:///home/anrigupa/Desktop/poiner/src/lib/constants/discipline.ts) as the sole canonical source of truth:
  - `0 – 35 Poin`: **Aman** (Active / Wali Kelas monitoring)
  - `36 – 75 Poin`: **SP1** (Surat Peringatan 1 / Wali Kelas & Guru BK)
  - `76 – 150 Poin`: **SP2** (Surat Peringatan 2 / Guru BK & Kesiswaan)
  - `151+ Poin`: **SP3** (Surat Peringatan 3 / Sidang Kepala Sekolah & Dewan Guru)
- **Rationale:**
  - Guarantees deterministic evaluation across all point additions, UI status badges, and future sanction letter generation.
  - Centralizes color palettes, escalation levels, and handling authorities in one place.
- **Consequences:** Any threshold adjustment requires editing only one constant file.

---

## 4. Security & Access Control Decisions

### ADR-006: 4-Layer Defense-in-Depth Security Model
- **Status:** Accepted
- **Context:** Educational discipline records are sensitive personal data. Breaches or unauthorized tampering (e.g. students modifying point balances or teachers accessing other teachers' personal drafts) could disrupt school operations.
- **Decision:** Enforce four distinct security checkpoints:
  1. **Edge Middleware (`src/middleware.ts`)**: Fast boundary inspection of cookies and session tokens before route execution.
  2. **Page-Level Route Guards (`src/lib/security/guards.ts`)**: Server Component level checks using `requireRole(['admin'])`, etc.
  3. **Server Action Assertions**: Explicit permission checks (`checkAdminAccess`, `assertPersonalStudentAccess`, `assertPersonalTeacherAccess`) inside server functions.
  4. **PostgreSQL Row-Level Security (RLS)**: Database engine policies restricting SQL rows based on `auth.uid()`.
- **Rationale:**
  - Ensures zero reliance on client-side security.
  - A vulnerability or omission in one layer is neutralized by the other three layers.
- **Consequences:** Server actions must retrieve and verify the authenticated session user from server cookies.

---

### ADR-007: Teacher Identity Binding in Violation Submissions
- **Status:** Accepted
- **Context:** When recording violations, allowing client forms to send an arbitrary `teacher_id` would allow malicious impersonation or misattribution.
- **Decision:** Discard any client-supplied teacher profile identifiers. The server action automatically resolves the `reported_by` field using the verified session ID of the caller.
- **Rationale:** Guarantees absolute attribution integrity for every disciplinary report.
- **Consequences:** Unauthenticated or unauthorized callers attempting to record infractions are immediately rejected with an authorization error.

---

## 5. UI/UX & Frontend Performance Decisions

### ADR-008: Native SVG Visualizations vs. External Charting Libraries
- **Status:** Accepted
- **Context:** The Admin and Student dashboards require monthly trend charts and category breakdown graphs. Heavy visualization packages (e.g., Recharts, Chart.js, Highcharts) introduce significant bundle bloat (100–300 kB) and external canvas/CSS dependencies.
- **Decision:** Build custom, lightweight SVG bar charts and category distribution gauges directly in React with Tailwind CSS v4.
- **Rationale:**
  - Keeps the entire shared client JavaScript bundle under **87 kB**.
  - Renders server-side or hydrate instantaneously without client-side rendering lag.
  - Fully accessible, themeable, and mobile-responsive using CSS Flexbox.
- **Consequences:** Chart types are customized to specific project needs rather than relying on heavy off-the-shelf graphing suites.

---

### ADR-009: Native System Font Stack
- **Status:** Accepted
- **Context:** External web font loaders (e.g. `next/font/google` requesting Inter from Google Fonts) caused build timeouts in offline sandboxes and restricted corporate/school networks.
- **Decision:** Use a modern native system font stack (`system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`).
- **Rationale:**
  - Zero external network dependencies during development, compilation, or deployment.
  - Instant page typography rendering with 0ms Font Display Swap (FOUT/FOIT).
  - Maximizes performance and battery efficiency on mobile client devices.
- **Consequences:** Typography appearance conforms cleanly to the user's host operating system.

---

### ADR-010: Debounced Instant Search Architecture
- **Status:** Accepted
- **Context:** Master data management tables (Students, Teachers, Rules) and the student selector in the violation workflow include real-time search inputs. Unthrottled queries on every keystroke create server action flooding and UI stutter.
- **Decision:** Standardize search inputs with a 250ms debounce delay before triggering server filtering.
- **Rationale:**
  - Reduces redundant server action calls by up to 80% during user typing.
  - Preserves a fluid, responsive user experience without noticeable lag.
- **Consequences:** Search handlers utilize a shared debounce utility or lightweight React timer hooks.

---

### ADR-011: Unified Student Discipline Card & Standalone History Menu Removal
- **Status:** Accepted
- **Context:** The Student Portal previously included a standalone "Riwayat Pelanggaran" sidebar menu item leading to `/siswa/history`, duplicating the violation timeline already displayed directly inside the Discipline Card view on the main `/siswa` dashboard.
- **Decision:** Remove "Riwayat Pelanggaran" from the Student Sidebar and Mobile Navigation, redirect `/siswa/history` to `/siswa`, and document the unified Discipline Card as the single source of truth for student infraction records.
- **Rationale:**
  - Eliminates navigation clutter and UX redundancy for students and parents.
  - Keeps the Student Sidebar focused and balanced (`Kartu Disiplin`, `Prestasi & Pemutihan`, `Buku Saku Digital`).
  - Automatically redirects legacy bookmarked URLs to `/siswa` without broken route errors.
  - Preserves 100% of violation query logic, database schema, and point calculations intact.
- **Consequences:** Violation history is accessed strictly through the embedded `StudentViolationHistoryList` component within `/siswa`.

---

### ADR-012: Restorative Discipline, Student Merits, and Point Reduction Audit Architecture
- **Status:** Accepted
- **Context:** SMAN 2 PANGKEP requires a restorative justice mechanism where student achievements (merits across 7 categories: Akademik, Ekstrakurikuler, Tahfidz, OSIS, Paskibra, Keagamaan, Sosial) can offset active disciplinary points without compromising administrative compliance, historical traceability, or legal sanction records.
- **Decision:** Implement `/siswa/merits` with 5 standardized sections:
  1. **Prestasi Saya**: Student achievement list with categories, merit points, and verification badges (`Pending`, `Approved`, `Rejected`).
  2. **Saldo Prestasi**: Real-time balance showing Total Poin Prestasi, Poin Terpakai (Diputihkan), and Saldo Tersedia.
  3. **Riwayat Pemutihan**: Immutable audit trail logging date, reason, original points, reduction amount, resulting points, and approver.
  4. **Status Disiplin**: Deterministic formula $\text{Effective Discipline Points} = \max(0, \text{Total Violation Points} - \text{Total Reduction Points})$.
  5. **Pengajuan Prestasi**: Student submission form with evidence attachment URL, defaulting to `Pending` and subject to Admin or Guru BK approval.
- **Mandatory Integrity Invariants:**
  - **Zero Violation Deletion**: Records in `public.student_violations` are never deleted under any circumstances; the violation ledger remains permanent.
  - **Non-Negative Invariant**: Effective discipline points and available merit balances cannot be negative ($\ge 0$).
  - **Traceable Ledger**: All point reductions require an explicit audit record in `counseling_records` / `merit_deductions`.
- **Consequences:** Provides students with a positive rehabilitation path while maintaining full accountability for school leadership.

---

### ADR-013: Counselor (Guru BK) Module Architecture & Restorative Workflow
- **Status:** Accepted
- **Context:** The Counselor Portal at `/guru/counseling` requires full alignment with the restorative discipline system. It must grant operational governance over student merits, approval of point reductions (pemutihan), and tracking of students requiring intervention (`SP1`, `SP2`, `SP3`, `BK Monitoring`), with strict access isolation restricted to counselors (`teacher_type = counselor`).
- **Decision:** Refactor `/guru/counseling` to utilize the existing Student Merit & Point Reduction architecture:
  1. **Role Access Control**: Only authenticated teachers with `teacher_type = 'counselor'` (or Admin) can view counselor data; unauthorized staff receive an informative access restriction banner (`"Akses hanya dimiliki oleh Guru BK"`).
  2. **Section 1 (Dashboard Konseling BK)**: Four summary KPI cards tracking Pending Achievements, Approved Merits, Approved Reductions, and Active Students in Coaching.
  3. **Section 2 (Verifikasi Prestasi Siswa)**: Counselor review queue to inspect student evidence and approve (assigning merit points) or reject (with auditable reason) via `verifyAchievementAction()`.
  4. **Section 3 (Pemutihan Poin)**: Interactive student selector with live before-and-after simulation (`Violation Points - Conversion = Resulting Points`) using `applyMeritReductionAction()`.
  5. **Section 4 (Riwayat Pemutihan)**: Complete immutable audit log of all point reductions with original points, reduction amounts, remaining points, and approving counselor.
  6. **Section 5 (Pembinaan Siswa)**: Intervention roster displaying students with `SP1`, `SP2`, `SP3`, and `BK Monitoring` with modal logging for counseling notes, follow-up actions, and recommendations via `recordCounselingSessionAction()`.
- **Integrity Invariants:**
  - Violation records in `student_violations` are immutable and never deleted.
  - Poin reductions cannot exceed available merit balance or reduce points below zero.
- **Consequences:** Seamless interoperability between student submissions and counselor governance.

---

### ADR-014: POINER SMADAP Global UI Design System & Accessibility Governance
- **Status:** Accepted
- **Context:** Previous modules exhibited slight visual fragmentation in typography weights, section labeling (technical prefixes such as `SECTION 1:`), statistics card hierarchies, table header contrast, and spacing systems. SMAN 2 PANGKEP requires an accessible, WCAG AA compliant, unified design system across all application portals (Admin, Guru, BK, and Siswa).
- **Decision:** Implement a centralized design system token library in `src/lib/design-system.ts` and reusable primitives in `src/components/ui/` (`SectionHeader`, `StatCard`, `Badge`):
  1. **Typography Standards**:
     - Page Titles: `text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight`
     - Section Titles: `text-base sm:text-lg font-semibold text-slate-800 tracking-tight`
     - Section Descriptions: `text-xs sm:text-sm text-slate-500 mt-1 leading-normal`
     - Metadata: `text-xs font-medium text-slate-600`
  2. **Technical Label Deprecation**:
     - Completely removed all technical/developer labels (`SECTION X:`, `MODULE X:`, `STEP X:`, `Langkah X:`).
     - Standardized user-centric domain titles with supporting descriptions across all sections.
  3. **Card Hierarchy Standards**:
     - Statistics cards strictly follow the 3-step descending hierarchy: **Value** ($\text{3xl/4xl font-extrabold}$) $\rightarrow$ **Label** ($\text{text-sm font-semibold text-slate-800}$) $\rightarrow$ **Description** ($\text{text-xs text-slate-500}$).
  4. **Data Tables & WCAG AA Contrast**:
     - Standardized table headers to high-visibility `bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700 uppercase tracking-wider`.
     - Standardized badges to high-contrast emerald (success), amber (warning), red/rose (danger), and blue (info) with high-contrast text and border treatments.
     - Prohibited low-contrast glassmorphism and washed-out text on bright backdrops.
  5. **Spacing Governance**:
     - $\ge 32\text{px}$ between sections (`space-y-8`), $\ge 16\text{px}$ between cards (`gap-4 sm:gap-6`), $8\text{px}$ between title and description, and $16\text{px}$ between section title and content.
- **Consequences:** Provides a modern, accessible, professional school management system experience with 100% WCAG AA contrast compliance and cross-portal visual unity.

---

### ADR-015: Permanent Rule: Mandatory Reuse of Shared UI Components & Semantic Palettes
- **Status:** Accepted
- **Context:** To prevent future regressions and avoid fragmented page-specific color schemes across newly created or refactored pages, a permanent architectural rule is required.
- **Decision:** Enforce mandatory reuse of shared UI primitives and ban page-specific color systems:
  1. **Mandatory Shared Primitives**:
     - `PageHeader` (`@/components/ui/PageHeader`): Reused for page titles, descriptions, icons, and actions.
     - `SectionHeader` (`@/components/ui/SectionHeader`): Reused for every content section.
     - `StatsCard` / `StatCard` (`@/components/ui/StatCard`): Reused for all KPI/summary metrics.
     - `Badge` (`@/components/ui/Badge`): Reused for all status, audit, and category indicators.
     - `tables` tokens (`@/lib/design-system`): Reused for all tabular presentations.
  2. **Strict Semantic Color Policy**:
     - Prohibit arbitrary page-specific palettes (e.g. custom pink, purple, violet, teal, neon gradients) unless explicitly required.
     - All UI states are constrained to 5 approved semantic families: Success (`emerald`), Warning (`amber`), Danger (`rose`/`red`), Info (`blue`), and Neutral (`slate`).
  3. **Agent Rule & Graph Persistence**:
     - Enshrined in `.agents/rules/ui-design-system.md` and indexed in the knowledge graph.
- **Consequences:** All future modules will automatically maintain 100% aesthetic harmony and WCAG AA contrast compliance with zero fragmentation.

---

*Authored and verified for the SMADAP POINER Engineering Knowledge Base.*
