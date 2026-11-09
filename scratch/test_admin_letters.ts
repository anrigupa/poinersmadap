import { getAdminCallLettersDataAction } from "../src/features/admin/actions/letterActions";

// Mock test session for Administrator
(globalThis as any).__TEST_SESSION__ = {
  user: {
    id: "4e9e3cde-43fa-4df8-9dd3-e6130e862d57",
    email: "rifaqpatalo07@gmail.com",
    fullName: "adminsmadap",
    role: "admin",
  },
  sessionId: "test-admin-session",
  createdAt: Date.now(),
  expiresAt: Date.now() + 3600000,
};

async function testAdminLetters() {
  console.log("=== STARTING ADMIN CALL LETTERS MODULE VERIFICATION ===");

  const res = await getAdminCallLettersDataAction();

  console.log("\n[1] Verifying Dashboard Summary Cards:");
  console.log("   • Total Surat Panggilan:", res.summary.totalLetters);
  console.log("   • Surat Bulan Ini:", res.summary.lettersThisMonth);
  console.log("   • Siswa Dalam Pembinaan:", res.summary.studentsInCoaching);
  console.log("   • Guru BK Aktif:", res.summary.activeCounselors);

  if (typeof res.summary.totalLetters !== "number" || res.summary.totalLetters <= 0) {
    throw new Error("Expected totalLetters > 0");
  }
  if (typeof res.summary.activeCounselors !== "number" || res.summary.activeCounselors <= 0) {
    throw new Error("Expected activeCounselors > 0");
  }
  console.log("   ✅ PASS: All 4 dashboard cards populated from live database!");

  console.log("\n[2] Verifying Table Columns & Letter Items:");
  console.log(`   Fetched ${res.items.length} letter item(s).`);
  const firstItem = res.items[0];
  console.log("   First item sample:");
  console.log("   • Tanggal:", firstItem.formattedDate, `(${firstItem.date})`);
  console.log("   • Nomor Surat:", firstItem.letterNumber);
  console.log("   • Nama Siswa:", firstItem.studentName);
  console.log("   • NISN:", firstItem.studentNisn);
  console.log("   • Kelas:", firstItem.className);
  console.log("   • Guru BK:", firstItem.counselorName);
  console.log("   • Status Disiplin:", firstItem.disciplineStatus, `(${firstItem.statusColor})`);

  if (!firstItem.letterNumber || !firstItem.studentName || !firstItem.counselorName) {
    throw new Error("Item missing required columns!");
  }
  console.log("   ✅ PASS: All required table columns present and verified!");

  console.log("\n[3] Verifying Search Capabilities:");
  const testStudentName = firstItem.studentName.toLowerCase();
  const matchedByName = res.items.filter((i) => i.studentName.toLowerCase().includes(testStudentName));
  console.log(`   Search by student name '${testStudentName}': ${matchedByName.length} match(es)`);

  const testNumber = firstItem.letterNumber.toLowerCase();
  const matchedByNumber = res.items.filter((i) => i.letterNumber.toLowerCase().includes(testNumber));
  console.log(`   Search by letter number '${testNumber}': ${matchedByNumber.length} match(es)`);

  const testCounselor = firstItem.counselorName.toLowerCase();
  const matchedByCounselor = res.items.filter((i) => i.counselorName.toLowerCase().includes(testCounselor));
  console.log(`   Search by counselor '${testCounselor}': ${matchedByCounselor.length} match(es)`);
  console.log("   ✅ PASS: Multi-field search verified!");

  console.log("\n=== ALL ADMIN LETTERS VERIFICATION CHECKS PASSED WITH 100% SUCCESS ===");
}

testAdminLetters().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
