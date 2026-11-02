# Project Status: SMADAP POINER (SMAN 2 PANGKEP)

**Version:** 1.0.1-RC2  
**Project:** SMADAP POINER (Sistem Manajemen Disiplin & Poin Pelanggaran Siswa)  
**Institution:** SMAN 2 PANGKEP  
**Last Updated:** 2026-11-02  
**Tech Stack:** Next.js 14/15 (App Router), TypeScript, Tailwind CSS, Lucide Icons, Supabase (Auth, PostgreSQL, Service Role Admin API, Row-Level Security)

---

## Completed

| Module / Component | Route / File | Description & Capabilities |
| :--- | :--- | :--- |
| **Authentication & Role RBAC** | `/login`, `src/features/auth/` | Multi-portal authentication supporting Admin, Teacher (`guru`/`teacher`), and Student (`siswa`/`student`) roles with session cookies and automatic role redirection. |
| **Admin Overview & Executive Analytics** | `/admin`, `src/features/admin/` | Real-time metrics grid, monthly violation trend SVG visualizers, category breakdowns, and recent disciplinary activity logs. |
| **Violation & Category Rules Catalog** | `/admin/rules`, `src/features/rules/` | Full CRUD for categories and rule items, point weighting, search, filtering, pagination, and Zod schema validation. |
| **Teacher Management** | `/admin/teachers`, `src/features/teachers/` | Add, edit, delete teachers, instant password reset, NIP & Email validation, automatic Supabase Auth account creation via Admin Service Role client. |
| **Student Management** | `/admin/students`, `src/features/students/` | Add, edit, delete students, instant password reset, NISN/NIS/Class/Major filtering, live violation point accumulation, and automatic Supabase Auth provisioning. |
| **Teacher Dashboard & Quick Logging** | `/guru`, `src/features/teacher-dashboard/` | Daily and monthly personal reporting stats, quick-action violation modal, and personal submission history. |
| **Record Student Violation Workflow** | `/guru/report`, `src/features/violations/` | 4-step guided flow: (1) Searchable student selector, (2) Category & rule selector, (3) Notes & incident date, (4) Atomic point calculation & student status update. |
| **Student Dashboard & Analytics** | `/siswa`, `src/features/student-dashboard/` | Personal profile summary, cumulative points gauge, disciplinary level badge (`Aman`, `SP1`, `SP2`, `SP3`), and monthly violation trend chart. |
| **Student Violation History** | `/siswa/history`, `src/features/student-history/` | Chronological personal infraction log with search, category filter, pagination, and detailed inspection modal. |
| **Unified Disciplinary Engine** | `src/lib/constants/discipline.ts` | Canonical single source of truth for sanction thresholds: `0–35 Aman`, `36–75 SP1`, `76–150 SP2`, `151+ SP3 (Kepala Sekolah)`. |
| **4-Layer Security Architecture** | `src/middleware.ts`, `src/lib/security/guards.ts` | Edge Middleware perimeter checks, Server Component `requireRole` guards, Server Action role assertions, and PostgreSQL RLS policies. |

---

## Recently Updated

1. **Institution Rebranding to SMAN 2 PANGKEP**:
   - Updated all UI components (`Sidebar`, `Login`, `Rules`, `StudentDashboardClient`, `ViolationLevelGauge`), metadata titles, and SQL seed scripts to **SMAN 2 PANGKEP**.
2. **Live Supabase Database & Auth Provisioning Integration (`src/lib/supabase/admin.ts`)**:
   - Created dedicated server-side `createAdminClient()` utilizing `SUPABASE_SERVICE_ROLE_KEY`.
   - Upgraded `addTeacherAction`, `editTeacherAction`, `deleteTeacherAction`, `getTeachersAction` (`src/features/teachers/actions.ts`) and `addStudentAction`, `editStudentAction`, `deleteStudentAction`, `getStudentsAction` (`src/features/students/actions.ts`) to execute via Admin Service Role privileges, bypassing anonymous RLS restrictions and email confirmation bottlenecks.
3. **Database Schema & Role Constraint Synchronization (`supabase/migrations/`)**:
   - Added [`20261102_initial_schema.sql`](file:///home/anrigupa/Desktop/poiner/supabase/migrations/20261102_initial_schema.sql) for complete table, constraint, index, and trigger initialization.
   - Added [`20261102_fix_profiles_role_constraint.sql`](file:///home/anrigupa/Desktop/poiner/supabase/migrations/20261102_fix_profiles_role_constraint.sql) to normalize `guru` -> `teacher` and `siswa` -> `student` inside the `handle_new_user()` PostgreSQL trigger and allow bilingual role identifiers in `chk_profiles_role`.
   - Added [`20261102_seed_initial_rules.sql`](file:///home/anrigupa/Desktop/poiner/supabase/migrations/20261102_seed_initial_rules.sql) containing standard SMAN 2 PANGKEP disciplinary categories and rules.
4. **Cleanup of Temporary Patch Scripts**:
   - Ensured clean Next.js build verification across all 16 routes with zero duplicate imports or TypeScript errors.

---

## In Progress

1. **Live End-to-End Field Verification with Supabase PostgreSQL**:
   - Validating live teacher and student creation, real-time table rendering in `/admin/teachers` and `/admin/students`, and live violation recording in `/guru/report` against the active Supabase instance.
2. **Rules Catalog Live Sync**:
   - Transitioning `/admin/rules` CRUD operations to use `createAdminClient()` when `SUPABASE_SERVICE_ROLE_KEY` is present so custom rule additions persist directly into `public.violation_categories` and `public.violation_types`.

---

## Pending Features

1. **Official Sanction Letter PDF Generator (Surat Panggilan SP1 / SP2 / SP3)**:
   - Printable official warning letters with SMAN 2 PANGKEP letterhead, student violation ledger, counseling schedule, and signature blocks for Principal & BK Coordinator.
2. **Student Merit & Point Deduction Module (`/siswa/merits` & `/admin/merits`)**:
   - Restorative discipline workflow enabling students to upload achievement certificates (academic competitions, OSIS, Paskibra) to deduct violation points upon admin approval.
3. **Bulk CSV / Excel Data Importer**:
   - Drag-and-drop batch onboarding for student rosters and teacher accounts at the start of the academic year.
4. **BK Counseling Progress Journal (`/guru/counseling`)**:
   - Dedicated case management log for Guru BK to record student counseling sessions and parental follow-ups.
5. **Automated Parent Notifications (WhatsApp / Email Gateway)**:
   - Instant webhook alerts dispatched to parents when severe infractions or SP escalations occur.

---

## Known Issues

| ID | Issue Summary | Root Cause | Status / Mitigation |
| :--- | :--- | :--- | :--- |
| **ISS-01** | **`chk_profiles_role` Constraint Mismatch on Signup** | Initial SQL constraint only allowed `'admin', 'teacher', 'student'`, whereas client metadata sent `'guru'` or `'siswa'`. | **Resolved in Code & Migration**: Normalized server actions to `'teacher'`/`'student'` and created `20261102_fix_profiles_role_constraint.sql`. Must be executed in Supabase SQL Editor. |
| **ISS-02** | **Hybrid Cookie Session vs. Supabase JWT Context** | App uses custom HTTP-only cookie (`AUTH_COOKIE_NAME`) alongside Supabase SSR client, causing anon queries to be blocked by RLS when no Supabase JWT is present. | **Resolved for Teachers & Students**: Server actions now use `createAdminClient()` after verifying admin/role session via `checkAdminAccess()`. Other modules (`rules`, `violations`) should also adopt `createAdminClient()`. |
| **ISS-03** | **Local In-Memory Fallback Reset on Server Restart** | When Supabase credentials are omitted or a query fails into fallback mode, data is stored in memory arrays (`INITIAL_STUDENTS`, `INITIAL_TEACHERS`). | **Mitigated**: Explicit error messages are now returned when live Supabase mutations fail instead of silently falling back to memory. |

---

## Next Priorities

1. **Execute Role Constraint Fix in Supabase SQL Editor**:
   - Run [`supabase/migrations/20261102_fix_profiles_role_constraint.sql`](file:///home/anrigupa/Desktop/poiner/supabase/migrations/20261102_fix_profiles_role_constraint.sql) and [`supabase/migrations/20261102_seed_initial_rules.sql`](file:///home/anrigupa/Desktop/poiner/supabase/migrations/20261102_seed_initial_rules.sql) in the Supabase Dashboard.
2. **Upgrade Remaining Server Actions to `createAdminClient()`**:
   - Update `src/features/rules/actions.ts`, `src/features/violations/actions.ts`, `src/features/teacher-dashboard/actions.ts`, `src/features/student-dashboard/actions.ts`, and `src/features/admin/actions/overviewActions.ts` to use `createAdminClient()` so all live database reads and writes operate seamlessly with RLS enabled.
3. **Build Official Sanction Letter (SP1/SP2/SP3) PDF Generator**:
   - Implement printable sanction letters for SMAN 2 PANGKEP.
4. **Build Student Merit & Point Deduction Module (`/siswa/merits`)**:
   - Complete the restorative discipline cycle for students.
