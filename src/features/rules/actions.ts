"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentSession } from "@/features/auth/actions/authActions";
import {
  ViolationCategory,
  ViolationItem,
  ViolationFilter,
  PaginatedResult,
  ActionResponse,
} from "@/features/rules/types";
import {
  categorySchema,
  CategoryFormData,
  violationSchema,
  ViolationFormData,
} from "@/features/rules/schemas";

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

// In-memory persistent state for zero-config / offline development
let INITIAL_CATEGORIES: ViolationCategory[] = [
  {
    id: "cat-1",
    name: "Ringan",
    severityLevel: 1,
    description: "Pelanggaran kedisiplinan dan kerapian skala minor",
    colorCode: "#3b82f6", // Blue
    itemCount: 4,
  },
  {
    id: "cat-2",
    name: "Sedang",
    severityLevel: 2,
    description: "Pelanggaran tata tertib pembelajaran & fasilitas sekolah",
    colorCode: "#f59e0b", // Amber
    itemCount: 4,
  },
  {
    id: "cat-3",
    name: "Berat",
    severityLevel: 3,
    description: "Pelanggaran moralitas, keamanan, dan norma hukum",
    colorCode: "#ef4444", // Red
    itemCount: 3,
  },
];

let INITIAL_VIOLATIONS: ViolationItem[] = [
  {
    id: "v-1",
    categoryId: "cat-1",
    categoryName: "Ringan",
    categoryColor: "#3b82f6",
    code: "K-01",
    name: "Terlambat Masuk Sekolah",
    description: "Hadir melewati batas waktu bel masuk (07.00 WIB) lebih dari 10 menit tanpa surat izin piket.",
    points: 5,
    sanctionRecommendation: "Teguran lisan & pembersihan area literasi sekolah",
    isActive: true,
  },
  {
    id: "v-2",
    categoryId: "cat-1",
    categoryName: "Ringan",
    categoryColor: "#3b82f6",
    code: "K-02",
    name: "Atribut Seragam Tidak Lengkap",
    description: "Tidak mengenakan dasi, sabuk sekolah, topi upacara, atau kaos kaki tidak sesuai aturan hari.",
    points: 5,
    sanctionRecommendation: "Pembinaan oleh Guru Piket",
    isActive: true,
  },
  {
    id: "v-3",
    categoryId: "cat-1",
    categoryName: "Ringan",
    categoryColor: "#3b82f6",
    code: "K-03",
    name: "Rambut Tidak Rapi / Pewarnaan",
    description: "Panjang rambut siswa putra melebihi kerah kemeja atau dicat warna di luar hitam natural.",
    points: 10,
    sanctionRecommendation: "Pemotongan rapi dalam tenggat 2x24 jam",
    isActive: true,
  },
  {
    id: "v-4",
    categoryId: "cat-1",
    categoryName: "Ringan",
    categoryColor: "#3b82f6",
    code: "K-04",
    name: "Membuang Sampah Sembarangan",
    description: "Membuang bungkus makanan atau botol minuman di luar tempat sampah yang telah disediakan.",
    points: 5,
    sanctionRecommendation: "Operasi semut kebersihan lingkungan sekolah",
    isActive: true,
  },
  {
    id: "v-5",
    categoryId: "cat-2",
    categoryName: "Sedang",
    categoryColor: "#f59e0b",
    code: "S-01",
    name: "Membolos Jam Pelajaran",
    description: "Keluar dari kelas saat Kegiatan Belajar Mengajar (KBM) berlangsung tanpa izin guru pengampu.",
    points: 15,
    sanctionRecommendation: "Pemberitahuan kepada orang tua & pembinaan Wali Kelas",
    isActive: true,
  },
  {
    id: "v-6",
    categoryId: "cat-2",
    categoryName: "Sedang",
    categoryColor: "#f59e0b",
    code: "S-02",
    name: "Merusak Sarana & Fasilitas Sekolah",
    description: "Mencoret-coret meja/dinding, mematahkan kursi, atau merusak alat laboratorium secara sengaja.",
    points: 25,
    sanctionRecommendation: "Ganti rugi perbaikan fasilitas & surat pernyataan bermaterai",
    isActive: true,
  },
  {
    id: "v-7",
    categoryId: "cat-2",
    categoryName: "Sedang",
    categoryColor: "#f59e0b",
    code: "S-03",
    name: "Membawa / Merokok di Lingkungan Sekolah",
    description: "Menghisap atau membawa rokok konvensional maupun rokok elektrik (vape) di lingkungan sekolah.",
    points: 25,
    sanctionRecommendation: "Penyitaan barang bukti, pemanggilan orang tua, dan pembinaan BK",
    isActive: true,
  },
  {
    id: "v-8",
    categoryId: "cat-2",
    categoryName: "Sedang",
    categoryColor: "#f59e0b",
    code: "S-04",
    name: "Menggunakan Ponsel Saat KBM Tanpa Izin",
    description: "Bermain game, membuka media sosial, atau aktivitas non-edukasi saat proses pembelajaran.",
    points: 10,
    sanctionRecommendation: "Penyitaan ponsel oleh Wali Kelas selama 3 hari",
    isActive: true,
  },
  {
    id: "v-9",
    categoryId: "cat-3",
    categoryName: "Berat",
    categoryColor: "#ef4444",
    code: "B-01",
    name: "Perundungan (Bullying) Fisik / Verbal",
    description: "Melakukan kekerasan fisik, pemalakan, ancaman, atau intimidasi psikologis terhadap sesama siswa.",
    points: 50,
    sanctionRecommendation: "Surat Peringatan (SP2), skorsing 3 hari, dan konseling intensif BK",
    isActive: true,
  },
  {
    id: "v-10",
    categoryId: "cat-3",
    categoryName: "Berat",
    categoryColor: "#ef4444",
    code: "B-02",
    name: "Perkelahian / Tawuran Antar Pelajar",
    description: "Terlibat kontak fisik kekerasan antarsiswa atau antarlembaga sekolah baik di dalam maupun luar.",
    points: 75,
    sanctionRecommendation: "Surat Peringatan Terakhir (SP3) & rapat komite pertimbangan kelulusan",
    isActive: true,
  },
  {
    id: "v-11",
    categoryId: "cat-3",
    categoryName: "Berat",
    categoryColor: "#ef4444",
    code: "B-03",
    name: "Narkoba & Minuman Beralkohol",
    description: "Membawa, mengonsumsi, atau mengedarkan zat terlarang narkotika, obat berbahaya, atau miras.",
    points: 100,
    sanctionRecommendation: "Pengembalian siswa kepada orang tua (Dikeluarkan dari sekolah)",
    isActive: true,
  },
];

// Helper to check live Supabase connection
function isSupabaseLive(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return Boolean(
    url &&
    url !== "https://placeholder-project.supabase.co" &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

// -------------------------------------------------------------
// CATEGORY ACTIONS
// -------------------------------------------------------------

export async function getCategoriesAction(): Promise<ViolationCategory[]> {
  if (isSupabaseLive()) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("violation_categories")
        .select("id, name, severity_level, description, color_code, violation_types(count)")
        .order("severity_level", { ascending: true });

      if (!error && data && data.length > 0) {
        return data.map((d: any) => ({
          id: d.id,
          name: d.name,
          severityLevel: d.severity_level as 1 | 2 | 3,
          description: d.description || "",
          colorCode: d.color_code || "#3b82f6",
          itemCount: d.violation_types?.[0]?.count || 0,
        }));
      }
    } catch (err) {
      console.warn("Supabase category fetch fallback:", err);
    }
  }

  // Fallback with live count computation
  return INITIAL_CATEGORIES.map((cat) => ({
    ...cat,
    itemCount: INITIAL_VIOLATIONS.filter((v) => v.categoryId === cat.id).length,
  }));
}

export async function createCategoryAction(
  rawInput: unknown
): Promise<ActionResponse<ViolationCategory>> {
  const authErr = await checkAdminAccess("menambah kategori pelanggaran");
  if (authErr) return authErr;
  const parsed = categorySchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      message: "Validasi gagal: periksa kembali isian formulir kategori.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const { name, severityLevel, description, colorCode } = parsed.data;

  if (isSupabaseLive()) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("violation_categories")
        .insert({
          name,
          severity_level: severityLevel,
          description: description || null,
          color_code: colorCode,
        })
        .select()
        .single();

      if (!error && data) {
        revalidatePath("/admin/rules");
        return {
          success: true,
          message: `Kategori "${name}" berhasil ditambahkan.`,
          data: {
            id: data.id,
            name: data.name,
            severityLevel: data.severity_level,
            description: data.description,
            colorCode: data.color_code,
            itemCount: 0,
          },
        };
      }
    } catch (err) {
      console.warn("Supabase create category error, falling back:", err);
    }
  }

  // Local fallback
  const newCat: ViolationCategory = {
    id: `cat-${Date.now()}`,
    name,
    severityLevel: severityLevel as 1 | 2 | 3,
    description,
    colorCode,
    itemCount: 0,
  };

  INITIAL_CATEGORIES.push(newCat);
  revalidatePath("/admin/rules");

  return {
    success: true,
    message: `Kategori "${name}" berhasil ditambahkan ke katalog.`,
    data: newCat,
  };
}

export async function updateCategoryAction(
  id: string,
  rawInput: unknown
): Promise<ActionResponse<ViolationCategory>> {
  const authErr = await checkAdminAccess("mengubah kategori pelanggaran");
  if (authErr) return authErr;
  const parsed = categorySchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      message: "Validasi gagal.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const { name, severityLevel, description, colorCode } = parsed.data;

  if (isSupabaseLive()) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("violation_categories")
        .update({
          name,
          severity_level: severityLevel,
          description: description || null,
          color_code: colorCode,
        })
        .eq("id", id)
        .select()
        .single();

      if (!error && data) {
        revalidatePath("/admin/rules");
        return {
          success: true,
          message: `Kategori "${name}" berhasil diperbarui.`,
        };
      }
    } catch (err) {
      console.warn("Supabase update category error:", err);
    }
  }

  const idx = INITIAL_CATEGORIES.findIndex((c) => c.id === id);
  if (idx !== -1) {
    INITIAL_CATEGORIES[idx] = {
      ...INITIAL_CATEGORIES[idx],
      name,
      severityLevel: severityLevel as 1 | 2 | 3,
      description,
      colorCode,
    };

    // Update associated violations category color/name in fallback
    INITIAL_VIOLATIONS = INITIAL_VIOLATIONS.map((v) =>
      v.categoryId === id ? { ...v, categoryName: name, categoryColor: colorCode } : v
    );
  }

  revalidatePath("/admin/rules");
  return {
    success: true,
    message: `Kategori "${name}" berhasil diperbarui.`,
  };
}

export async function deleteCategoryAction(id: string): Promise<ActionResponse> {
  const authErr = await checkAdminAccess("menghapus kategori pelanggaran");
  if (authErr) return authErr;
  // Check if violations are attached
  const hasViolations = INITIAL_VIOLATIONS.some((v) => v.categoryId === id);
  if (hasViolations) {
    return {
      success: false,
      message: "Tidak dapat menghapus: masih terdapat aturan pelanggaran aktif dalam kategori ini.",
    };
  }

  if (isSupabaseLive()) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.from("violation_categories").delete().eq("id", id);
      if (!error) {
        revalidatePath("/admin/rules");
        return { success: true, message: "Kategori berhasil dihapus." };
      }
    } catch (err) {
      console.warn("Supabase delete category error:", err);
    }
  }

  INITIAL_CATEGORIES = INITIAL_CATEGORIES.filter((c) => c.id !== id);
  revalidatePath("/admin/rules");
  return { success: true, message: "Kategori berhasil dihapus." };
}

// -------------------------------------------------------------
// VIOLATION ACTIONS
// -------------------------------------------------------------

export async function getViolationsAction(
  filter: ViolationFilter = {}
): Promise<PaginatedResult<ViolationItem>> {
  const {
    search = "",
    categoryId,
    minPoints,
    maxPoints,
    page = 1,
    pageSize = 10,
    sortBy = "code",
    sortOrder = "asc",
  } = filter;

  if (isSupabaseLive()) {
    try {
      const supabase = await createClient();
      let query = supabase.from("violation_types").select(
        `
        id,
        code,
        name,
        description,
        points,
        sanction_recommendation,
        is_active,
        category_id,
        violation_categories:category_id (name, color_code)
      `,
        { count: "exact" }
      );

      if (search.trim()) {
        query = query.or(`name.ilike.%${search}%,code.ilike.%${search}%,description.ilike.%${search}%`);
      }
      if (categoryId && categoryId !== "all") {
        query = query.eq("category_id", categoryId);
      }
      if (minPoints !== undefined) {
        query = query.gte("points", minPoints);
      }
      if (maxPoints !== undefined) {
        query = query.lte("points", maxPoints);
      }

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, count, error } = await query
        .order("points", { ascending: sortOrder === "asc" })
        .range(from, to);

      if (!error && data) {
        const items: ViolationItem[] = data.map((d: any) => ({
          id: d.id,
          categoryId: d.category_id,
          categoryName: d.violation_categories?.name || "Umum",
          categoryColor: d.violation_categories?.color_code || "#3b82f6",
          code: d.code,
          name: d.name,
          description: d.description,
          points: d.points,
          sanctionRecommendation: d.sanction_recommendation,
          isActive: d.is_active,
        }));

        const totalItems = count || items.length;
        return {
          items,
          totalItems,
          page,
          pageSize,
          totalPages: Math.ceil(totalItems / pageSize) || 1,
        };
      }
    } catch (err) {
      console.warn("Supabase violations fetch fallback:", err);
    }
  }

  // Filter in-memory fallback list
  let filtered = [...INITIAL_VIOLATIONS];

  if (search.trim()) {
    const s = search.toLowerCase();
    filtered = filtered.filter(
      (v) =>
        v.name.toLowerCase().includes(s) ||
        v.code.toLowerCase().includes(s) ||
        v.description.toLowerCase().includes(s)
    );
  }

  if (categoryId && categoryId !== "all") {
    filtered = filtered.filter((v) => v.categoryId === categoryId);
  }

  if (minPoints !== undefined) {
    filtered = filtered.filter((v) => v.points >= minPoints);
  }

  if (maxPoints !== undefined) {
    filtered = filtered.filter((v) => v.points <= maxPoints);
  }

  // Sort
  filtered.sort((a, b) => {
    if (sortBy === "points") {
      return sortOrder === "asc" ? a.points - b.points : b.points - a.points;
    }
    if (sortBy === "name") {
      return sortOrder === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
    }
    return sortOrder === "asc" ? a.code.localeCompare(b.code) : b.code.localeCompare(a.code);
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

export async function createViolationAction(
  rawInput: unknown
): Promise<ActionResponse<ViolationItem>> {
  const authErr = await checkAdminAccess("menambah aturan pelanggaran");
  if (authErr) return authErr;
  const parsed = violationSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      message: "Validasi gagal: periksa kelengkapan nama, deskripsi, dan bobot poin.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const { categoryId, name, description, points, code, sanctionRecommendation } = parsed.data;

  // Auto-generate code if not supplied
  const resolvedCategory = INITIAL_CATEGORIES.find((c) => c.id === categoryId);
  const prefix = resolvedCategory?.name[0].toUpperCase() || "K";
  const nextNum = INITIAL_VIOLATIONS.length + 1;
  const finalCode = code || `${prefix}-${nextNum.toString().padStart(2, "0")}`;

  if (isSupabaseLive()) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("violation_types")
        .insert({
          category_id: categoryId,
          code: finalCode,
          name,
          description,
          points,
          sanction_recommendation: sanctionRecommendation || null,
          is_active: true,
        })
        .select()
        .single();

      if (!error && data) {
        revalidatePath("/admin/rules");
        return {
          success: true,
          message: `Aturan "${name}" (+${points} Poin) berhasil disimpan.`,
        };
      }
    } catch (err) {
      console.warn("Supabase create violation error:", err);
    }
  }

  const newItem: ViolationItem = {
    id: `v-${Date.now()}`,
    categoryId,
    categoryName: resolvedCategory?.name || "Umum",
    categoryColor: resolvedCategory?.colorCode || "#3b82f6",
    code: finalCode,
    name,
    description,
    points,
    sanctionRecommendation,
    isActive: true,
  };

  INITIAL_VIOLATIONS.unshift(newItem);
  revalidatePath("/admin/rules");

  return {
    success: true,
    message: `Aturan "${name}" (+${points} Poin) berhasil ditambahkan ke buku saku.`,
    data: newItem,
  };
}

export async function updateViolationAction(
  id: string,
  rawInput: unknown
): Promise<ActionResponse<ViolationItem>> {
  const authErr = await checkAdminAccess("mengubah aturan pelanggaran");
  if (authErr) return authErr;
  const parsed = violationSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      message: "Validasi gagal.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const { categoryId, name, description, points, code, sanctionRecommendation } = parsed.data;
  const resolvedCategory = INITIAL_CATEGORIES.find((c) => c.id === categoryId);

  if (isSupabaseLive()) {
    try {
      const supabase = await createClient();
      const { error } = await supabase
        .from("violation_types")
        .update({
          category_id: categoryId,
          code,
          name,
          description,
          points,
          sanction_recommendation: sanctionRecommendation || null,
        })
        .eq("id", id);

      if (!error) {
        revalidatePath("/admin/rules");
        return {
          success: true,
          message: `Aturan "${name}" berhasil diperbarui.`,
        };
      }
    } catch (err) {
      console.warn("Supabase update violation error:", err);
    }
  }

  const idx = INITIAL_VIOLATIONS.findIndex((v) => v.id === id);
  if (idx !== -1) {
    INITIAL_VIOLATIONS[idx] = {
      ...INITIAL_VIOLATIONS[idx],
      categoryId,
      categoryName: resolvedCategory?.name || INITIAL_VIOLATIONS[idx].categoryName,
      categoryColor: resolvedCategory?.colorCode || INITIAL_VIOLATIONS[idx].categoryColor,
      code: code || INITIAL_VIOLATIONS[idx].code,
      name,
      description,
      points,
      sanctionRecommendation,
    };
  }

  revalidatePath("/admin/rules");
  return {
    success: true,
    message: `Aturan "${name}" berhasil diperbarui.`,
  };
}

export async function deleteViolationAction(id: string): Promise<ActionResponse> {
  const authErr = await checkAdminAccess("menghapus aturan pelanggaran");
  if (authErr) return authErr;
  if (isSupabaseLive()) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.from("violation_types").delete().eq("id", id);
      if (!error) {
        revalidatePath("/admin/rules");
        return { success: true, message: "Aturan pelanggaran berhasil dihapus." };
      }
    } catch (err) {
      console.warn("Supabase delete violation error:", err);
    }
  }

  INITIAL_VIOLATIONS = INITIAL_VIOLATIONS.filter((v) => v.id !== id);
  revalidatePath("/admin/rules");

  return {
    success: true,
    message: "Aturan pelanggaran berhasil dihapus dari sistem.",
  };
}
