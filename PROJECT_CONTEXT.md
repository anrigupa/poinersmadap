# SMADAP POINER - Project Context & Architecture Specification

## 1. Project Overview
- **Project Name:** SMADAP POINER
- **Description:** A web-based student violation point management system for high schools (Sistem Informasi Poin Pelanggaran Siswa SMADAP).
- **Domain:** High School Student Discipline, Merit & Demerit Points, Behavior Tracking & Guidance (BK/Bimbingan Konseling).

---

## 2. Target Users & Access Roles
1. **Admin (School Administrator / Principal / Disciplinary Head):**
   - Manage master data: users, classes, student data, teachers, violation categories, disciplinary point thresholds, sanctions.
   - Comprehensive system audit logs, point resets, configuration settings, and analytical reports.
2. **Teacher (Wali Kelas, Guru Piket, Guru BK):**
   - Record and log student violations or merit points with photo evidence.
   - Monitor class conduct, violation history, summons status, and parent conference scheduling.
   - Issue counseling notes and guidance progress tracking.
3. **Student (and Parents/Guardians):**
   - View student profile, current active violation and merit point balance.
   - Access history of violations, dates, sanctions, and rehabilitation points earned.
   - View digital school code of conduct and rules handbook.

---

## 3. Technology Stack
- **Framework:** Next.js 15 App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Component UI Library:** shadcn/ui
- **Icons:** Lucide React
- **Forms & Validation:** React Hook Form, Zod
- **Backend & Database:** Supabase PostgreSQL
- **Authentication:** Supabase Auth (Role-based access control / RLS)
- **Object Storage:** Supabase Storage (Violation evidence photos, incident documentation)

---

## 4. Design Style & UX Philosophy
- **Style:** Modern SaaS, Clean, Professional school management dashboard.
- **Responsiveness:** Responsive mobile-first design (optimized for teachers reporting in hallways/classrooms and students viewing on phones).
- **Visuals:** High-contrast accessibility, intuitive status badges (e.g. Minor, Moderate, Severe violation severity), glassmorphism accents, and seamless transitions.

---

## 5. Main Modules & System Architecture
1. **Landing Page (`/`):**
   - School branding (SMADAP POINER), 3D interactive hero, value proposition, quick rules handbook browser, quick student NIS search, multi-role login entry points.
2. **Authentication Module (`/login`, `/auth`):**
   - Secure login supporting Admin, Teacher, and Student credentials with Supabase Auth.
   - Role-based redirect routing and session protection.
3. **Admin Dashboard (`/admin`):**
   - System-wide analytics: top infractions, trends, class discipline rankings.
   - Master data management: students, teachers, classes, disciplinary rulebook points configuration.
   - Sanction workflow oversight (surat panggilan / SP1, SP2, SP3 generation and parent summons).
4. **Teacher Dashboard (`/teacher`):**
   - Quick violation input form with camera/file upload for evidence (Supabase Storage).
   - Class student list with aggregate point health indicators.
   - BK / Counseling intervention notes and merit point additions.
5. **Student Dashboard (`/student`):**
   - Personal discipline scorecard (points total, status standing, merit redemption).
   - Transparent incident history with dates, descriptions, and assigned teachers.
   - Digital rule handbook and behavior improvement guidance.
