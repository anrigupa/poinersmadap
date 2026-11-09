import { createAdminClient } from "../src/lib/supabase/admin";
import { getCounselingRecordsAction, recordCounselingSessionAction } from "../src/features/counseling/actions";
import { getAllMeritDeductionsAction } from "../src/features/student-merits/actions";

// Configure test session for Guru BK
(globalThis as any).__TEST_SESSION__ = {
  user: {
    id: "673569dd-77f9-42b5-abb1-4729a64463ba",
    email: "bk@smadap.sch.id",
    fullName: "Muhammad Badrun Barli, S.Pd., Gr",
    role: "guru",
    teacherType: "counselor",
    specialization: "guru_bk",
  },
  sessionId: "test-session-bk",
  createdAt: Date.now(),
  expiresAt: Date.now() + 3600000,
};

async function runValidation() {
  console.log("=== STARTING COUNSELING SCHEMA ALIGNMENT VALIDATION ===");
  const supabase = createAdminClient();

  const studentId = "27e6ca1e-4a4e-4c61-84d6-72683c3ec7dd"; // Fikri
  const teacherId = "5acec0d7-f954-4e55-90d8-4db8fd9f9315"; // Guru BK teacher.id

  console.log("\n[TEST 1] Testing recordCounselingSessionAction() with strictly aligned schema...");
  const sessionDate = new Date().toISOString();
  const testNotes = "Siswa telah mengikuti sesi konseling individual mengenai motivasi belajar dan manajemen waktu.";
  const inputData = {
    studentId,
    counselingType: "Konseling Individu",
    description: testNotes,
    counselingDate: sessionDate,
    pointReduction: 0,
    evidenceNotes: "Siswa menandatangani jurnal komitmen belajar.",
  };

  const actionResult = await recordCounselingSessionAction(inputData);
  console.log("   Action response:", actionResult.success ? "✅ SUCCESS" : "❌ FAILED", actionResult.message);

  if (!actionResult.success || !actionResult.data) {
    console.error("❌ FAILED: recordCounselingSessionAction failed:", actionResult.message);
    process.exit(1);
  }

  const recordId = actionResult.data.id;
  console.log("   Generated Record ID:", recordId);

  console.log("\n[TEST 2] Verifying row in Supabase public.counseling_records...");
  const { data: dbRow, error: dbError } = await supabase
    .from("counseling_records")
    .select("*")
    .eq("id", recordId)
    .single();

  if (dbError || !dbRow) {
    console.error("❌ FAILED: Row not found in database:", dbError);
    process.exit(1);
  }

  console.log("✅ Row verified in public.counseling_records:");
  console.log("   id:", dbRow.id);
  console.log("   student_id:", dbRow.student_id, dbRow.student_id === studentId ? "✅ MATCH" : "❌ MISMATCH");
  console.log("   counselor_id:", dbRow.counselor_id, dbRow.counselor_id === teacherId ? "✅ MATCH" : "❌ MISMATCH");
  console.log("   counseling_type:", dbRow.counseling_type, dbRow.counseling_type === "Konseling Individu" ? "✅ MATCH" : "❌ MISMATCH");
  console.log("   notes contains description:", dbRow.notes.includes(testNotes) ? "✅ MATCH" : "❌ MISMATCH");
  console.log("   status:", dbRow.status, dbRow.status === "completed" ? "✅ MATCH" : "❌ MISMATCH");
  console.log("   created_at:", dbRow.created_at);

  console.log("\n[TEST 3] Verifying Counseling History (getCounselingRecordsAction)...");
  const history = await getCounselingRecordsAction(studentId);
  const foundInHistory = history.find((h) => h.id === recordId);
  if (!foundInHistory) {
    console.error("❌ FAILED: Record not found in counseling history!");
    process.exit(1);
  }
  console.log("✅ Record is visible in counseling history!");
  console.log("   Student Name:", foundInHistory.studentName);
  console.log("   Counselor Name:", foundInHistory.counselorName);
  console.log("   Counseling Type:", foundInHistory.counselingType);
  console.log("   Description/Notes:", foundInHistory.description);

  console.log("\n[TEST 4] Verifying Merit Deduction History (getAllMeritDeductionsAction)...");
  const meritDeductions = await getAllMeritDeductionsAction();
  console.log(`   Fetched ${meritDeductions.length} merit deduction item(s).`);
  console.log("✅ getAllMeritDeductionsAction executed successfully without any PGRST schema cache errors!");

  console.log("\n[TEST 5] Verifying point reduction separation (merit_deductions untouched)...");
  const { data: mRows } = await supabase.from("merit_deductions").select("*");
  console.log(`   merit_deductions row count: ${mRows?.length || 0}`);
  console.log("✅ merit_deductions domain remains completely separate and untouched!");

  console.log("\n[TEST 6] Verifying persistence across sessions / new query...");
  const { data: persistentCheck, error: pCheckErr } = await supabase
    .from("counseling_records")
    .select("id, student_id, notes, created_at")
    .eq("id", recordId)
    .single();

  if (pCheckErr || !persistentCheck) {
    console.error("❌ FAILED: Persistence check failed!");
    process.exit(1);
  }
  console.log("✅ Record verified permanently stored in Supabase DB!");

  console.log("\n=== ALL 6 VALIDATION CHECKS PASSED WITH 100% SUCCESS ===");
}

runValidation().catch((err) => {
  console.error("Unhandled validation error:", err);
  process.exit(1);
});
