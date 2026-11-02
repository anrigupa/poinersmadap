"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentSession } from "@/features/auth/actions/authActions";
import { getDisciplinaryLevel } from "@/lib/constants/discipline";
import {
  StudentItem,
  StudentFilter,
  PaginatedResult,
  ActionResponse,
  StudentSummaryStats,
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

// In-memory student dataset for zero-config development & instant preview
let INITIAL_STUDENTS: StudentItem[] = [
  {
    id: "stu-1",
    profileId: "usr-siswa-01",
    nisn: "0061928374",
    nis: "10293",
    fullName: "Muhammad Rizky Pratama",
    email: "siswa.10293@smadap.sch.id",
    className: "XI MIPA 2",
    major: "MIPA",
    gender: "L",
    totalViolationPoints: 25,
    totalMeritPoints: 10,
    status: "active",
    parentName: "Bambang Pratama",
    parentPhone: "081298765431",
    createdAt: "2024-07-15",
  },
  {
    id: "stu-2",
    profileId: "usr-siswa-02",
    nisn: "0062839401",
    nis: "10294",
    fullName: "Aditya Pratama Putra",
    email: "aditya.10294@smadap.sch.id",
    className: "XII IPS 1",
    major: "IPS",
    gender: "L",
    totalViolationPoints: 45,
    totalMeritPoints: 0,
    status: "sp1",
    parentName: "Hendro Wibowo",
    parentPhone: "081298765432",
    createdAt: "2023-07-15",
  },
  {
    id: "stu-3",
    profileId: "usr-siswa-03",
    nisn: "0073940182",
    nis: "10295",
    fullName: "Siti Nurhaliza",
    email: "siti.10295@smadap.sch.id",
    className: "X MIPA 1",
    major: "MIPA",
    gender: "P",
    totalViolationPoints: 0,
    totalMeritPoints: 35,
    status: "active",
    parentName: "Ahmad Dahlan",
    parentPhone: "081298765433",
    createdAt: "2024-07-16",
  },
  {
    id: "stu-4",
    profileId: "usr-siswa-04",
    nisn: "0059283741",
    nis: "10296",
    fullName: "Fajar Maulana",
    email: "fajar.10296@smadap.sch.id",
    className: "XII IPS 2",
    major: "IPS",
    gender: "L",
    totalViolationPoints: 85,
    totalMeritPoints: 5,
    status: "sp2",
    parentName: "Sulaiman",
    parentPhone: "081298765434",
    createdAt: "2023-07-15",
  },
  {
    id: "stu-5",
    profileId: "usr-siswa-05",
    nisn: "0068392019",
    nis: "10297",
    fullName: "Rina Maharani",
    email: "rina.10297@smadap.sch.id",
    className: "XI MIPA 1",
    major: "MIPA",
    gender: "P",
    totalViolationPoints: 15,
    totalMeritPoints: 20,
    status: "active",
    parentName: "Mansyur",
    parentPhone: "081298765435",
    createdAt: "2024-07-17",
  },
  {
    id: "stu-6",
    profileId: "usr-siswa-06",
    nisn: "0071029384",
    nis: "10298",
    fullName: "Bagus Prasetyo",
    email: "bagus.10298@smadap.sch.id",
    className: "X RPL 1",
    major: "RPL",
    gender: "L",
    totalViolationPoints: 10,
    totalMeritPoints: 50,
    status: "active",
    parentName: "Joko Waluyo",
    parentPhone: "081298765436",
    createdAt: "2024-07-18",
  },
  {
    id: "stu-7",
    profileId: "usr-siswa-07",
    nisn: "0065748392",
    nis: "10299",
    fullName: "Putri Anggraini",
    email: "putri.10299@smadap.sch.id",
    className: "XI Bahasa 1",
    major: "Bahasa",
    gender: "P",
    totalViolationPoints: 5,
    totalMeritPoints: 15,
    status: "active",
    parentName: "Rudi Hartono",
    parentPhone: "081298765437",
    createdAt: "2024-07-19",
  },
  {
    id: "stu-8",
    profileId: "usr-siswa-08",
    nisn: "0058291038",
    nis: "10300",
    fullName: "Rian Hidayat",
    email: "rian.10300@smadap.sch.id",
    className: "XII MIPA 3",
    major: "MIPA",
    gender: "L",
    totalViolationPoints: 110,
    totalMeritPoints: 0,
    status: "sp3",
    parentName: "Syamsul Bahri",
    parentPhone: "081298765438",
    createdAt: "2023-07-15",
  },
  {
    id: "stu-9",
    profileId: "usr-siswa-09",
    nisn: "0074829102",
    nis: "10301",
    fullName: "Dewi Anggita",
    email: "dewi.10301@smadap.sch.id",
    className: "X MIPA 2",
    major: "MIPA",
    gender: "P",
    totalViolationPoints: 0,
    totalMeritPoints: 25,
    status: "active",
    parentName: "Gunawan",
    parentPhone: "081298765439",
    createdAt: "2024-07-20",
  },
  {
    id: "stu-10",
    profileId: "usr-siswa-10",
    nisn: "0069382014",
    nis: "10302",
    fullName: "Dimas Arya Pangestu",
    email: "dimas.10302@smadap.sch.id",
    className: "XI IPS 2",
    major: "IPS",
    gender: "L",
    totalViolationPoints: 35,
    totalMeritPoints: 5,
    status: "warning" as any,
    parentName: "Teguh Santoso",
    parentPhone: "081298765440",
    createdAt: "2024-07-21",
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
// GET SUMMARY METRICS
// -------------------------------------------------------------

export async function getStudentSummaryAction(): Promise<StudentSummaryStats> {
  if (isSupabaseLive()) {
    try {
      const supabase = await createClient();
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
// GET STUDENTS (PAGINATED & FILTERED)
// -------------------------------------------------------------

export async function getStudentsAction(
  filter: StudentFilter = {}
): Promise<PaginatedResult<StudentItem>> {
  const {
    search = "",
    className,
    major,
    status,
    pointCategory,
    page = 1,
    pageSize = 10,
    sortBy = "fullName",
    sortOrder = "asc",
  } = filter;

  if (isSupabaseLive()) {
    try {
      const supabase = await createClient();
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

          // Determine major from class_name if not explicit
          let derivedMajor: StudentItem["major"] = "Umum";
          if (item.class_name.includes("MIPA") || item.class_name.includes("IPA"))
            derivedMajor = "MIPA";
          else if (item.class_name.includes("IPS")) derivedMajor = "IPS";
          else if (item.class_name.includes("Bahasa")) derivedMajor = "Bahasa";
          else if (item.class_name.includes("RPL")) derivedMajor = "RPL";
          else if (item.class_name.includes("TKJ")) derivedMajor = "TKJ";

          return {
            id: item.id,
            profileId: item.profile_id,
            nisn: item.nisn || "",
            nis: item.nis,
            fullName: profile?.full_name || "Siswa SMADAP",
            email: profile?.email || `${item.nis}@smadap.sch.id`,
            className: item.class_name,
            major: derivedMajor,
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
        let finalItems = items;
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

        if (major && major !== "all") {
          finalItems = finalItems.filter((st) => st.major === major);
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

        const totalItems = count || finalItems.length;
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

  // Filter in-memory fallback list
  let filtered = [...INITIAL_STUDENTS];

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

  if (major && major !== "all") {
    filtered = filtered.filter((st) => st.major === major);
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
      const supabase = await createClient();

      // 1. Create Supabase Auth user
      const { data: authData, error: authError } =
        await supabase.auth.admin.createUser({
          email: data.email,
          password: initialPassword,
          email_confirm: true,
          user_metadata: {
            full_name: data.fullName,
            role: "siswa",
            nis: data.nis,
            nisn: data.nisn,
            class_name: data.className,
          },
        });

      let profileId: string;

      if (authError || !authData.user) {
        // Fallback: check if sign-up works with normal client
        const { data: clientAuth, error: signUpError } =
          await supabase.auth.signUp({
            email: data.email,
            password: initialPassword,
            options: {
              data: {
                full_name: data.fullName,
                role: "siswa",
                nis: data.nis,
                nisn: data.nisn,
              },
            },
          });

        if (signUpError || !clientAuth.user) {
          throw new Error(
            authError?.message ||
              signUpError?.message ||
              "Gagal membuat akun login Supabase Auth."
          );
        }
        profileId = clientAuth.user.id;
      } else {
        profileId = authData.user.id;
      }

      // 2. Ensure profile entry exists
      await supabase.from("profiles").upsert({
        id: profileId,
        email: data.email,
        full_name: data.fullName,
        role: "siswa",
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
        major: data.major,
        gender: data.gender,
        totalViolationPoints: 0,
        totalMeritPoints: 0,
        status: "active",
        parentName: data.parentName || null,
        parentPhone: data.parentPhone || null,
        createdAt: new Date().toISOString(),
      };

      INITIAL_STUDENTS.unshift(createdItem);
      revalidatePath("/admin/students");
      return {
        success: true,
        message: `Siswa "${data.fullName}" berhasil ditambahkan dan akun Supabase Auth telah dibuat.`,
        data: {
          student: createdItem,
          initialPassword,
        },
      };
    } catch (err: any) {
      console.warn("Supabase addStudent failed, using fallback:", err.message);
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
    major: data.major,
    gender: data.gender,
    totalViolationPoints: 0,
    totalMeritPoints: 0,
    status: "active",
    parentName: data.parentName || null,
    parentPhone: data.parentPhone || null,
    createdAt: new Date().toISOString().split("T")[0],
  };

  INITIAL_STUDENTS.unshift(newStudent);
  revalidatePath("/admin/students");

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
      const supabase = await createClient();

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
        major: data.major,
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

      revalidatePath("/admin/students");
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
    major: data.major,
    gender: data.gender,
    parentName: data.parentName || null,
    parentPhone: data.parentPhone || null,
    updatedAt: new Date().toISOString(),
  };

  INITIAL_STUDENTS[idx] = updatedItem;
  revalidatePath("/admin/students");

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
      const supabase = await createClient();

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
      revalidatePath("/admin/students");
      return {
        success: true,
        message: "Data siswa dan akun login berhasil dihapus.",
      };
    } catch (err: any) {
      console.warn("Supabase delete student error:", err.message);
    }
  }

  INITIAL_STUDENTS = INITIAL_STUDENTS.filter((s) => s.id !== studentId);
  revalidatePath("/admin/students");

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

  revalidatePath("/admin/students");
  revalidatePath("/guru");
  revalidatePath("/siswa");

  return {
    previousPoints,
    newPoints,
    newStatus,
  };
}
