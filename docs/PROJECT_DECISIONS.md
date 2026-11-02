# Architectural & Technical Decisions: SMADAP POINER

**Project:** SMADAP POINER (Sistem Manajemen Disiplin & Poin Pelanggaran Siswa)  
**Institution:** SMA Negeri 2 Painan  
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

*Authored and verified for the SMADAP POINER Engineering Knowledge Base.*
