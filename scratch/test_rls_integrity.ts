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

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

async function testRLS() {
  console.log("=== TESTING RLS INTEGRITY AND DATA LEAK RESISTANCE ===");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  // 1. Anonymous client (no session)
  const anonClient = createSupabaseClient(url, anonKey);

  // Try to select profiles
  const { data: anonProfiles, error: profErr } = await anonClient.from("profiles").select("*");
  console.log("Anon profiles access:", { count: anonProfiles?.length ?? 0, error: profErr?.message });

  // Try to select students
  const { data: anonStudents, error: studErr } = await anonClient.from("students").select("*");
  console.log("Anon students access:", { count: anonStudents?.length ?? 0, error: studErr?.message });

  // Try to select student_violations
  const { data: anonViolations, error: violErr } = await anonClient.from("student_violations").select("*");
  console.log("Anon student_violations access:", { count: anonViolations?.length ?? 0, error: violErr?.message });

  // Try to select counseling_records
  const { data: anonCounseling, error: counsErr } = await anonClient.from("counseling_records").select("*");
  console.log("Anon counseling_records access:", { count: anonCounseling?.length ?? 0, error: counsErr?.message });

  // Try to select merit_deductions
  const { data: anonDeductions, error: dedErr } = await anonClient.from("merit_deductions").select("*");
  console.log("Anon merit_deductions access:", { count: anonDeductions?.length ?? 0, error: dedErr?.message });

  // 2. Test SQLi payloads on Anon client
  const testPayloads = ["' OR 1=1 --", "10595' OR '1'='1", "admin'--"];
  for (const p of testPayloads) {
    const { data: pStudents } = await anonClient.from("students").select("*").or(`nis.eq.${p},nisn.eq.${p}`);
    console.log(`Anon students with payload [${p}]:`, { count: pStudents?.length ?? 0 });
  }
}

testRLS().catch(console.error);
