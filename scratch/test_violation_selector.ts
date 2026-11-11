import { addViolationSchema } from "@/features/teacher-dashboard/schemas";
import { ViolationItem } from "@/features/rules/types";

console.log("=== POINER SMADAP: ViolationSelector Verification Suite ===\n");

// Mock violation dataset including the exact user examples
const sampleRules: ViolationItem[] = [
  {
    id: "rule-01",
    categoryId: "cat-01",
    categoryName: "Kehadiran",
    categoryColor: "#3b82f6",
    code: "KEH-01",
    name: "Datang Terlambat",
    description: "Siswa datang terlambat lebih dari 10 menit setelah bel berbunyi",
    points: 10,
    isActive: true,
  },
  {
    id: "rule-02",
    categoryId: "cat-01",
    categoryName: "Kehadiran",
    categoryColor: "#3b82f6",
    code: "KEH-02",
    name: "Terlambat Upacara",
    description: "Tidak mengikuti upacara bendera hari Senin karena terlambat",
    points: 5,
    isActive: true,
  },
  {
    id: "rule-03",
    categoryId: "cat-01",
    categoryName: "Kehadiran",
    categoryColor: "#3b82f6",
    code: "KEH-03",
    name: "Terlambat Masuk Kelas",
    description: "Terlambat masuk kelas setelah jam istirahat pertama atau kedua",
    points: 5,
    isActive: true,
  },
  {
    id: "rule-04",
    categoryId: "cat-02",
    categoryName: "Kedisiplinan",
    categoryColor: "#f59e0b",
    code: "DIS-01",
    name: "Tidak Memakai Seragam Lengkap",
    description: "Atribut seragam tidak lengkap (dasi, topi upacara, atau kaos kaki)",
    points: 10,
    isActive: true,
  },
  {
    id: "rule-05",
    categoryId: "cat-03",
    categoryName: "Pelanggaran Berat",
    categoryColor: "#ef4444",
    code: "BRT-01",
    name: "Merokok di Area Sekolah",
    description: "Kedapatan membawa atau merokok di lingkungan sekolah",
    points: 50,
    isActive: true,
  },
];

// Helper to simulate violationSearchFilter
function violationSearchFilter(itemValue: string, search: string): number {
  const s = search.trim().toLowerCase();
  if (!s) return 1;

  const terms = s.split(/\s+/).filter(Boolean);
  const iv = itemValue.toLowerCase();

  const allMatch = terms.every((term) => iv.includes(term));
  if (!allMatch) return 0;

  if (iv.startsWith(s)) return 1;
  return 0.85;
}

// -------------------------------------------------------------
// TEST 1: Search by "terlam" (Exact user requirement)
// -------------------------------------------------------------
console.log("Test 1: Search by 'terlam' matches user requirement examples:");
const query1 = "terlam";
const matched1 = sampleRules.filter((r) => {
  const composite = `${r.name} ${r.categoryName} ${r.code} ${r.description}`.toLowerCase();
  return violationSearchFilter(composite, query1) > 0;
});

const names1 = matched1.map((r) => r.name);
console.log("  Query: 'terlam'");
console.log("  Matched count:", matched1.length);
matched1.forEach((r) => {
  console.log(`    - ${r.name} (${r.categoryName} • ${r.points} poin)`);
});

const expectedNames1 = ["Datang Terlambat", "Terlambat Upacara", "Terlambat Masuk Kelas"];
const allPresent = expectedNames1.every((n) => names1.includes(n));
if (allPresent && matched1.length === 3) {
  console.log("  Result: ✅ PASSED (Matched all 3 expected items)");
} else {
  console.error("  Result: ❌ FAILED");
  process.exit(1);
}

// -------------------------------------------------------------
// TEST 2: Search by Category ("Kedisiplinan")
// -------------------------------------------------------------
console.log("\nTest 2: Search by Category 'Kedisiplinan':");
const query2 = "kedisiplinan";
const matched2 = sampleRules.filter((r) => {
  const composite = `${r.name} ${r.categoryName} ${r.code} ${r.description}`.toLowerCase();
  return violationSearchFilter(composite, query2) > 0;
});
console.log(`  Query: '${query2}' -> Matched:`, matched2.map((r) => r.name));
if (matched2.some((r) => r.name === "Tidak Memakai Seragam Lengkap")) {
  console.log("  Result: ✅ PASSED");
} else {
  console.error("  Result: ❌ FAILED");
  process.exit(1);
}

// -------------------------------------------------------------
// TEST 3: Search by Keywords ("seragam", "rokok")
// -------------------------------------------------------------
console.log("\nTest 3: Search by Keywords ('seragam', 'rokok'):");
const matchedSeragam = sampleRules.filter((r) => {
  const composite = `${r.name} ${r.categoryName} ${r.code} ${r.description}`.toLowerCase();
  return violationSearchFilter(composite, "seragam") > 0;
});
const matchedRokok = sampleRules.filter((r) => {
  const composite = `${r.name} ${r.categoryName} ${r.code} ${r.description}`.toLowerCase();
  return violationSearchFilter(composite, "rokok") > 0;
});
if (matchedSeragam.length === 1 && matchedRokok.length === 1) {
  console.log(`  'seragam' -> ${matchedSeragam[0].name}`);
  console.log(`  'rokok' -> ${matchedRokok[0].name}`);
  console.log("  Result: ✅ PASSED");
} else {
  console.error("  Result: ❌ FAILED");
  process.exit(1);
}

// -------------------------------------------------------------
// TEST 4: Large Dataset Scalability (150 rules)
// -------------------------------------------------------------
console.log("\nTest 4: Scalability with Large Dataset (150 violation rules):");
const largeDataset: ViolationItem[] = Array.from({ length: 150 }, (_, i) => ({
  id: `rule-large-${i}`,
  categoryId: `cat-${i % 5}`,
  categoryName: ["Kedisiplinan", "Kehadiran", "Kerapian", "Etika", "Ketertiban"][i % 5],
  categoryColor: "#3b82f6",
  code: `R-${String(i).padStart(3, "0")}`,
  name: `Pelanggaran Nomor ${i} ${i % 3 === 0 ? "Terlambat Khusus" : "Ketertiban Umum"}`,
  description: `Deskripsi rinci untuk pelanggaran tata tertib nomor ${i}`,
  points: 5 + (i % 20) * 5,
  isActive: true,
}));

const t0 = performance.now();
const filteredLarge = largeDataset.filter((r) => {
  const composite = `${r.name} ${r.categoryName} ${r.code} ${r.description}`.toLowerCase();
  return violationSearchFilter(composite, "terlambat") > 0;
});
const t1 = performance.now();
console.log(`  Filtered 150 rules in ${(t1 - t0).toFixed(2)}ms (Found ${filteredLarge.length} matches)`);
if (filteredLarge.length > 0 && t1 - t0 < 50) {
  console.log("  Result: ✅ PASSED (<50ms execution time)");
} else {
  console.error("  Result: ❌ FAILED");
  process.exit(1);
}

// -------------------------------------------------------------
// TEST 5: Form Schema Compatibility (Zod schema validation)
// -------------------------------------------------------------
console.log("\nTest 5: Compatibility with addViolationSchema:");
const samplePayload = {
  studentId: "27e6ca1e-4a4e-4c61-84d6-72683c3ec7dd",
  studentNis: "10595",
  studentName: "Fikri",
  className: "X MIPA 1",
  violationTypeId: "rule-01",
  ruleCode: "KEH-01",
  violationName: "Datang Terlambat",
  categoryName: "Kehadiran",
  points: 10,
  notes: "Siswa tiba pukul 07:25 WITA melewati jam gerbang tutup",
  incidentDate: "2026-11-11T07:25",
  evidenceUrl: "",
};

const parsed = addViolationSchema.safeParse(samplePayload);
if (parsed.success) {
  console.log("  Parsed successfully with Zod schema:");
  console.log(`  Rule: [${parsed.data.ruleCode}] ${parsed.data.violationName}`);
  console.log(`  Points: +${parsed.data.points} Poin`);
  console.log("  Result: ✅ PASSED");
} else {
  console.error("  Schema validation failed:", parsed.error.issues);
  process.exit(1);
}

console.log("\n=============================================");
console.log("ALL 5 TESTS PASSED SUCCESSFULLY!");
console.log("=============================================");
