"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentSession } from "@/features/auth/actions/authActions";
import {
  StudentHistoryRecord,
  StudentViolationHistoryFilter,
  StudentHistoryStats,
  PaginatedResult,
  StudentHistoryPageData,
} from "@/features/student-history/types";
import { getStudentsAction } from "@/features/students/actions";
import { calculateViolationLevel } from "@/features/student-dashboard/actions";

function isSupabaseLive(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return Boolean(
    url &&
    url !== "https://placeholder-project.supabase.co" &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

// In-memory initial historical violation logs for zero-config demo / development mode
let DEMO_VIOLATION_RECORDS: StudentHistoryRecord[] = [
  {
    id: "hist-01",
    studentId: "stu-1",
    studentNis: "10293",
    studentName: "Muhammad Rizky Pratama",
    className: "XI MIPA 2",
    ruleCode: "K-02",
    violationName: "Atribut seragam sekolah tidak lengkap (Dasi/Sabuk/Kaos Kaki)",
    categoryName: "Ringan",
    points: 5,
    incidentDate: "2026-11-02T07:15:00",
    formattedDate: "02 Nov 2026, 07:15 WITA",
    location: "Gerbang Depan Sekolah",
    notes: "Siswa kedapatan tidak mengenakan dasi upacara saat apel pagi hari Senin.",
    teacherName: "Siti Rahmawati, S.Pd",
    teacherNip: "198504122010012003",
    evidenceUrl: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600",
    status: "confirmed",
    createdAt: "2026-11-02T07:20:00",
  },
  {
    id: "hist-02",
    studentId: "stu-1",
    studentNis: "10293",
    studentName: "Muhammad Rizky Pratama",
    className: "XI MIPA 2",
    ruleCode: "S-01",
    violationName: "Meninggalkan jam pelajaran tanpa izin dari guru piket / mapel (Membolos)",
    categoryName: "Sedang",
    points: 15,
    incidentDate: "2026-10-18T10:30:00",
    formattedDate: "18 Okt 2026, 10:30 WITA",
    location: "Kantin Belakang",
    notes: "Terlihat berada di warung luar pagar sekolah pada jam pelajaran ke-4 fisika.",
    teacherName: "Drs. Joko Susilo, M.Pd",
    teacherNip: "197808202005011004",
    evidenceUrl: null,
    status: "confirmed",
    createdAt: "2026-10-18T10:35:00",
  },
  {
    id: "hist-03",
    studentId: "stu-1",
    studentNis: "10293",
    studentName: "Muhammad Rizky Pratama",
    className: "XI MIPA 2",
    ruleCode: "K-01",
    violationName: "Terlambat hadir di sekolah lebih dari 10 menit",
    categoryName: "Ringan",
    points: 5,
    incidentDate: "2026-09-08T07:35:00",
    formattedDate: "08 Sep 2026, 07:35 WITA",
    location: "Pos Piket Gerbang Utama",
    notes: "Pintu gerbang telah ditutup, siswa tiba pukul 07.35 WIB karena macet.",
    teacherName: "Ahmad Fauzi, S.Pd",
    teacherNip: "199003152019032008",
    evidenceUrl: null,
    status: "confirmed",
    createdAt: "2026-09-08T07:40:00",
  },
  // Record belonging to another student (stu-4 / 10296) to prove STRICT personal data isolation
  {
    id: "hist-99",
    studentId: "stu-4",
    studentNis: "10296",
    studentName: "Fajar Maulana",
    className: "XII IPS 2",
    ruleCode: "B-01",
    violationName: "Membawa atau merokok / vaping di dalam lingkungan sekolah",
    categoryName: "Berat",
    points: 40,
    incidentDate: "2026-10-25T11:00:00",
    formattedDate: "25 Okt 2026, 11:00 WITA",
    location: "Toilet Belakang",
    notes: "Ditemukan rokok konvensional di saku jaket.",
    teacherName: "Siti Rahmawati, S.Pd",
    teacherNip: "198504122010012003",
    evidenceUrl: null,
    status: "confirmed",
    createdAt: "2026-10-25T11:05:00",
  },
];

// -------------------------------------------------------------
// GET STUDENT VIOLATION HISTORY (STRICT PERSONAL ISOLATION)
// -------------------------------------------------------------

export async function getStudentViolationHistoryAction(
  filter: StudentViolationHistoryFilter = {}
): Promise<StudentHistoryPageData> {
  // 1. Role Security: Authenticate user & resolve student identity
  const session = await getCurrentSession();
  if (!session) {
    throw new Error("Akses ditolak: Anda harus login untuk melihat riwayat pelanggaran.");
  }

  const { search = "", category = "all", status = "all", dateRange = "all", page = 1, pageSize = 10, sortBy = "incidentDate", sortOrder = "desc" } = filter;

  // Resolve Student Record
  const studentsRes = await getStudentsAction({ pageSize: 100 });
  let student = studentsRes.items.find(
    (s) => s.profileId === session.user.id || s.nis === session.user.nis
  );

  // If student role has no profile record, prevent leakage of other students' data
  if (!student) {
    if (session.user.role === "siswa") {
      throw new Error("Data profil siswa tidak ditemukan untuk akun ini.");
    }
    student = studentsRes.items[0];
  }

  const currentStudentId = student.id;
  const currentStudentNis = student.nis;

  let allPersonalRecords: StudentHistoryRecord[] = [];

  // 2. Query Data: Supabase Live vs In-Memory Fallback
  if (isSupabaseLive()) {
    try {
      const supabase = await createClient();

      // STRICT ISOLATION: WHERE student_id = currentStudentId
      const { data, error } = await supabase
        .from("student_violations")
        .select(
          `
          id,
          student_id,
          violation_type_id,
          points,
          notes,
          evidence_url,
          incident_date,
          status,
          created_at,
          violation_types:violation_type_id (
            code,
            name,
            violation_categories:category_id (name)
          ),
          teachers:reported_by (
            nip,
            profiles:profile_id (full_name)
          )
        `
        )
        .eq("student_id", currentStudentId)
        .order("incident_date", { ascending: false });

      if (!error && data) {
        allPersonalRecords = data.map((item: any) => {
          const vType = item.violation_types || {};
          const vCat = vType.violation_categories || {};
          const teacher = item.teachers || {};
          const teacherProfile = Array.isArray(teacher.profiles)
            ? teacher.profiles[0]
            : teacher.profiles;

          const incDate = item.incident_date || item.created_at;
          const dateObj = new Date(incDate);
          const formattedDate =
            dateObj.toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }) + " WITA";

          return {
            id: item.id,
            studentId: currentStudentId,
            studentNis: currentStudentNis,
            studentName: student.fullName,
            className: student.className,
            ruleCode: vType.code || "V-01",
            violationName: vType.name || "Pelanggaran Tata Tertib",
            categoryName: vCat.name || "Ringan",
            points: item.points || 5,
            incidentDate: incDate,
            formattedDate,
            notes: item.notes || "-",
            teacherName: teacherProfile?.full_name || "Guru Pengawas",
            teacherNip: teacher.nip,
            evidenceUrl: item.evidence_url,
            status: item.status || "confirmed",
            createdAt: item.created_at,
          };
        });
      }
    } catch (err) {
      console.warn("Supabase student history fetch fallback:", err);
    }
  }

  // Fallback: Filter strictly by personal student ID / NIS
  if (allPersonalRecords.length === 0) {
    allPersonalRecords = DEMO_VIOLATION_RECORDS.filter(
      (r) => r.studentId === currentStudentId || r.studentNis === currentStudentNis
    );
  }

  // 3. Compute High-Level Personal Stats
  const totalIncidents = allPersonalRecords.length;
  const totalPoints = allPersonalRecords.reduce((acc, cur) => acc + (cur.points || 0), 0);
  const highestPoint = allPersonalRecords.reduce((max, cur) => Math.max(max, cur.points || 0), 0);
  const latestDate = allPersonalRecords[0]?.formattedDate || "-";
  const levelInfo = await calculateViolationLevel(totalPoints);

  const stats: StudentHistoryStats = {
    totalIncidents,
    totalPoints,
    highestPoint,
    latestDate,
    disciplinaryLevel: levelInfo.level,
  };

  // 4. Apply Filters & Search
  let filtered = [...allPersonalRecords];

  if (search.trim()) {
    const s = search.toLowerCase();
    filtered = filtered.filter(
      (r) =>
        r.violationName.toLowerCase().includes(s) ||
        r.ruleCode.toLowerCase().includes(s) ||
        r.notes.toLowerCase().includes(s) ||
        r.teacherName.toLowerCase().includes(s) ||
        (r.location && r.location.toLowerCase().includes(s))
    );
  }

  if (category && category !== "all") {
    filtered = filtered.filter((r) => r.categoryName === category);
  }

  if (status && status !== "all") {
    filtered = filtered.filter((r) => r.status === status);
  }

  if (dateRange === "this_month") {
    filtered = filtered.filter((r) => r.incidentDate.startsWith("2026-11"));
  }

  // 5. Apply Sorting
  filtered.sort((a, b) => {
    if (sortBy === "points") {
      return sortOrder === "asc" ? a.points - b.points : b.points - a.points;
    }
    if (sortBy === "categoryName") {
      return sortOrder === "asc"
        ? a.categoryName.localeCompare(b.categoryName)
        : b.categoryName.localeCompare(a.categoryName);
    }
    return sortOrder === "asc"
      ? new Date(a.incidentDate).getTime() - new Date(b.incidentDate).getTime()
      : new Date(b.incidentDate).getTime() - new Date(a.incidentDate).getTime();
  });

  // 6. Apply Pagination
  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIndex = (page - 1) * pageSize;
  const paginatedItems = filtered.slice(startIndex, startIndex + pageSize);

  const paginatedResult: PaginatedResult<StudentHistoryRecord> = {
    items: paginatedItems,
    totalItems,
    page,
    pageSize,
    totalPages,
  };

  return {
    stats,
    records: paginatedResult,
    studentName: student.fullName,
    studentNis: student.nis,
    className: student.className,
  };
}
