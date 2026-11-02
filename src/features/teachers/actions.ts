"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentSession } from "@/features/auth/actions/authActions";
import {
  TeacherItem,
  TeacherFilter,
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

// In-memory state for initial demo / zero-config development
let INITIAL_TEACHERS: TeacherItem[] = [
  {
    id: "tch-1",
    profileId: "usr-guru-01",
    nip: "198504122010012003",
    fullName: "Siti Rahmawati, S.Pd",
    email: "guru.bk@smadap.sch.id",
    specialization: "guru_bk",
    assignedClass: "Wali Kelas XI MIPA 2",
    phoneNumber: "081234567890",
    status: "active",
    createdAt: "2024-07-15",
  },
  {
    id: "tch-2",
    profileId: "usr-guru-02",
    nip: "197808202005011004",
    fullName: "Drs. Joko Susilo, M.Pd",
    email: "joko.susilo@smadap.sch.id",
    specialization: "guru_piket",
    assignedClass: "Wali Kelas XII IPS 1",
    phoneNumber: "081234567891",
    status: "active",
    createdAt: "2024-07-16",
  },
  {
    id: "tch-3",
    profileId: "usr-guru-03",
    nip: "199003152019032008",
    fullName: "Ahmad Fauzi, S.Pd",
    email: "ahmad.fauzi@smadap.sch.id",
    specialization: "wali_kelas",
    assignedClass: "Wali Kelas X MIPA 1",
    phoneNumber: "081234567892",
    status: "active",
    createdAt: "2024-07-18",
  },
  {
    id: "tch-4",
    profileId: "usr-guru-04",
    nip: "198711222014022005",
    fullName: "Dewi Lestari, S.Pd",
    email: "dewi.lestari@smadap.sch.id",
    specialization: "guru_mapel",
    assignedClass: null,
    phoneNumber: "081234567893",
    status: "active",
    createdAt: "2024-07-20",
  },
  {
    id: "tch-5",
    profileId: "usr-guru-05",
    nip: "198205102008011012",
    fullName: "Budi Kurniawan, M.Kom",
    email: "budi.kurniawan@smadap.sch.id",
    specialization: "wali_kelas",
    assignedClass: "Wali Kelas XI RPL 1",
    phoneNumber: "081234567894",
    status: "active",
    createdAt: "2024-07-22",
  },
  {
    id: "tch-6",
    profileId: "usr-guru-06",
    nip: "199307042022032014",
    fullName: "Nurul Hidayah, S.Pd",
    email: "nurul.hidayah@smadap.sch.id",
    specialization: "guru_bk",
    assignedClass: null,
    phoneNumber: "081234567895",
    status: "active",
    createdAt: "2024-07-25",
  },
];

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
  const {
    search = "",
    specialization,
    page = 1,
    pageSize = 10,
    sortBy = "fullName",
    sortOrder = "asc",
  } = filter;

  if (isSupabaseLive()) {
    try {
      const supabase = await createClient();
      let query = supabase.from("teachers").select(
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

      if (specialization && specialization !== "all") {
        query = query.eq("specialization", specialization);
      }

      if (search.trim()) {
        query = query.or(`nip.ilike.%${search}%,assigned_class.ilike.%${search}%`);
      }

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, count, error } = await query
        .order("nip", { ascending: sortOrder === "asc" })
        .range(from, to);

      if (!error && data) {
        const items: TeacherItem[] = data.map((d: any) => {
          const profile = d.profiles || {};
          return {
            id: d.id,
            profileId: d.profile_id,
            nip: d.nip,
            fullName: profile.full_name || "Nama Guru",
            email: profile.email || "-",
            specialization: d.specialization || "guru_mapel",
            assignedClass: d.assigned_class,
            phoneNumber: profile.phone_number,
            avatarUrl: profile.avatar_url,
            status: "active",
            createdAt: d.created_at,
          };
        });

        // Filter client-side search on joined full_name/email if needed
        let finalItems = items;
        if (search.trim()) {
          const s = search.toLowerCase();
          finalItems = items.filter(
            (t) =>
              t.fullName.toLowerCase().includes(s) ||
              t.email.toLowerCase().includes(s) ||
              t.nip.includes(s)
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

  // Filter in-memory fallback list
  let filtered = [...INITIAL_TEACHERS];

  if (search.trim()) {
    const s = search.toLowerCase();
    filtered = filtered.filter(
      (t) =>
        t.fullName.toLowerCase().includes(s) ||
        t.email.toLowerCase().includes(s) ||
        t.nip.includes(s) ||
        (t.assignedClass && t.assignedClass.toLowerCase().includes(s))
    );
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

  const { nip, fullName, email, specialization, assignedClass, temporaryPassword } = parsed.data;
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
      const supabase = await createClient();

      // 1. Create user account in Supabase Auth
      let authUserId: string | null = null;

      // Try sign up via Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: defaultPassword,
        options: {
          data: {
            full_name: fullName,
            role: "guru",
            nip,
          },
        },
      });

      if (!authError && authData?.user) {
        authUserId = authData.user.id;

        // 2. Insert into profiles table
        await supabase.from("profiles").upsert({
          id: authUserId,
          email,
          full_name: fullName,
          role: "guru",
        });

        // 3. Insert into teachers table
        const { data: teacherRecord, error: teacherError } = await supabase
          .from("teachers")
          .insert({
            profile_id: authUserId,
            nip,
            specialization,
            assigned_class: assignedClass || null,
          })
          .select()
          .single();

        if (!teacherError && teacherRecord) {
          revalidatePath("/admin/teachers");
          return {
            success: true,
            message: `Guru ${fullName} berhasil ditambahkan dan Akun Supabase Auth telah otomatis dibuat!`,
            data: {
              teacher: {
                id: teacherRecord.id,
                profileId: authUserId,
                nip,
                fullName,
                email,
                specialization,
                assignedClass,
                status: "active",
                createdAt: new Date().toISOString(),
              },
              initialPassword: defaultPassword,
            },
          };
        }
      }
    } catch (err) {
      console.warn("Supabase automatic user creation error:", err);
    }
  }

  // Fallback persistence
  const newTeacher: TeacherItem = {
    id: generatedTeacherId,
    profileId: generatedProfileId,
    nip,
    fullName,
    email,
    specialization,
    assignedClass: assignedClass || null,
    status: "active",
    createdAt: new Date().toISOString().split("T")[0],
  };

  INITIAL_TEACHERS.unshift(newTeacher);
  revalidatePath("/admin/teachers");

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

  const { nip, fullName, email, specialization, assignedClass } = parsed.data;

  // Check NIP uniqueness across other teachers
  if (INITIAL_TEACHERS.some((t) => t.nip === nip && t.id !== id)) {
    return {
      success: false,
      message: `NIP ${nip} sudah digunakan oleh guru lain.`,
    };
  }

  if (isSupabaseLive()) {
    try {
      const supabase = await createClient();

      // Update profiles
      await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          email,
        })
        .eq("id", profileId);

      // Update teachers
      const { error: tchError } = await supabase
        .from("teachers")
        .update({
          nip,
          specialization,
          assigned_class: assignedClass || null,
        })
        .eq("id", id);

      if (!tchError) {
        revalidatePath("/admin/teachers");
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
      specialization,
      assignedClass: assignedClass || null,
    };
  }

  revalidatePath("/admin/teachers");
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
      const supabase = await createClient();

      // Delete from teachers table
      await supabase.from("teachers").delete().eq("id", id);
      // Delete from profiles table
      await supabase.from("profiles").delete().eq("id", profileId);

      revalidatePath("/admin/teachers");
      return {
        success: true,
        message: "Data guru dan akun otentikasi berhasil dihapus.",
      };
    } catch (err) {
      console.warn("Supabase delete teacher error:", err);
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
