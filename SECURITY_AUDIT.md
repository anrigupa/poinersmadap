# SMADAP POINER - Complete Security Layer Audit Report

## 1. Executive Summary

This security audit verifies and hardens the complete defense-in-depth security layer of **SMADAP POINER** (Web-Based Student Violation Point Management System).

The implementation enforces the core access requirements:
- **Admin**: Full access across all master data, user accounts, overview analytics, and rule catalogues.
- **Teacher (`guru`)**: Authorized to create violations and read only personal submissions. Prohibited from mutating master data or viewing other teachers' private logs.
- **Student (`siswa`)**: Strict personal isolation. Authorized to read personal points, violation history, and public rules only. Prohibited from accessing other students' records or mutating infractions.

---

## 2. Multi-Layer Security Architecture

```
                       [ Incoming Client Request ]
                                    │
                                    ▼
       ┌────────────────────────────────────────────────────────┐
       │ Layer 1: Next.js Edge Middleware                       │
       │ (Route gating, cookie extraction, automatic redirects) │
       └────────────────────────────────────────────────────────┘
                                    │
                                    ▼
       ┌────────────────────────────────────────────────────────┐
       │ Layer 2: Server Component Route Guards                 │
       │ (requireRole, requireAuth, defense-in-depth)           │
       └────────────────────────────────────────────────────────┘
                                    │
                                    ▼
       ┌────────────────────────────────────────────────────────┐
       │ Layer 3: Server Action Authorization Guards            │
       │ (assertRole, assertPersonalStudentAccess, input zod)   │
       └────────────────────────────────────────────────────────┘
                                    │
                                    ▼
       ┌────────────────────────────────────────────────────────┐
       │ Layer 4: PostgreSQL Supabase Row-Level Security (RLS)  │
       │ (public.get_auth_role(), tenant filters, RLS policies) │
       └────────────────────────────────────────────────────────┘
```

---

## 3. Route Guard & Middleware Matrix

| Route | Minimum Role | Middleware Enforcement | Page Route Guard | Unauthorized Handling |
| :--- | :--- | :--- | :--- | :--- |
| `/login` | Public / Guest | Permitted; Redirects if logged in | - | Redirects to role home |
| `/rules` | Public / All | Permitted | Open | Public reference |
| `/admin` | `admin` | Edge boundary check | `requireRole(["admin"])` | Redirects to `/login` or role portal |
| `/admin/rules` | `admin` | Edge boundary check | `requireRole(["admin"])` | Redirects to `/login` or role portal |
| `/admin/students` | `admin` | Edge boundary check | `requireRole(["admin"])` | Redirects to `/login` or role portal |
| `/admin/teachers` | `admin` | Edge boundary check | `requireRole(["admin"])` | Redirects to `/login` or role portal |
| `/guru` | `guru`, `admin` | Edge boundary check | `requireRole(["guru", "admin"])` | Redirects to `/login` or `/siswa` |
| `/guru/report` | `guru`, `admin` | Edge boundary check | `requireRole(["guru", "admin"])` | Redirects to `/login` or `/siswa` |
| `/siswa` | `siswa`, `admin` | Edge boundary check | `requireRole(["siswa", "admin"])` | Redirects to `/login` or `/guru` |
| `/siswa/history` | `siswa`, `admin` | Edge boundary check | `requireRole(["siswa", "admin"])` | Redirects to `/login` or `/guru` |

---

## 4. Server Action Authorization Audit Matrix

| Feature Module | Server Action | Authorized Roles | Ownership / Personal Filter |
| :--- | :--- | :--- | :--- |
| **Rules Management** | `createCategoryAction` | `admin` | System-wide catalogue |
| | `updateCategoryAction` | `admin` | System-wide catalogue |
| | `deleteCategoryAction` | `admin` | System-wide catalogue |
| | `createViolationAction` | `admin` | System-wide catalogue |
| | `updateViolationAction` | `admin` | System-wide catalogue |
| | `deleteViolationAction` | `admin` | System-wide catalogue |
| **Teacher Management** | `addTeacherAction` | `admin` | Creates Supabase Auth credentials |
| | `editTeacherAction` | `admin` | Updates teacher record |
| | `deleteTeacherAction` | `admin` | Cascades delete to Auth user |
| | `resetTeacherPasswordAction` | `admin` | Updates Supabase Auth password |
| **Student Management** | `addStudentAction` | `admin` | Creates Auth user with `role: "siswa"` |
| | `editStudentAction` | `admin` | Updates student record |
| | `deleteStudentAction` | `admin` | Cascades delete to Auth user |
| | `resetStudentPasswordAction` | `admin` | Updates Supabase Auth password |
| **Teacher Dashboard** | `getTeacherDashboardData` | `guru`, `admin` | **Strict: `reported_by = session.user.id`** |
| | `addTeacherViolationAction` | `guru`, `admin` | Auto-stamps `reported_by: session.user.id` |
| **Record Violation** | `recordStudentViolationAction`| `guru`, `admin` | Links authenticated teacher & student |
| **Student Dashboard** | `getStudentDashboardData` | `siswa`, `admin` | **Strict: `profile_id = session.user.id`** |
| **Student History** | `getStudentViolationHistoryAction` | `siswa`, `admin` | **Strict: `student_id = session.user.id`** |

---

## 5. PostgreSQL Row-Level Security (RLS) Policies

All tables have RLS enabled with granular policies in [`supabase/migrations/20261102_security_rls_layer.sql`](file:///home/anrigupa/Desktop/poiner/supabase/migrations/20261102_security_rls_layer.sql):

1. **`public.profiles`**:
   - `SELECT`: Users read own profile; teachers read student profiles; admin reads all.
   - `INSERT / UPDATE / DELETE`: Admin only.
2. **`public.students`**:
   - `SELECT`: Admin reads all; teachers read all (for autocomplete); students read **only own record** (`profile_id = auth.uid()`).
   - `INSERT / UPDATE / DELETE`: Admin only.
3. **`public.teachers`**:
   - `SELECT`: Authenticated read (for reporter names).
   - `INSERT / UPDATE / DELETE`: Admin only.
4. **`public.violation_categories` & `violation_types`**:
   - `SELECT`: Public & authenticated read for active rules.
   - `INSERT / UPDATE / DELETE`: Admin only.
5. **`public.student_violations`**:
   - `SELECT`:
     - Admin: Full read access.
     - Teacher: `reported_by = auth.uid()` (**Personal records only**).
     - Student: `student_id = auth.get_student_id()` (**Own incidents only**).
   - `INSERT`: Teachers and Admins only (`reported_by = auth.uid()`).
   - `UPDATE / DELETE`: Admin only (or BK for appeal resolutions).
6. **`storage.objects` (`violation-evidence`)**:
   - `INSERT`: Teachers and Admins only.
   - `SELECT`: Authenticated users.
