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
import { searchStudentPublicAction } from '../src/features/students/actions';
import { getViolationsAction } from '../src/features/rules/actions';
import { getTeachersAction } from '../src/features/teachers/actions';
import { signInAction } from '../src/features/auth/actions/authActions';

const PAYLOADS = [
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
  "fikri) or (id.not.is.null"
];

async function runAudit() {
  console.log("=== STARTING SQL INJECTION SECURITY AUDIT ===");
  const results: any[] = [];

  const supabase = createAdminClient();

  for (const payload of PAYLOADS) {
    console.log(`\n--- Testing Payload: ${JSON.stringify(payload)} ---`);
    const payloadResult: any = { payload };

    // 1. Test Cek Poin Siswa (searchStudentPublicAction)
    const t0 = Date.now();
    try {
      const res = await searchStudentPublicAction(payload);
      const elapsed = Date.now() - t0;
      payloadResult.cekPoin = {
        success: true,
        matched: res ? res.fullName : null,
        elapsedMs: elapsed,
        slept: elapsed >= 4500
      };
    } catch (err: any) {
      payloadResult.cekPoin = {
        success: false,
        error: err.message,
        elapsedMs: Date.now() - t0
      };
    }

    // 2. Test Rules Catalog search (getViolationsAction)
    const t1 = Date.now();
    try {
      const res = await getViolationsAction({ search: payload });
      const elapsed = Date.now() - t1;
      payloadResult.rules = {
        success: true,
        count: res.items.length,
        elapsedMs: elapsed,
        slept: elapsed >= 4500
      };
    } catch (err: any) {
      payloadResult.rules = {
        success: false,
        error: err.message,
        elapsedMs: Date.now() - t1
      };
    }

    // 3. Test Teachers search (getTeachersAction)
    const t2 = Date.now();
    try {
      // Mock session for requireRole if needed
      (globalThis as any).__TEST_SESSION__ = {
        user: { id: "a2d0292a-b50a-4a8f-bfc6-ee2a3a257e50", role: "admin" }
      };
      const res = await getTeachersAction({ search: payload });
      const elapsed = Date.now() - t2;
      payloadResult.teachers = {
        success: true,
        count: res.items.length,
        elapsedMs: elapsed,
        slept: elapsed >= 4500
      };
    } catch (err: any) {
      payloadResult.teachers = {
        success: false,
        error: err.message,
        elapsedMs: Date.now() - t2
      };
    }

    // 4. Test PostgREST Auth Identifier Lookup directly
    const t3 = Date.now();
    try {
      // Test the exact PostgREST query used in authActions for NIS/NISN:
      // adminDb.from("students").select("profile_id, profiles!inner(email, role)").or(`nis.eq.${payload},nisn.eq.${payload}`).maybeSingle();
      const { data, error } = await supabase
        .from("students")
        .select("profile_id, profiles!inner(email, role)")
        .or(`nis.eq.${payload},nisn.eq.${payload}`)
        .maybeSingle();

      const elapsed = Date.now() - t3;
      payloadResult.authDirectQuery = {
        success: !error,
        returnedData: data ? true : false,
        error: error ? error.message : null,
        code: error ? error.code : null,
        elapsedMs: elapsed,
        slept: elapsed >= 4500
      };
    } catch (err: any) {
      payloadResult.authDirectQuery = {
        success: false,
        exception: err.message,
        elapsedMs: Date.now() - t3
      };
    }

    // 5. Test Full signInAction with payload as identifier and fake password
    try {
      const res = await signInAction({
        identifier: payload,
        password: "wrong_password_123",
        role: "siswa"
      });
      payloadResult.signInAction = {
        success: res.success,
        message: res.message
      };
    } catch (err: any) {
      payloadResult.signInAction = {
        exception: err.message
      };
    }

    results.push(payloadResult);
    console.log(JSON.stringify(payloadResult, null, 2));
  }

  // Check if students table is intact
  const { count: finalStudentCount } = await supabase.from('students').select('*', { count: 'exact', head: true });
  console.log("\n=== VERIFICATION: Students count after all payloads:", finalStudentCount);
}

runAudit().catch(console.error);
