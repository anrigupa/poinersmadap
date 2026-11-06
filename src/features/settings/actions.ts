"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentSession } from "@/features/auth/actions/authActions";
import {
  AcademicSettingItem,
  SemesterOption,
  SettingsActionResponse,
  SystemSettingsData,
} from "@/features/settings/types";
import {
  academicSettingsSchema,
  AcademicSettingsFormData,
  createAcademicPeriodSchema,
  CreateAcademicPeriodFormData,
} from "@/features/settings/schemas";

// Initial Academic Year History & Active Configuration
let SERVER_ACADEMIC_SETTINGS: AcademicSettingItem[] = [
  {
    id: "acad-2024-2025-ganjil",
    academicYear: "2024/2025",
    semester: "Ganjil",
    isActive: false,
    createdAt: "2024-07-01T08:00:00.000Z",
    updatedAt: "2024-12-20T16:00:00.000Z",
    updatedBy: "Drs. H. Bambang Prakoso, M.Pd",
  },
  {
    id: "acad-2024-2025-genap",
    academicYear: "2024/2025",
    semester: "Genap",
    isActive: false,
    createdAt: "2025-01-06T08:00:00.000Z",
    updatedAt: "2025-06-21T16:00:00.000Z",
    updatedBy: "Drs. H. Bambang Prakoso, M.Pd",
  },
  {
    id: "acad-2025-2026-ganjil",
    academicYear: "2025/2026",
    semester: "Ganjil",
    isActive: false,
    createdAt: "2025-07-07T08:00:00.000Z",
    updatedAt: "2025-12-19T16:00:00.000Z",
    updatedBy: "Drs. H. Bambang Prakoso, M.Pd",
  },
  {
    id: "acad-2025-2026-genap",
    academicYear: "2025/2026",
    semester: "Genap",
    isActive: false,
    createdAt: "2026-01-05T08:00:00.000Z",
    updatedAt: "2026-06-20T16:00:00.000Z",
    updatedBy: "Drs. H. Bambang Prakoso, M.Pd",
  },
  {
    id: "acad-2026-2027-ganjil",
    academicYear: "2026/2027",
    semester: "Ganjil",
    isActive: true,
    createdAt: "2026-07-06T08:00:00.000Z",
    updatedAt: new Date().toISOString(),
    updatedBy: "Drs. H. Bambang Prakoso, M.Pd",
  },
  {
    id: "acad-2026-2027-genap",
    academicYear: "2026/2027",
    semester: "Genap",
    isActive: false,
    createdAt: "2026-07-06T08:00:00.000Z",
    updatedAt: "2026-07-06T08:00:00.000Z",
    updatedBy: "Drs. H. Bambang Prakoso, M.Pd",
  },
  {
    id: "acad-2027-2028-ganjil",
    academicYear: "2027/2028",
    semester: "Ganjil",
    isActive: false,
    createdAt: "2026-11-01T08:00:00.000Z",
    updatedAt: "2026-11-01T08:00:00.000Z",
    updatedBy: "Drs. H. Bambang Prakoso, M.Pd",
  },
  {
    id: "acad-2028-2029-ganjil",
    academicYear: "2028/2029",
    semester: "Ganjil",
    isActive: false,
    createdAt: "2026-11-01T08:00:00.000Z",
    updatedAt: "2026-11-01T08:00:00.000Z",
    updatedBy: "Drs. H. Bambang Prakoso, M.Pd",
  },
  {
    id: "acad-2029-2030-ganjil",
    academicYear: "2029/2030",
    semester: "Ganjil",
    isActive: false,
    createdAt: "2026-11-01T08:00:00.000Z",
    updatedAt: "2026-11-01T08:00:00.000Z",
    updatedBy: "Drs. H. Bambang Prakoso, M.Pd",
  },
];

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return Boolean(
    url &&
      url !== "https://placeholder-project.supabase.co" &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

/**
 * Sorts academic periods with the active period prioritized or reverse-chronological order,
 * and enforces the invariant that strictly ONE record has isActive === true.
 */
function enforceSingleActiveAndSort(
  items: AcademicSettingItem[]
): AcademicSettingItem[] {
  let activeFound = false;
  const normalized = items.map((item) => {
    if (item.isActive && !activeFound) {
      activeFound = true;
      return { ...item, isActive: true };
    }
    return { ...item, isActive: false };
  });

  if (!activeFound && normalized.length > 0) {
    const defaultTarget =
      normalized.find(
        (i) => i.academicYear === "2026/2027" && i.semester === "Ganjil"
      ) || normalized[0];
    defaultTarget.isActive = true;
  }

  return normalized.sort((a, b) => {
    if (a.academicYear !== b.academicYear) {
      return b.academicYear.localeCompare(a.academicYear);
    }
    return a.semester === "Genap" ? -1 : 1;
  });
}

function revalidateAllPortals() {
  revalidatePath("/", "layout");
  revalidatePath("/admin");
  revalidatePath("/admin/settings");
  revalidatePath("/admin/students");
  revalidatePath("/admin/teachers");
  revalidatePath("/admin/rules");
  revalidatePath("/guru");
  revalidatePath("/siswa");
}

/**
 * Helper to persist current Academic Settings list to Supabase (table + admin metadata backup).
 */
async function persistSettingsToSupabase(
  settingsList: AcademicSettingItem[],
  adminEmail?: string,
  adminName?: string
) {
  if (!isSupabaseConfigured()) return;

  const activeItem =
    settingsList.find((s) => s.isActive) || settingsList[0];

  try {
    const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY
      ? createAdminClient()
      : await createClient();

    // 1. Attempt to sync with public.academic_settings table
    const { error: deactivateError } = await supabase
      .from("academic_settings")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq("is_active", true);

    if (!deactivateError) {
      const upsertRows = settingsList.map((item) => ({
        academic_year: item.academicYear,
        semester: item.semester,
        is_active: item.isActive,
        created_at: item.createdAt,
        updated_at: item.updatedAt,
      }));

      await supabase
        .from("academic_settings")
        .upsert(upsertRows, { onConflict: "academic_year,semester" });
    }

    // 2. Also sync to Supabase Auth Admin user metadata for instant persistence even before SQL migration
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const adminClient = createAdminClient();
      const { data: usersData } = await adminClient.auth.admin.listUsers({
        page: 1,
        perPage: 50,
      });
      const targetUser =
        (adminEmail &&
          usersData?.users?.find((u) => u.email === adminEmail)) ||
        usersData?.users?.[0];

      if (targetUser) {
        await adminClient.auth.admin.updateUserById(targetUser.id, {
          user_metadata: {
            ...targetUser.user_metadata,
            system_academic_year: activeItem.academicYear,
            system_semester: activeItem.semester,
            system_settings_updated_at: activeItem.updatedAt,
            system_settings_updated_by:
              adminName || activeItem.updatedBy || "Administrator",
            system_academic_history: settingsList,
          },
        });
      }
    }
  } catch (err) {
    console.error("Supabase academic_settings sync warning:", err);
  }
}

/**
 * Server Action: Fetches the active Academic Year, Semester, and full Academic Year History.
 */
export async function getSystemSettingsAction(): Promise<SystemSettingsData> {
  if (!isSupabaseConfigured()) {
    const sorted = enforceSingleActiveAndSort(SERVER_ACADEMIC_SETTINGS);
    SERVER_ACADEMIC_SETTINGS = sorted;
    return {
      activeSetting: sorted.find((s) => s.isActive) || sorted[0],
      allSettings: sorted,
      dataSource: "demo_fallback",
    };
  }

  try {
    const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY
      ? createAdminClient()
      : await createClient();

    // 1. Query public.academic_settings table in Supabase
    const { data, error } = await supabase
      .from("academic_settings")
      .select("id, academic_year, semester, is_active, created_at, updated_at")
      .order("academic_year", { ascending: false });

    if (!error && data && data.length > 0) {
      const mapped: AcademicSettingItem[] = data.map((row: any) => ({
        id: row.id,
        academicYear: row.academic_year,
        semester: (row.semester === "Genap" ? "Genap" : "Ganjil") as SemesterOption,
        isActive: Boolean(row.is_active),
        createdAt: row.created_at || new Date().toISOString(),
        updatedAt: row.updated_at || new Date().toISOString(),
        updatedBy: "Administrator",
      }));

      const sorted = enforceSingleActiveAndSort(mapped);
      SERVER_ACADEMIC_SETTINGS = sorted;
      return {
        activeSetting: sorted.find((s) => s.isActive) || sorted[0],
        allSettings: sorted,
        dataSource: "supabase_live",
      };
    }

    // 2. Fallback to Supabase Auth Admin metadata if table is not yet created
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const adminClient = createAdminClient();
      const { data: usersData } = await adminClient.auth.admin.listUsers({
        page: 1,
        perPage: 50,
      });

      const userWithConfig = usersData?.users?.find(
        (u) =>
          u.user_metadata?.system_academic_history ||
          u.user_metadata?.system_academic_year
      );

      if (userWithConfig?.user_metadata) {
        const savedHistory = userWithConfig.user_metadata
          .system_academic_history as AcademicSettingItem[] | undefined;

        if (Array.isArray(savedHistory) && savedHistory.length > 0) {
          const sorted = enforceSingleActiveAndSort(savedHistory);
          SERVER_ACADEMIC_SETTINGS = sorted;
          return {
            activeSetting: sorted.find((s) => s.isActive) || sorted[0],
            allSettings: sorted,
            dataSource: "supabase_live",
          };
        }

        const metaYear = userWithConfig.user_metadata.system_academic_year as string;
        const metaSem = (
          userWithConfig.user_metadata.system_semester === "Genap"
            ? "Genap"
            : "Ganjil"
        ) as SemesterOption;
        const metaUpdated =
          userWithConfig.user_metadata.system_settings_updated_at ||
          new Date().toISOString();
        const metaUpdatedBy =
          userWithConfig.user_metadata.system_settings_updated_by ||
          "Administrator";

        if (metaYear) {
          const updated = SERVER_ACADEMIC_SETTINGS.map((item) => ({
            ...item,
            isActive:
              item.academicYear === metaYear && item.semester === metaSem,
            updatedAt:
              item.academicYear === metaYear && item.semester === metaSem
                ? metaUpdated
                : item.updatedAt,
            updatedBy:
              item.academicYear === metaYear && item.semester === metaSem
                ? metaUpdatedBy
                : item.updatedBy,
          }));

          const hasExactMatch = updated.some((i) => i.isActive);
          if (!hasExactMatch) {
            updated.unshift({
              id: `acad-${metaYear.replace("/", "-")}-${metaSem.toLowerCase()}`,
              academicYear: metaYear,
              semester: metaSem,
              isActive: true,
              createdAt: metaUpdated,
              updatedAt: metaUpdated,
              updatedBy: metaUpdatedBy,
            });
          }

          const sorted = enforceSingleActiveAndSort(updated);
          SERVER_ACADEMIC_SETTINGS = sorted;
          return {
            activeSetting: sorted.find((s) => s.isActive) || sorted[0],
            allSettings: sorted,
            dataSource: "supabase_live",
          };
        }
      }
    }

    const sorted = enforceSingleActiveAndSort(SERVER_ACADEMIC_SETTINGS);
    SERVER_ACADEMIC_SETTINGS = sorted;
    return {
      activeSetting: sorted.find((s) => s.isActive) || sorted[0],
      allSettings: sorted,
      dataSource: "supabase_live",
    };
  } catch (err) {
    console.error("Failed to fetch system settings from Supabase:", err);
    const sorted = enforceSingleActiveAndSort(SERVER_ACADEMIC_SETTINGS);
    return {
      activeSetting: sorted.find((s) => s.isActive) || sorted[0],
      allSettings: sorted,
      dataSource: "demo_fallback",
    };
  }
}

/**
 * Server Action: Sets the active Academic Year & Semester.
 * Prevents duplicate active academic years by deactivating all other records.
 */
export async function updateAcademicSettingsAction(
  formData: AcademicSettingsFormData
): Promise<SettingsActionResponse> {
  const session = await getCurrentSession();
  if (!session || session.user.role !== "admin") {
    return {
      success: false,
      message:
        "Akses ditolak: Hanya Administrator yang berhak mengubah konfigurasi tahun ajaran.",
    };
  }

  const parsed = academicSettingsSchema.safeParse(formData);
  if (!parsed.success) {
    return {
      success: false,
      message:
        parsed.error.issues[0]?.message || "Data konfigurasi tidak valid.",
    };
  }

  const { academicYear, semester } = parsed.data;
  const nowIso = new Date().toISOString();
  const adminName = session.user.fullName || "Administrator";

  // Check if (academicYear, semester) already exists in history
  const existingIndex = SERVER_ACADEMIC_SETTINGS.findIndex(
    (s) => s.academicYear === academicYear && s.semester === semester
  );

  let nextList: AcademicSettingItem[];
  if (existingIndex >= 0) {
    nextList = SERVER_ACADEMIC_SETTINGS.map((item, idx) => ({
      ...item,
      isActive: idx === existingIndex,
      updatedAt: idx === existingIndex ? nowIso : item.updatedAt,
      updatedBy: idx === existingIndex ? adminName : item.updatedBy,
    }));
  } else {
    const newItem: AcademicSettingItem = {
      id: `acad-${academicYear.replace("/", "-")}-${semester.toLowerCase()}`,
      academicYear,
      semester,
      isActive: true,
      createdAt: nowIso,
      updatedAt: nowIso,
      updatedBy: adminName,
    };
    nextList = [
      newItem,
      ...SERVER_ACADEMIC_SETTINGS.map((item) => ({
        ...item,
        isActive: false,
      })),
    ];
  }

  // Strictly enforce single active academic year
  const sorted = enforceSingleActiveAndSort(nextList);
  const activeCount = sorted.filter((s) => s.isActive).length;
  if (activeCount !== 1) {
    return {
      success: false,
      message:
        "Validasi gagal: Tidak boleh ada duplikasi Tahun Ajaran aktif secara bersamaan.",
    };
  }

  SERVER_ACADEMIC_SETTINGS = sorted;
  await persistSettingsToSupabase(sorted, session.user.email, adminName);
  revalidateAllPortals();

  return {
    success: true,
    message: `Periode Akademik ${academicYear} (Semester ${semester}) berhasil diaktifkan. Periode sebelumnya telah dinonaktifkan secara otomatis.`,
    data: {
      activeSetting: sorted.find((s) => s.isActive) || sorted[0],
      allSettings: sorted,
      dataSource: isSupabaseConfigured() ? "supabase_live" : "demo_fallback",
    },
  };
}

/**
 * Server Action: Adds a new Academic Year & Semester entry into academic_settings history.
 * Prevents duplicate (academic_year, semester) entries and duplicate active states.
 */
export async function createAcademicPeriodAction(
  formData: CreateAcademicPeriodFormData
): Promise<SettingsActionResponse> {
  const session = await getCurrentSession();
  if (!session || session.user.role !== "admin") {
    return {
      success: false,
      message:
        "Akses ditolak: Hanya Administrator yang berhak menambahkan periode tahun ajaran.",
    };
  }

  const parsed = createAcademicPeriodSchema.safeParse(formData);
  if (!parsed.success) {
    return {
      success: false,
      message:
        parsed.error.issues[0]?.message || "Format Tahun Ajaran tidak valid.",
    };
  }

  const { academicYear, semester, setAsActive } = parsed.data;
  const [startYear, endYear] = academicYear.split("/").map(Number);
  if (endYear !== startYear + 1) {
    return {
      success: false,
      message: `Format rentang tahun tidak valid (${academicYear}). Tahun akhir harus selisih 1 tahun dari tahun awal (contoh: 2026/2027).`,
    };
  }

  // Prevent duplicate (academic_year, semester) in history
  const duplicateExists = SERVER_ACADEMIC_SETTINGS.some(
    (s) => s.academicYear === academicYear && s.semester === semester
  );
  if (duplicateExists) {
    return {
      success: false,
      message: `Periode Tahun Ajaran ${academicYear} Semester ${semester} sudah terdaftar di dalam riwayat sistem.`,
    };
  }

  const nowIso = new Date().toISOString();
  const adminName = session.user.fullName || "Administrator";

  const newEntry: AcademicSettingItem = {
    id: `acad-${academicYear.replace("/", "-")}-${semester.toLowerCase()}-${Date.now()}`,
    academicYear,
    semester,
    isActive: setAsActive,
    createdAt: nowIso,
    updatedAt: nowIso,
    updatedBy: adminName,
  };

  const nextList = [
    newEntry,
    ...SERVER_ACADEMIC_SETTINGS.map((item) => ({
      ...item,
      isActive: setAsActive ? false : item.isActive,
    })),
  ];

  const sorted = enforceSingleActiveAndSort(nextList);
  SERVER_ACADEMIC_SETTINGS = sorted;

  await persistSettingsToSupabase(sorted, session.user.email, adminName);
  revalidateAllPortals();

  return {
    success: true,
    message: setAsActive
      ? `Tahun Ajaran ${academicYear} (${semester}) berhasil ditambahkan dan ditetapkan sebagai periode Aktif.`
      : `Tahun Ajaran ${academicYear} (${semester}) berhasil ditambahkan ke riwayat akademik.`,
    data: {
      activeSetting: sorted.find((s) => s.isActive) || sorted[0],
      allSettings: sorted,
      dataSource: isSupabaseConfigured() ? "supabase_live" : "demo_fallback",
    },
  };
}

/**
 * Server Action: Activates a specific Academic Year & Semester record from history by ID.
 * Atomically deactivates all other records to prevent duplicate active academic years.
 */
export async function activateAcademicPeriodByIdAction(
  id: string
): Promise<SettingsActionResponse> {
  const session = await getCurrentSession();
  if (!session || session.user.role !== "admin") {
    return {
      success: false,
      message:
        "Akses ditolak: Hanya Administrator yang berhak mengaktifkan periode tahun ajaran.",
    };
  }

  const target = SERVER_ACADEMIC_SETTINGS.find((s) => s.id === id);
  if (!target) {
    return {
      success: false,
      message: "Data periode tahun ajaran tidak ditemukan.",
    };
  }

  if (target.isActive) {
    return {
      success: false,
      message: `Periode ${target.academicYear} (Semester ${target.semester}) sudah berstatus Aktif.`,
    };
  }

  const nowIso = new Date().toISOString();
  const adminName = session.user.fullName || "Administrator";

  const nextList = SERVER_ACADEMIC_SETTINGS.map((item) => ({
    ...item,
    isActive: item.id === id,
    updatedAt: item.id === id ? nowIso : item.updatedAt,
    updatedBy: item.id === id ? adminName : item.updatedBy,
  }));

  const sorted = enforceSingleActiveAndSort(nextList);
  SERVER_ACADEMIC_SETTINGS = sorted;

  await persistSettingsToSupabase(sorted, session.user.email, adminName);
  revalidateAllPortals();

  return {
    success: true,
    message: `Periode Tahun Ajaran ${target.academicYear} (Semester ${target.semester}) kini aktif. Periode aktif sebelumnya telah dinonaktifkan.`,
    data: {
      activeSetting: sorted.find((s) => s.isActive) || sorted[0],
      allSettings: sorted,
      dataSource: isSupabaseConfigured() ? "supabase_live" : "demo_fallback",
    },
  };
}

/**
 * Server Action: Deletes an inactive Academic Year period from history.
 * Active academic periods cannot be deleted.
 */
export async function deleteAcademicPeriodAction(
  id: string
): Promise<SettingsActionResponse> {
  const session = await getCurrentSession();
  if (!session || session.user.role !== "admin") {
    return {
      success: false,
      message:
        "Akses ditolak: Hanya Administrator yang berhak menghapus riwayat tahun ajaran.",
    };
  }

  const target = SERVER_ACADEMIC_SETTINGS.find((s) => s.id === id);
  if (!target) {
    return {
      success: false,
      message: "Data periode tahun ajaran tidak ditemukan.",
    };
  }

  if (target.isActive) {
    return {
      success: false,
      message:
        "Tidak dapat menghapus Tahun Ajaran yang sedang Aktif. Aktifkan periode lain terlebih dahulu.",
    };
  }

  const nowIso = new Date().toISOString();
  const nextList = SERVER_ACADEMIC_SETTINGS.filter((s) => s.id !== id);
  const sorted = enforceSingleActiveAndSort(nextList);
  SERVER_ACADEMIC_SETTINGS = sorted;

  if (isSupabaseConfigured()) {
    try {
      const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY
        ? createAdminClient()
        : await createClient();
      await supabase
        .from("academic_settings")
        .delete()
        .eq("academic_year", target.academicYear)
        .eq("semester", target.semester)
        .eq("is_active", false);
    } catch {
      // Ignore if table not created yet
    }
  }

  await persistSettingsToSupabase(
    sorted,
    session.user.email,
    session.user.fullName
  );
  revalidateAllPortals();

  return {
    success: true,
    message: `Periode Tahun Ajaran ${target.academicYear} (Semester ${target.semester}) berhasil dihapus dari riwayat.`,
    data: {
      activeSetting: sorted.find((s) => s.isActive) || sorted[0],
      allSettings: sorted,
      dataSource: isSupabaseConfigured() ? "supabase_live" : "demo_fallback",
    },
  };
}
