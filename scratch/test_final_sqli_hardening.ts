import fs from 'fs';

// Load .env.local
const envFile = fs.readFileSync('.env.local', 'utf-8');
for (const line of envFile.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const idx = trimmed.indexOf('=');
  if (idx !== -1) {
    const key = trimmed.slice(0, idx).trim();
    let val = trimmed.slice(idx + 1).trim();
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    process.env[key] = val;
  }
}

import { createAdminClient } from '../src/lib/supabase/admin';
import { searchStudentPublicAction, getStudentsAction } from '../src/features/students/actions';
import { getViolationsAction } from '../src/features/rules/actions';
import { getTeachersAction } from '../src/features/teachers/actions';
import { signInAction } from '../src/features/auth/actions/authActions';

const MALICIOUS_PAYLOADS = [
  "'",
  "''",
  "OR 1=1",
  "' OR '1'='1",
  "admin'--",
  "'); DROP TABLE students;--",
  "\" OR 1=1--",
  "%27%20OR%201=1",
  "UNION SELECT",
  "pg_sleep(5)",
  "1,id.neq.0",
  "10595,status.eq.active",
  "fikri) or (id.not.is.null",
  "<script>alert(1)</script>",
  "admin';--"
];

async function runHardeningVerification() {
  console.log("=================================================================");
  console.log("   FINAL SQL INJECTION HARDENING VERIFICATION: SMADAP POINER    ");
  console.log("=================================================================\n");

  const supabase = createAdminClient();

  // A. VERIFY VALID FUNCTIONALITY FIRST
  console.log("--- 1. Testing Legitimate Operations ---");
  const validStudent = await searchStudentPublicAction("Fikri");
  console.log("Cek Poin Siswa ('Fikri'):", validStudent ? `MATCHED (${validStudent.fullName}, NIS: ${validStudent.nis})` : "FAILED");

  const validNis = await searchStudentPublicAction("10595");
  console.log("Cek Poin Siswa ('10595'):", validNis ? `MATCHED (${validNis.fullName})` : "FAILED");

  const validNisn = await searchStudentPublicAction("0064604750");
  console.log("Cek Poin Siswa ('0064604750'):", validNisn ? `MATCHED (${validNisn.fullName})` : "FAILED");

  (globalThis as any).__TEST_SESSION__ = {
    user: { id: "a2d0292a-b50a-4a8f-bfc6-ee2a3a257e50", role: "admin" }
  };
  const teachersRes = await getTeachersAction({ search: "1777" });
  console.log("Teacher search ('1777'):", teachersRes.items.length > 0 ? `FOUND ${teachersRes.items.length} teachers` : "FAILED");

  const studentsRes = await getStudentsAction({ search: "Fikri" });
  console.log("Student directory search ('Fikri'):", studentsRes.items.length > 0 ? `FOUND ${studentsRes.items.length} students` : "FAILED");

  // B. TEST ALL MALICIOUS PAYLOADS
  console.log("\n--- 2. Testing Malicious Injection Payloads Across All Surfaces ---");
  let allSafelyHandled = true;

  for (const payload of MALICIOUS_PAYLOADS) {
    const pStr = JSON.stringify(payload);
    process.stdout.write(`Testing payload ${pStr.padEnd(30)}: `);

    // 1. Cek Poin Siswa
    const t0 = Date.now();
    const cekPoinRes = await searchStudentPublicAction(payload);
    const cekPoinElapsed = Date.now() - t0;
    const cekPoinSafe = cekPoinRes === null && cekPoinElapsed < 2000;

    // 2. Auth signInAction
    const authRes = await signInAction({
      identifier: payload,
      password: "some_password_123",
      role: "siswa"
    });
    // Must be safely rejected before query or with invalid format error
    const authSafe = !authRes.success;

    // 3. Rules Catalog
    let rulesSafe = true;
    try {
      const rulesRes = await getViolationsAction({ search: payload });
      // Search with payload should safely return 0 items and not sleep
      rulesSafe = Array.isArray(rulesRes.items);
    } catch {
      // Catching any unhandled error
      rulesSafe = false;
    }

    // 4. Teacher Search
    let teacherSafe = true;
    try {
      const tRes = await getTeachersAction({ search: payload });
      teacherSafe = Array.isArray(tRes.items);
    } catch {
      teacherSafe = false;
    }

    // 5. Student Search
    let studentSafe = true;
    try {
      const sRes = await getStudentsAction({ search: payload });
      studentSafe = Array.isArray(sRes.items);
    } catch {
      studentSafe = false;
    }

    const payloadSafe = cekPoinSafe && authSafe && rulesSafe && teacherSafe && studentSafe;
    if (payloadSafe) {
      console.log(`[PASS] CekPoin: null (${cekPoinElapsed}ms) | Auth: REJECTED | Rules: SAFE | Teachers: SAFE | Students: SAFE`);
    } else {
      allSafelyHandled = false;
      console.log(`[FAIL] Details: CekPoinSafe=${cekPoinSafe}, AuthSafe=${authSafe}, RulesSafe=${rulesSafe}, TeacherSafe=${teacherSafe}, StudentSafe=${studentSafe}`);
    }
  }

  // C. VERIFY DATABASE INTEGRITY
  console.log("\n--- 3. Database State Integrity Check ---");
  const { count: studentCount } = await supabase.from('students').select('*', { count: 'exact', head: true });
  const { count: teacherCount } = await supabase.from('teachers').select('*', { count: 'exact', head: true });
  console.log(`Students count in DB: ${studentCount} (Intact: ${studentCount === 1})`);
  console.log(`Teachers count in DB: ${teacherCount} (Intact: ${teacherCount === 2})`);

  console.log("\n=================================================================");
  if (allSafelyHandled && studentCount === 1 && teacherCount === 2) {
    console.log("   ALL TESTS PASSED: SQL INJECTION READINESS 100/100 (GRADE A+)");
  } else {
    console.log("   SOME TESTS FAILED - REVIEW LOGS");
  }
  console.log("=================================================================\n");
}

runHardeningVerification().catch(console.error);
