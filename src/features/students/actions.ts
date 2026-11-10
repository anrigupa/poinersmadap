"use server";

import { revalidatePath } from "next/cache";

function safeRevalidatePath(path: string, type?: "page" | "layout") {
  try {
    revalidatePath(path, type);
  } catch {
    // Non-request context
  }
}
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentSession } from "@/features/auth/actions/authActions";
import { requireRole, assertRole, sanitizeSearchQuery } from "@/lib/security/guards";
import { getDisciplinaryLevel } from "@/lib/constants/discipline";
import {
  StudentItem,
  StudentFilter,
  PaginatedResult,
  ActionResponse,
  StudentSummaryStats,
  SiswaTertibStats,
} from "@/features/students/types";
import {
  studentFormSchema,
  StudentFormData,
  resetStudentPasswordSchema,
} from "@/features/students/schemas";

async function checkAdminAccess<T = any>(actionName: string): Promise<ActionResponse<T> | null> {
  const session = await getCurrentSession();
  if (!session || session.user.role !== "admin") {
    return {
      success: false,
      message: `Akses ditolak: Hanya Administrator yang berhak ${actionName}.`,
    };
  }
  return null;
}

// Clean empty initial state (all data derived strictly from Supabase PostgreSQL)
let INITIAL_STUDENTS: StudentItem[] = [];

function isSupabaseLive(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return Boolean(
    url &&
    url !== "https://placeholder-project.supabase.co" &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

// -------------------------------------------------------------
// GET SUMMARY METRICS
// -------------------------------------------------------------

export async function getStudentSummaryAction(): Promise<StudentSummaryStats> {
  // Enforce authenticated staff role (CRITICAL-02 remediation)
  const session = await requireRole(["admin", "guru"]);
  assertRole(session, ["admin", "guru"], "mengakses ringkasan data siswa");

  if (isSupabaseLive()) {
    try {
      const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY ? createAdminClient() : await createClient();
      const { data } = await supabase
        .from("students")
        .select("total_violation_points, status");

      if (data && data.length > 0) {
        return {
          totalStudents: data.length,
          safeCount: data.filter((s) => s.total_violation_points < 30).length,
          warningCount: data.filter(
            (s) => s.total_violation_points >= 30 && s.total_violation_points < 75
          ).length,
          dangerCount: data.filter((s) => s.total_violation_points >= 75).length,
        };
      }
    } catch (err) {
      console.warn("Supabase summary error, using fallback:", err);
    }
  }

  if (process.env.NODE_ENV !== "development") {
    return {
      totalStudents: 0,
      safeCount: 0,
      warningCount: 0,
      dangerCount: 0,
    };
  }

  return {
    totalStudents: INITIAL_STUDENTS.length,
    safeCount: INITIAL_STUDENTS.filter((s) => s.totalViolationPoints < 30).length,
    warningCount: INITIAL_STUDENTS.filter(
      (s) => s.totalViolationPoints >= 30 && s.totalViolationPoints < 75
    ).length,
    dangerCount: INITIAL_STUDENTS.filter((s) => s.totalViolationPoints >= 75).length,
  };
}

// -------------------------------------------------------------
// GET SISWA TERTIB STATS (ACTIVE STUDENTS WITH VIOLATION POINTS < 50)
// -------------------------------------------------------------

export async function getSiswaTertibStatsAction(): Promise<SiswaTertibStats> {
  if (isSupabaseLive()) {
    try {
      const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY ? createAdminClient() : await createClient();
      const { data, error } = await supabase
        .from("students")
        .select("total_violation_points, status")
        .eq("status", "active");

      if (!error && data) {
        const totalActiveStudents = data.length;
        const totalSiswaTertib = data.filter(
          (s) => Number(s.total_violation_points ?? 0) < 50
        ).length;
        const percentage =
          totalActiveStudents > 0
            ? Math.round((totalSiswaTertib / totalActiveStudents) * 100)
            : 100;

        return {
          totalSiswaTertib,
          totalActiveStudents,
          percentage,
        };
      }
    } catch (err) {
      console.warn("Supabase Siswa Tertib stats fetch fallback:", err);
    }
  }

  if (process.env.NODE_ENV !== "development") {
    return {
      totalSiswaTertib: 0,
      totalActiveStudents: 0,
      percentage: 100,
    };
  }

  const activeStudents = INITIAL_STUDENTS.filter((s) => s.status === "active");
  const totalActiveStudents = activeStudents.length;
  const totalSiswaTertib = activeStudents.filter(
    (s) => Number(s.totalViolationPoints ?? 0) < 50
  ).length;
  const percentage =
    totalActiveStudents > 0
      ? Math.round((totalSiswaTertib / totalActiveStudents) * 100)
      : 100;

  return {
    totalSiswaTertib,
    totalActiveStudents,
    percentage,
  };
}

// -------------------------------------------------------------
// GET STUDENTS (PAGINATED & FILTERED)
// -------------------------------------------------------------

export async function getStudentsAction(
  filter: StudentFilter = {}
): Promise<PaginatedResult<StudentItem>> {
  // Enforce authenticated session & role verification (CRITICAL-02 remediation)
  const session = await requireRole(["admin", "guru", "siswa"]);
  assertRole(session, ["admin", "guru", "siswa"], "mengakses data siswa");
  const isStudentCaller = session.user.role === "siswa";

  const {
    search = "",
    className,
    status,
    pointCategory,
    page = 1,
    pageSize = 10,
    sortBy = "fullName",
    sortOrder = "asc",
  } = filter;

  if (isSupabaseLive()) {
    try {
      const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY ? createAdminClient() : await createClient();
      let query = supabase.from("students").select(
        `
          id,
          profile_id,
          nis,
          nisn,
          class_name,
          gender,
          parent_name,
          parent_phone,
          total_violation_points,
          total_merit_points,
          status,
          created_at,
          profiles:profile_id (
            id,
            email,
            full_name
          )
        `,
        { count: "exact" }
      );

      // Strict tenant isolation: students may only query their own record
      if (isStudentCaller) {
        const safeUserId = sanitizeSearchQuery(session.user.id);
        const safeNis = sanitizeSearchQuery(session.user.nis);
        if (safeNis) {
          query = query.or(`profile_id.eq.${safeUserId},nis.eq.${safeNis}`);
        } else {
          query = query.eq("profile_id", safeUserId);
        }
      }

      if (className && className !== "all") {
        query = query.eq("class_name", className);
      }
      if (status && status !== "all") {
        query = query.eq("status", status);
      }

      if (sortBy === "nisn") {
        query = query.order("nisn", { ascending: sortOrder === "asc" });
      } else if (sortBy === "totalViolationPoints") {
        query = query.order("total_violation_points", {
          ascending: sortOrder === "asc",
        });
      } else if (sortBy === "className") {
        query = query.order("class_name", { ascending: sortOrder === "asc" });
      } else {
        query = query.order("created_at", { ascending: false });
      }

      const { data, count, error } = await query;

      if (!error && data) {
        const items: StudentItem[] = data.map((item: any) => {
          const profile = Array.isArray(item.profiles)
            ? item.profiles[0]
            : item.profiles;

          return {
            id: item.id,
            profileId: item.profile_id,
            nisn: item.nisn || "",
            nis: item.nis,
            fullName: profile?.full_name || "Siswa SMADAP",
            email: profile?.email || `${item.nis}@smadap.sch.id`,
            className: item.class_name,
            gender: item.gender as "L" | "P",
            totalViolationPoints: item.total_violation_points || 0,
            totalMeritPoints: item.total_merit_points || 0,
            status: item.status || "active",
            parentName: item.parent_name,
            parentPhone: item.parent_phone,
            createdAt: item.created_at,
          };
        });

        // Search filtering in memory if joined profile search is needed
        let finalItems = isStudentCaller
          ? items.filter(
              (st) =>
                st.profileId === session.user.id ||
                (session.user.nis && st.nis === session.user.nis)
            )
          : items;
        if (search.trim()) {
          const s = search.toLowerCase();
          finalItems = finalItems.filter(
            (st) =>
              st.fullName.toLowerCase().includes(s) ||
              st.email.toLowerCase().includes(s) ||
              st.nisn.includes(s) ||
              st.nis.includes(s) ||
              st.className.toLowerCase().includes(s)
          );
        }

        if (pointCategory && pointCategory !== "all") {
          if (pointCategory === "safe") {
            finalItems = finalItems.filter((st) => st.totalViolationPoints < 30);
          } else if (pointCategory === "warning") {
            finalItems = finalItems.filter(
              (st) =>
                st.totalViolationPoints >= 30 && st.totalViolationPoints < 75
            );
          } else if (pointCategory === "danger") {
            finalItems = finalItems.filter((st) => st.totalViolationPoints >= 75);
          }
        }

        const totalItems = isStudentCaller ? finalItems.length : (count || finalItems.length);
        const startIndex = (page - 1) * pageSize;
        const paginated = finalItems.slice(startIndex, startIndex + pageSize);

        return {
          items: paginated,
          totalItems,
          page,
          pageSize,
          totalPages: Math.ceil(totalItems / pageSize) || 1,
        };
      }
    } catch (err) {
      console.warn("Supabase student fetch fallback:", err);
    }
  }

  // Filter in-memory fallback list (Development mode only)
  if (process.env.NODE_ENV !== "development") {
    return {
      items: [],
      totalItems: 0,
      page,
      pageSize,
      totalPages: 1,
    };
  }

  let filtered = isStudentCaller
    ? INITIAL_STUDENTS.filter(
        (st) =>
          st.profileId === session.user.id ||
          (session.user.nis && st.nis === session.user.nis)
      )
    : [...INITIAL_STUDENTS];

  if (search.trim()) {
    const s = search.toLowerCase();
    filtered = filtered.filter(
      (st) =>
        st.fullName.toLowerCase().includes(s) ||
        st.email.toLowerCase().includes(s) ||
        st.nisn.includes(s) ||
        st.nis.includes(s) ||
        st.className.toLowerCase().includes(s)
    );
  }

  if (className && className !== "all") {
    filtered = filtered.filter((st) => st.className === className);
  }

  if (status && status !== "all") {
    filtered = filtered.filter((st) => st.status === status);
  }

  if (pointCategory && pointCategory !== "all") {
    if (pointCategory === "safe") {
      filtered = filtered.filter((st) => st.totalViolationPoints < 30);
    } else if (pointCategory === "warning") {
      filtered = filtered.filter(
        (st) => st.totalViolationPoints >= 30 && st.totalViolationPoints < 75
      );
    } else if (pointCategory === "danger") {
      filtered = filtered.filter((st) => st.totalViolationPoints >= 75);
    }
  }

  filtered.sort((a, b) => {
    if (sortBy === "nisn") {
      return sortOrder === "asc"
        ? a.nisn.localeCompare(b.nisn)
        : b.nisn.localeCompare(a.nisn);
    }
    if (sortBy === "className") {
      return sortOrder === "asc"
        ? a.className.localeCompare(b.className)
        : b.className.localeCompare(a.className);
    }
    if (sortBy === "totalViolationPoints") {
      return sortOrder === "asc"
        ? a.totalViolationPoints - b.totalViolationPoints
        : b.totalViolationPoints - a.totalViolationPoints;
    }
    if (sortBy === "email") {
      return sortOrder === "asc"
        ? a.email.localeCompare(b.email)
        : b.email.localeCompare(a.email);
    }
    return sortOrder === "asc"
      ? a.fullName.localeCompare(b.fullName)
      : b.fullName.localeCompare(a.fullName);
  });

  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIndex = (page - 1) * pageSize;
  const paginatedItems = filtered.slice(startIndex, startIndex + pageSize);

  return {
    items: paginatedItems,
    totalItems,
    page,
    pageSize,
    totalPages,
  };
}

// -------------------------------------------------------------
// ADD STUDENT (AUTOMATICALLY CREATE SUPABASE AUTH ACCOUNT)
// -------------------------------------------------------------

export async function addStudentAction(
  rawInput: unknown
): Promise<ActionResponse<{ student: StudentItem; initialPassword: string }>> {
  const authErr = await checkAdminAccess("mendaftarkan siswa baru");
  if (authErr) return authErr;
  const parsed = studentFormSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      message: "Validasi gagal: periksa NISN, NIS, Nama Lengkap, dan format Email.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const data: StudentFormData = parsed.data;
  const initialPassword = data.temporaryPassword || `Siswa${data.nis}!`;

  // Check unique NIS & NISN in memory
  const duplicate = INITIAL_STUDENTS.find(
    (s) => s.nis === data.nis || s.nisn === data.nisn || s.email === data.email
  );
  if (duplicate) {
    return {
      success: false,
      message:
        duplicate.nis === data.nis
          ? `NIS ${data.nis} sudah terdaftar dalam sistem.`
          : duplicate.nisn === data.nisn
          ? `NISN ${data.nisn} sudah terdaftar dalam sistem.`
          : `Email ${data.email} sudah terdaftar dalam sistem.`,
    };
  }

  if (isSupabaseLive()) {
    try {
      const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY ? createAdminClient() : await createClient();

      let profileId: string | null = null;

      if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
        const { data: authData, error: authError } = await (supabase as any).auth.admin.createUser({
          email: data.email,
          password: initialPassword,
          email_confirm: true,
          app_metadata: {
            role: "siswa",
          },
          user_metadata: {
            full_name: data.fullName,
            role: "student",
            nis: data.nis,
            nisn: data.nisn,
            class_name: data.className,
          },
        });

        if (authError || !authData?.user) {
          throw new Error(authError?.message || "Gagal membuat akun login Supabase Auth.");
        }
        profileId = authData.user.id;
      } else {
        const { data: clientAuth, error: signUpError } = await supabase.auth.signUp({
          email: data.email,
          password: initialPassword,
          options: {
            data: {
              full_name: data.fullName,
              role: "student",
              nis: data.nis,
              nisn: data.nisn,
            },
          },
        });

        if (signUpError || !clientAuth?.user) {
          throw new Error(signUpError?.message || "Gagal membuat akun login Supabase Auth.");
        }
        profileId = clientAuth.user.id;
      }

      if (profileId) {
        // 2. Ensure profile entry exists
        await supabase.from("profiles").upsert({
          id: profileId,
          email: data.email,
          full_name: data.fullName,
          role: "student",
        });

        // 3. Create student record
        const { data: newStudent, error: studentError } = await supabase
          .from("students")
          .insert({
            profile_id: profileId,
            nis: data.nis,
            nisn: data.nisn,
            class_name: data.className,
            gender: data.gender,
            parent_name: data.parentName || null,
            parent_phone: data.parentPhone || null,
            total_violation_points: 0,
            total_merit_points: 0,
            status: "active",
          })
          .select()
          .single();

        if (studentError) {
          throw new Error(studentError.message);
        }

        const createdItem: StudentItem = {
          id: newStudent.id,
          profileId,
          nisn: data.nisn,
          nis: data.nis,
          fullName: data.fullName,
          email: data.email,
          className: data.className,
          gender: data.gender,
          totalViolationPoints: 0,
          totalMeritPoints: 0,
          status: "active",
          parentName: data.parentName || null,
          parentPhone: data.parentPhone || null,
          createdAt: new Date().toISOString(),
        };

        safeRevalidatePath("/admin/students");
        return {
          success: true,
          message: `Siswa "${data.fullName}" berhasil ditambahkan dan akun Supabase Auth telah aktif.`,
          data: {
            student: createdItem,
            initialPassword,
          },
        };
      }
    } catch (err: any) {
      console.error("Supabase addStudent failed:", err);
      return {
        success: false,
        message: `Gagal menambahkan siswa ke database Supabase: ${err?.message || "Terjadi kesalahan"}`,
      };
    }
  }

  // In-memory fallback
  const newStudent: StudentItem = {
    id: `stu-${Date.now()}`,
    profileId: `usr-siswa-${Date.now()}`,
    nisn: data.nisn,
    nis: data.nis,
    fullName: data.fullName,
    email: data.email,
    className: data.className,
    gender: data.gender,
    totalViolationPoints: 0,
    totalMeritPoints: 0,
    status: "active",
    parentName: data.parentName || null,
    parentPhone: data.parentPhone || null,
    createdAt: new Date().toISOString().split("T")[0],
  };

  INITIAL_STUDENTS.unshift(newStudent);
  safeRevalidatePath("/admin/students");

  return {
    success: true,
    message: `Siswa "${data.fullName}" berhasil ditambahkan ke database (Akun login: ${data.email}).`,
    data: {
      student: newStudent,
      initialPassword,
    },
  };
}

// -------------------------------------------------------------
// EDIT STUDENT
// -------------------------------------------------------------

export async function editStudentAction(
  studentId: string,
  profileId: string,
  rawInput: unknown
): Promise<ActionResponse<StudentItem>> {
  const authErr = await checkAdminAccess("mengubah data siswa");
  if (authErr) return authErr;
  const parsed = studentFormSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      message: "Validasi edit gagal: periksa kelengkapan form.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;

  if (isSupabaseLive()) {
    try {
      const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY ? createAdminClient() : await createClient();

      // 1. Update profiles table
      await supabase
        .from("profiles")
        .update({
          full_name: data.fullName,
          email: data.email,
        })
        .eq("id", profileId);

      // 2. Update students table
      const { data: updated, error } = await supabase
        .from("students")
        .update({
          nis: data.nis,
          nisn: data.nisn,
          class_name: data.className,
          gender: data.gender,
          parent_name: data.parentName || null,
          parent_phone: data.parentPhone || null,
        })
        .eq("id", studentId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      // Also update Auth email & metadata if admin client is configured
      try {
        await supabase.auth.admin.updateUserById(profileId, {
          email: data.email,
          user_metadata: {
            full_name: data.fullName,
            nis: data.nis,
            nisn: data.nisn,
            class_name: data.className,
          },
        });
      } catch {
        // Continue if admin api is restricted
      }

      const editedItem: StudentItem = {
        id: studentId,
        profileId,
        nisn: data.nisn,
        nis: data.nis,
        fullName: data.fullName,
        email: data.email,
        className: data.className,
        gender: data.gender,
        totalViolationPoints: updated?.total_violation_points || 0,
        totalMeritPoints: updated?.total_merit_points || 0,
        status: updated?.status || "active",
        parentName: data.parentName || null,
        parentPhone: data.parentPhone || null,
        updatedAt: new Date().toISOString(),
      };

      // Sync local in-memory
      INITIAL_STUDENTS = INITIAL_STUDENTS.map((s) =>
        s.id === studentId ? editedItem : s
      );

      safeRevalidatePath("/admin/students");
      return {
        success: true,
        message: `Data siswa "${data.fullName}" berhasil diperbarui.`,
        data: editedItem,
      };
    } catch (err: any) {
      console.warn("Supabase editStudent failed:", err.message);
    }
  }

  // Fallback in-memory update
  const idx = INITIAL_STUDENTS.findIndex((s) => s.id === studentId);
  if (idx === -1) {
    return {
      success: false,
      message: "Data siswa tidak ditemukan di database.",
    };
  }

  const existing = INITIAL_STUDENTS[idx];
  const updatedItem: StudentItem = {
    ...existing,
    nisn: data.nisn,
    nis: data.nis,
    fullName: data.fullName,
    email: data.email,
    className: data.className,
    gender: data.gender,
    parentName: data.parentName || null,
    parentPhone: data.parentPhone || null,
    updatedAt: new Date().toISOString(),
  };

  INITIAL_STUDENTS[idx] = updatedItem;
  safeRevalidatePath("/admin/students");

  return {
    success: true,
    message: `Data siswa "${data.fullName}" berhasil diperbarui.`,
    data: updatedItem,
  };
}

// -------------------------------------------------------------
// DELETE STUDENT
// -------------------------------------------------------------

export async function deleteStudentAction(
  studentId: string,
  profileId: string
): Promise<ActionResponse> {
  const authErr = await checkAdminAccess("menghapus data siswa");
  if (authErr) return authErr;
  if (isSupabaseLive()) {
    try {
      const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY ? createAdminClient() : await createClient();

      // Delete student record
      const { error: studentErr } = await supabase
        .from("students")
        .delete()
        .eq("id", studentId);

      if (studentErr) throw new Error(studentErr.message);

      // Delete auth account
      try {
        await supabase.auth.admin.deleteUser(profileId);
      } catch {
        // Profile cascade or admin delete
      }

      INITIAL_STUDENTS = INITIAL_STUDENTS.filter((s) => s.id !== studentId);
      safeRevalidatePath("/admin/students");
      return {
        success: true,
        message: "Data siswa dan akun login berhasil dihapus.",
      };
    } catch (err: any) {
      console.warn("Supabase delete student error:", err.message);
    }
  }

  INITIAL_STUDENTS = INITIAL_STUDENTS.filter((s) => s.id !== studentId);
  safeRevalidatePath("/admin/students");

  return {
    success: true,
    message: "Data siswa berhasil dihapus dari sistem.",
  };
}

// -------------------------------------------------------------
// RESET PASSWORD
// -------------------------------------------------------------

export async function resetStudentPasswordAction(
  profileId: string,
  newPassword: unknown
): Promise<ActionResponse> {
  const authErr = await checkAdminAccess("mereset password akun siswa");
  if (authErr) return authErr;
  const parsed = resetStudentPasswordSchema.safeParse({ newPassword });
  if (!parsed.success) {
    return {
      success: false,
      message: "Password baru tidak valid (minimal 6 karakter).",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const passwordStr = parsed.data.newPassword;

  if (isSupabaseLive()) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.admin.updateUserById(profileId, {
        password: passwordStr,
      });

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        message: "Password akun siswa berhasil direset di Supabase Auth.",
      };
    } catch (err: any) {
      console.warn("Supabase reset password fallback:", err.message);
    }
  }

  return {
    success: true,
    message: `Password siswa berhasil direset menjadi "${passwordStr}".`,
  };
}

// -------------------------------------------------------------
// UPDATE STUDENT VIOLATION POINTS (CALCULATE & ESCALATE STATUS)
// -------------------------------------------------------------

export async function applyStudentViolationPoints(
  studentId: string,
  addedPoints: number
): Promise<{ previousPoints: number; newPoints: number; newStatus: any } | null> {
  const session = await getCurrentSession();
  if (!session || (session.user.role !== "admin" && session.user.role !== "guru")) {
    return null;
  }
  const idx = INITIAL_STUDENTS.findIndex((s) => s.id === studentId);
  if (idx === -1) return null;

  const prev = INITIAL_STUDENTS[idx];
  const previousPoints = prev.totalViolationPoints;
  const newPoints = previousPoints + addedPoints;

  // Calculate disciplinary status using unified discipline thresholds
  const levelConfig = getDisciplinaryLevel(newPoints);
  const newStatus: any = levelConfig.level === "Aman" ? "active" : levelConfig.level.startsWith("SP1") ? "sp1" : levelConfig.level.startsWith("SP2") ? "sp2" : "sp3";

  INITIAL_STUDENTS[idx] = {
    ...prev,
    totalViolationPoints: newPoints,
    status: newStatus,
    updatedAt: new Date().toISOString(),
  };

  safeRevalidatePath("/admin/students");
  revalidatePath("/guru");
  revalidatePath("/siswa");
  revalidatePath("/");

  return {
    previousPoints,
    newPoints,
    newStatus,
  };
}

// -------------------------------------------------------------
// PUBLIC STUDENT DISCIPLINE SEARCH ACTION (WITHOUT LOGIN)
// -------------------------------------------------------------

export interface PublicStudentSearchResult {
  id: string;
  nis: string;
  nisn: string;
  fullName: string;
  className: string;
  totalViolationPoints: number;
  totalMeritPoints: number;
  status: string;
  statusColor: "emerald" | "amber" | "orange" | "rose";
  recentViolations: {
    id: string;
    incidentDate: string;
    violationName: string;
    points: number;
    reportedBy: string;
  }[];
}

export async function searchStudentPublicAction(
  query: string
): Promise<PublicStudentSearchResult | null> {
  if (!query || typeof query !== "string") return null;

  // 1. Normalize: trim()
  const rawTrimmed = query.trim();
  if (rawTrimmed.length < 2 || rawTrimmed.length > 80) return null;

  // 2. Reject malformed payloads early
  // Disallow SQL operators, control characters, PostgREST delimiters, or comment syntax
  const MALFORMED_PAYLOAD_PATTERN = /[;(),<>=+*`~$^|&{}\\[\]"\\%]|--|\/\*|\*\//;
  if (MALFORMED_PAYLOAD_PATTERN.test(rawTrimmed)) {
    return null;
  }

  // 3. Normalize: lowercase()
  const normalized = rawTrimmed.toLowerCase();

  // 4. Apply sanitizeSearchQuery() before ilike() and or()
  const clean = sanitizeSearchQuery(normalized);
  if (clean.length < 2) return null;

  if (isSupabaseLive()) {
    try {
      const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY
        ? createAdminClient()
        : await createClient();

      // Search student by NIS, NISN, or full_name
      // Query 1: Direct search on students table matching NIS or NISN
      const { data: students } = await supabase
        .from("students")
        .select(
          `
          id,
          nis,
          nisn,
          class_name,
          total_violation_points,
          total_merit_points,
          status,
          profiles:profile_id (full_name)
        `
        )
        .or(`nis.ilike.%${clean}%,nisn.ilike.%${clean}%`)
        .limit(5);

      let matchedStudent: any = students && students.length > 0 ? students[0] : null;

      // Query 2: If not found by nis/nisn, search profiles by full_name (case-insensitive & partial match)
      if (!matchedStudent) {
        const { data: profileMatches } = await supabase
          .from("profiles")
          .select(
            "id, full_name, students(id, nis, nisn, class_name, total_violation_points, total_merit_points, status)"
          )
          .ilike("full_name", `%${clean}%`)
          .limit(5);

        if (profileMatches && profileMatches.length > 0) {
          for (const match of profileMatches) {
            const rawStudent = (match as any).students;
            const studentObj = Array.isArray(rawStudent) ? rawStudent[0] : rawStudent;
            if (studentObj?.id) {
              matchedStudent = {
                id: studentObj.id,
                nis: studentObj.nis,
                nisn: studentObj.nisn,
                class_name: studentObj.class_name,
                total_violation_points: studentObj.total_violation_points,
                total_merit_points: studentObj.total_merit_points,
                status: studentObj.status,
                profiles: { full_name: match.full_name },
              };
              break;
            }
          }
        }
      }

      if (matchedStudent) {
        const points = Number(matchedStudent.total_violation_points || 0);
        const levelConfig = getDisciplinaryLevel(points);
        const fullName =
          (matchedStudent.profiles as any)?.full_name || "Siswa SMAN 2 Pangkep";

        // Fetch recent violations for this student
        const { data: violations } = await supabase
          .from("student_violations")
          .select(
            `
            id,
            incident_date,
            points,
            violation_types:violation_type_id (name),
            teachers:reported_by (profiles:profile_id (full_name))
          `
          )
          .eq("student_id", matchedStudent.id)
          .neq("status", "cancelled")
          .order("incident_date", { ascending: false })
          .limit(3);

        const recentViolations = (violations || []).map((v: any) => ({
          id: v.id,
          incidentDate: v.incident_date,
          violationName: v.violation_types?.name || "Pelanggaran Tata Tertib",
          points: Number(v.points || 0),
          reportedBy: v.teachers?.profiles?.full_name || "Guru Sekolah",
        }));

        return {
          id: matchedStudent.id,
          nis: matchedStudent.nis || "-",
          nisn: matchedStudent.nisn || "-",
          fullName,
          className: matchedStudent.class_name || "Kelas Tidak Diketahui",
          totalViolationPoints: points,
          totalMeritPoints: Number(matchedStudent.total_merit_points || 0),
          status: levelConfig.level,
          statusColor: levelConfig.badgeColor,
          recentViolations,
        };
      }
    } catch (err) {
      console.warn("Public student search error:", err);
    }
  }

  // Fallback lookup only permitted in development mode when Supabase is not configured
  if (process.env.NODE_ENV === "development" && !isSupabaseLive()) {
    const s = clean.toLowerCase();
    const matched = INITIAL_STUDENTS.find(
      (st) =>
        st.fullName.toLowerCase().includes(s) ||
        st.nis.includes(s) ||
        st.nisn.includes(s)
    );

    if (matched) {
      const levelConfig = getDisciplinaryLevel(matched.totalViolationPoints);
      return {
        id: matched.id,
        nis: matched.nis,
        nisn: matched.nisn,
        fullName: matched.fullName,
        className: matched.className,
        totalViolationPoints: matched.totalViolationPoints,
        totalMeritPoints: matched.totalMeritPoints || 0,
        status: levelConfig.level,
        statusColor: levelConfig.badgeColor,
        recentViolations: [],
      };
    }
  }

  return null;
}
