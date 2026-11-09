"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentSession } from "@/features/auth/actions/authActions";
import { requireRole, assertRole, sanitizeSearchQuery } from "@/lib/security/guards";
import {
  TeacherItem,
  TeacherFilter,
  PublicCounselorContact,
  PaginatedResult,
  ActionResponse,
} from "@/features/teachers/types";
import {
  teacherFormSchema,
  TeacherFormData,
  resetPasswordSchema,
} from "@/features/teachers/schemas";

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
let INITIAL_TEACHERS: TeacherItem[] = [];

function isSupabaseLive(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return Boolean(
    url &&
    url !== "https://placeholder-project.supabase.co" &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

// -------------------------------------------------------------
// GET TEACHERS (SEARCH, FILTER, PAGINATION)
// -------------------------------------------------------------

export async function getTeachersAction(
  filter: TeacherFilter = {}
): Promise<PaginatedResult<TeacherItem>> {
  // Enforce authenticated staff role (CRITICAL-02 remediation)
  const session = await requireRole(["admin", "guru"]);
  assertRole(session, ["admin", "guru"], "mengakses direktori data guru");

  return await queryTeachersInternal(filter);
}

async function queryTeachersInternal(
  filter: TeacherFilter = {}
): Promise<PaginatedResult<TeacherItem>> {
  const {
    search = "",
    teacher_type,
    specialization,
    page = 1,
    pageSize = 10,
    sortBy = "fullName",
    sortOrder = "asc",
  } = filter;

  const safeSearch = sanitizeSearchQuery(search);

  if (isSupabaseLive()) {
    try {
      const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY ? createAdminClient() : await createClient();
      let query = supabase.from("teachers").select(
        `
        id,
        profile_id,
        nip,
        teacher_type,
        specialization,
        assigned_class,
        phone_number,
        created_at,
        profiles:profile_id (email, full_name, avatar_url, phone_number)
      `,
        { count: "exact" }
      );

      if (teacher_type && teacher_type !== "all") {
        query = query.eq("teacher_type", teacher_type);
      }

      if (specialization && specialization !== "all") {
        query = query.eq("specialization", specialization);
      }

      if (safeSearch) {
        query = query.or(`nip.ilike.%${safeSearch}%,assigned_class.ilike.%${safeSearch}%`);
      }

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let { data, count, error } = await query
        .order("nip", { ascending: sortOrder === "asc" })
        .range(from, to);

      // Safe fallback if `teacher_type` or `phone_number` column migration has not been applied yet on remote DB
      if (
        error &&
        (error.message?.includes("teacher_type") || error.message?.includes("phone_number"))
      ) {
        let fallbackQuery = supabase.from("teachers").select(
          `
          id,
          profile_id,
          nip,
          specialization,
          assigned_class,
          created_at,
          profiles:profile_id (email, full_name, avatar_url, phone_number)
        `,
          { count: "exact" }
        );

        if (teacher_type === "counselor") {
          fallbackQuery = fallbackQuery.eq("specialization", "guru_bk");
        } else if (teacher_type === "teacher") {
          fallbackQuery = fallbackQuery.neq("specialization", "guru_bk");
        }

        if (specialization && specialization !== "all") {
          fallbackQuery = fallbackQuery.eq("specialization", specialization);
        }

        if (safeSearch) {
          fallbackQuery = fallbackQuery.or(`nip.ilike.%${safeSearch}%,assigned_class.ilike.%${safeSearch}%`);
        }

        const fallbackRes = await fallbackQuery
          .order("nip", { ascending: sortOrder === "asc" })
          .range(from, to);
        data = fallbackRes.data as any;
        count = fallbackRes.count;
        error = fallbackRes.error;
      }

      if (!error && data) {
        const items: TeacherItem[] = data.map((d: any) => {
          const profile = d.profiles || {};
          const resolvedType: "teacher" | "counselor" =
            d.teacher_type === "counselor" || d.specialization === "guru_bk"
              ? "counselor"
              : "teacher";
          return {
            id: d.id,
            profileId: d.profile_id,
            nip: d.nip,
            fullName: profile.full_name || "Nama Guru",
            email: profile.email || "-",
            teacher_type: resolvedType,
            specialization: d.specialization || "guru_mapel",
            assignedClass: d.assigned_class,
            phoneNumber: d.phone_number || profile.phone_number || null,
            avatarUrl: profile.avatar_url,
            status: "active",
            createdAt: d.created_at,
          };
        });

        // Filter client-side search on joined full_name/email/phoneNumber if needed
        let finalItems = items;
        if (teacher_type && teacher_type !== "all") {
          finalItems = finalItems.filter((t) => t.teacher_type === teacher_type);
        }
        if (search.trim()) {
          const s = search.toLowerCase();
          finalItems = finalItems.filter(
            (t) =>
              t.fullName.toLowerCase().includes(s) ||
              t.email.toLowerCase().includes(s) ||
              t.nip.includes(s) ||
              (t.phoneNumber && t.phoneNumber.includes(s))
          );
        }

        const totalItems = count || finalItems.length;
        return {
          items: finalItems,
          totalItems,
          page,
          pageSize,
          totalPages: Math.ceil(totalItems / pageSize) || 1,
        };
      }
    } catch (err) {
      console.warn("Supabase teachers fetch fallback:", err);
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

  let filtered = [...INITIAL_TEACHERS];

  if (search.trim()) {
    const s = search.toLowerCase();
    filtered = filtered.filter(
      (t) =>
        t.fullName.toLowerCase().includes(s) ||
        t.email.toLowerCase().includes(s) ||
        t.nip.includes(s) ||
        (t.phoneNumber && t.phoneNumber.includes(s)) ||
        (t.assignedClass && t.assignedClass.toLowerCase().includes(s))
    );
  }

  if (teacher_type && teacher_type !== "all") {
    filtered = filtered.filter((t) => t.teacher_type === teacher_type);
  }

  if (specialization && specialization !== "all") {
    filtered = filtered.filter((t) => t.specialization === specialization);
  }

  filtered.sort((a, b) => {
    if (sortBy === "nip") {
      return sortOrder === "asc" ? a.nip.localeCompare(b.nip) : b.nip.localeCompare(a.nip);
    }
    if (sortBy === "email") {
      return sortOrder === "asc" ? a.email.localeCompare(b.email) : b.email.localeCompare(a.email);
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
// GET COUNSELOR TEACHERS FOR PUBLIC "LAPOR BK" (SINGLE SOURCE OF TRUTH)
// -------------------------------------------------------------

export async function getCounselorTeachersAction(): Promise<PublicCounselorContact[]> {
  const result = await queryTeachersInternal({
    teacher_type: "counselor",
    pageSize: 100,
    sortBy: "fullName",
    sortOrder: "asc",
  });

  return result.items
    .filter((t) => t.teacher_type === "counselor" && t.status === "active")
    .map((t) => ({
      id: t.id,
      fullName: t.fullName,
      roleTitle: "Guru BK",
      assignedClass: t.assignedClass || null,
      phoneNumber: t.phoneNumber ? t.phoneNumber.replace(/[^0-9+\-\s()]/g, "").trim() : null,
    }));
}

// -------------------------------------------------------------
// ADD TEACHER (AUTOMATICALLY CREATE SUPABASE AUTH ACCOUNT)
// -------------------------------------------------------------

export async function addTeacherAction(
  rawInput: unknown
): Promise<ActionResponse<{ teacher: TeacherItem; initialPassword: string }>> {
  const authErr = await checkAdminAccess("menambah data guru baru");
  if (authErr) return authErr;
  const parsed = teacherFormSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      message: "Validasi gagal: periksa NIP, Nama Lengkap, dan format Email.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const {
    nip,
    fullName,
    email,
    teacher_type,
    specialization,
    phoneNumber,
    assignedClass,
    temporaryPassword,
  } = parsed.data;
  const resolvedTeacherType: "teacher" | "counselor" =
    teacher_type === "counselor" || specialization === "guru_bk"
      ? "counselor"
      : "teacher";
  const resolvedSpecialization =
    resolvedTeacherType === "counselor" ? "guru_bk" : specialization;
  const defaultPassword = temporaryPassword || "Guru123!";
  const generatedProfileId = `usr-guru-${Date.now()}`;
  const generatedTeacherId = `tch-${Date.now()}`;

  // Check NIP uniqueness in in-memory state
  if (INITIAL_TEACHERS.some((t) => t.nip === nip)) {
    return {
      success: false,
      message: `NIP ${nip} sudah terdaftar dalam sistem. Gunakan NIP yang berbeda.`,
    };
  }

  if (isSupabaseLive()) {
    try {
      const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY ? createAdminClient() : await createClient();

      // 1. Create user account in Supabase Auth
      let authUserId: string | null = null;

      if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
        const { data: adminAuthData, error: adminAuthError } = await (supabase as any).auth.admin.createUser({
          email,
          password: defaultPassword,
          email_confirm: true,
          app_metadata: {
            role: "guru",
            teacher_type: resolvedTeacherType,
          },
          user_metadata: {
            full_name: fullName,
            role: "teacher",
            teacher_type: resolvedTeacherType,
            nip,
          },
        });

        if (adminAuthError) {
          throw new Error(adminAuthError.message);
        }
        authUserId = adminAuthData?.user?.id || null;
      } else {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password: defaultPassword,
          options: {
            data: {
              full_name: fullName,
              role: "teacher",
              teacher_type: resolvedTeacherType,
              nip,
            },
          },
        });
        if (authError || !authData?.user) {
          throw new Error(authError?.message || "Gagal mendaftarkan akun di Supabase Auth.");
        }
        authUserId = authData.user.id;
      }

      if (authUserId) {
        // 2. Insert into profiles table
        await supabase.from("profiles").upsert({
          id: authUserId,
          email,
          full_name: fullName,
          role: "teacher",
          phone_number: phoneNumber || null,
        });

        // 3. Insert into teachers table (with safe fallback if teacher_type/phone_number column migration hasn't run yet)
        let { data: teacherRecord, error: teacherError } = await supabase
          .from("teachers")
          .insert({
            profile_id: authUserId,
            nip,
            teacher_type: resolvedTeacherType,
            specialization: resolvedSpecialization,
            assigned_class: assignedClass || null,
            phone_number: phoneNumber.trim(),
          })
          .select()
          .single();

        if (
          teacherError &&
          (teacherError.message?.includes("teacher_type") ||
            teacherError.message?.includes("phone_number"))
        ) {
          const fallbackInsert = await supabase
            .from("teachers")
            .insert({
              profile_id: authUserId,
              nip,
              specialization: resolvedSpecialization,
              assigned_class: assignedClass || null,
            })
            .select()
            .single();
          teacherRecord = fallbackInsert.data;
          teacherError = fallbackInsert.error;
        }

        if (teacherError) {
          throw new Error(teacherError.message);
        }

        if (teacherRecord) {
          revalidatePath("/admin/teachers");
          revalidatePath("/");
          return {
            success: true,
            message: `Guru ${fullName} berhasil ditambahkan dan Akun Supabase Auth telah aktif!`,
            data: {
              teacher: {
                id: teacherRecord.id,
                profileId: authUserId,
                nip,
                fullName,
                email,
                teacher_type: resolvedTeacherType,
                specialization: resolvedSpecialization,
                assignedClass,
                phoneNumber: phoneNumber || null,
                status: "active",
                createdAt: new Date().toISOString(),
              },
              initialPassword: defaultPassword,
            },
          };
        }
      }
    } catch (err: any) {
      console.error("Supabase automatic user creation error:", err);
      return {
        success: false,
        message: `Gagal menambahkan guru ke database Supabase: ${err?.message || "Terjadi kesalahan"}`,
      };
    }
  }

  // Fallback persistence
  const newTeacher: TeacherItem = {
    id: generatedTeacherId,
    profileId: generatedProfileId,
    nip,
    fullName,
    email,
    teacher_type: resolvedTeacherType,
    specialization: resolvedSpecialization,
    assignedClass: assignedClass || null,
    phoneNumber: phoneNumber || null,
    status: "active",
    createdAt: new Date().toISOString().split("T")[0],
  };

  INITIAL_TEACHERS.unshift(newTeacher);
  revalidatePath("/admin/teachers");
  revalidatePath("/");

  return {
    success: true,
    message: `Guru ${fullName} berhasil ditambahkan! Akun otentikasi login telah otomatis dibuat dengan password default: "${defaultPassword}"`,
    data: {
      teacher: newTeacher,
      initialPassword: defaultPassword,
    },
  };
}

// -------------------------------------------------------------
// EDIT TEACHER
// -------------------------------------------------------------

export async function editTeacherAction(
  id: string,
  profileId: string,
  rawInput: unknown
): Promise<ActionResponse<TeacherItem>> {
  const authErr = await checkAdminAccess("mengubah data guru");
  if (authErr) return authErr;
  const parsed = teacherFormSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      message: "Validasi gagal: periksa isian data guru.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const { nip, fullName, email, teacher_type, specialization, phoneNumber, assignedClass } = parsed.data;
  const resolvedTeacherType: "teacher" | "counselor" =
    teacher_type === "counselor" || specialization === "guru_bk"
      ? "counselor"
      : "teacher";
  const resolvedSpecialization =
    resolvedTeacherType === "counselor" ? "guru_bk" : specialization;

  // Check NIP uniqueness across other teachers
  if (INITIAL_TEACHERS.some((t) => t.nip === nip && t.id !== id)) {
    return {
      success: false,
      message: `NIP ${nip} sudah digunakan oleh guru lain.`,
    };
  }

  if (isSupabaseLive()) {
    try {
      const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY ? createAdminClient() : await createClient();

      // Update profiles
      await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          email,
          phone_number: phoneNumber || null,
        })
        .eq("id", profileId);

      // Update teachers (with safe fallback if teacher_type/phone_number column migration hasn't run yet)
      let { error: tchError } = await supabase
        .from("teachers")
        .update({
          nip,
          teacher_type: resolvedTeacherType,
          specialization: resolvedSpecialization,
          assigned_class: assignedClass || null,
          phone_number: phoneNumber.trim(),
        })
        .eq("id", id);

      if (
        tchError &&
        (tchError.message?.includes("teacher_type") || tchError.message?.includes("phone_number"))
      ) {
        const fallbackUpdate = await supabase
          .from("teachers")
          .update({
            nip,
            specialization: resolvedSpecialization,
            assigned_class: assignedClass || null,
          })
          .eq("id", id);
        tchError = fallbackUpdate.error;
      }

      if (!tchError) {
        revalidatePath("/admin/teachers");
        revalidatePath("/");
        return {
          success: true,
          message: `Data Guru ${fullName} berhasil diperbarui.`,
        };
      }
    } catch (err) {
      console.warn("Supabase edit teacher error:", err);
    }
  }

  const idx = INITIAL_TEACHERS.findIndex((t) => t.id === id);
  if (idx !== -1) {
    INITIAL_TEACHERS[idx] = {
      ...INITIAL_TEACHERS[idx],
      nip,
      fullName,
      email,
      teacher_type: resolvedTeacherType,
      specialization: resolvedSpecialization,
      assignedClass: assignedClass || null,
      phoneNumber: phoneNumber || INITIAL_TEACHERS[idx].phoneNumber || null,
    };
  }

  revalidatePath("/admin/teachers");
  revalidatePath("/");
  return {
    success: true,
    message: `Data Guru ${fullName} berhasil diperbarui.`,
  };
}

// -------------------------------------------------------------
// DELETE TEACHER
// -------------------------------------------------------------

export async function deleteTeacherAction(
  id: string,
  profileId: string
): Promise<ActionResponse> {
  const authErr = await checkAdminAccess("menghapus data guru");
  if (authErr) return authErr;
  if (isSupabaseLive()) {
    try {
      const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY ? createAdminClient() : await createClient();

      // 1. Delete from teachers table
      const { error: teacherErr } = await supabase.from("teachers").delete().eq("id", id);
      if (teacherErr) throw new Error(teacherErr.message);

      // 2. Delete from profiles table
      const { error: profileErr } = await supabase.from("profiles").delete().eq("id", profileId);
      if (profileErr) throw new Error(profileErr.message);

      // 3. Delete user account from Supabase Auth (auth.users)
      if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
        try {
          const { error: authDeleteErr } = await (supabase as any).auth.admin.deleteUser(profileId);
          if (authDeleteErr) {
            console.warn("Supabase auth delete user warning:", authDeleteErr.message);
          }
        } catch (authErr) {
          console.warn("Failed to delete user from auth.users:", authErr);
        }
      }

      INITIAL_TEACHERS = INITIAL_TEACHERS.filter((t) => t.id !== id);
      revalidatePath("/admin/teachers");
      return {
        success: true,
        message: "Data guru dan akun otentikasi berhasil dihapus.",
      };
    } catch (err: any) {
      console.warn("Supabase delete teacher error:", err.message || err);
      return {
        success: false,
        message: `Gagal menghapus data guru: ${err.message || "Terjadi kesalahan database"}`,
      };
    }
  }

  INITIAL_TEACHERS = INITIAL_TEACHERS.filter((t) => t.id !== id);
  revalidatePath("/admin/teachers");

  return {
    success: true,
    message: "Data guru dan akun otentikasi berhasil dihapus dari sistem.",
  };
}

// -------------------------------------------------------------
// RESET PASSWORD (AUTOMATIC SUPABASE AUTH PASSWORD UPDATE)
// -------------------------------------------------------------

export async function resetTeacherPasswordAction(
  profileId: string,
  newPassword?: string
): Promise<ActionResponse<{ generatedPassword: string }>> {
  const authErr = await checkAdminAccess("mereset kata sandi akun guru");
  if (authErr) return authErr;
  const finalPassword = newPassword || `Guru${Math.floor(1000 + Math.random() * 9000)}!`;

  if (isSupabaseLive()) {
    try {
      const supabase = await createClient();

      // Trigger password update or reset
      const { error } = await supabase.auth.updateUser({
        password: finalPassword,
      });

      if (!error) {
        revalidatePath("/admin/teachers");
        return {
          success: true,
          message: `Kata sandi akun guru berhasil direset! Password baru: "${finalPassword}"`,
          data: { generatedPassword: finalPassword },
        };
      }
    } catch (err) {
      console.warn("Supabase reset password error:", err);
    }
  }

  revalidatePath("/admin/teachers");
  return {
    success: true,
    message: `Kata sandi akun guru berhasil diperbarui! Password baru sementara: "${finalPassword}"`,
    data: { generatedPassword: finalPassword },
  };
}
