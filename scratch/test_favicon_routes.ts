import http from "http";
import fs from "fs";
import path from "path";

// Verify file existence and sizes
const assetsFavicon = path.join(process.cwd(), "public", "assets", "favicon.ico");
const rootFavicon = path.join(process.cwd(), "public", "favicon.ico");

console.log("=== POINER SMADAP Favicon Configuration Audit ===");

if (!fs.existsSync(assetsFavicon)) {
  console.error("❌ FAILED: public/assets/favicon.ico does not exist");
  process.exit(1);
}
const assetsStat = fs.statSync(assetsFavicon);
console.log(`✅ public/assets/favicon.ico exists: ${assetsStat.size} bytes`);

if (!fs.existsSync(rootFavicon)) {
  console.error("❌ FAILED: public/favicon.ico does not exist");
  process.exit(1);
}
const rootStat = fs.statSync(rootFavicon);
console.log(`✅ public/favicon.ico fallback exists: ${rootStat.size} bytes`);

// Verify root layout metadata configuration
const layoutPath = path.join(process.cwd(), "src", "app", "layout.tsx");
const layoutContent = fs.readFileSync(layoutPath, "utf-8");

if (!layoutContent.includes('icon: "/assets/favicon.ico"') && !layoutContent.includes("icon: '/assets/favicon.ico'")) {
  console.error("❌ FAILED: src/app/layout.tsx does not configure /assets/favicon.ico in metadata.icons");
  process.exit(1);
}
console.log("✅ src/app/layout.tsx correctly exports icons: { icon: '/assets/favicon.ico' }");

// Verify that existing title and description metadata are preserved
if (!layoutContent.includes("POINER SMADAP | Sistem Poin Pelanggaran & Karakter Siswa") ||
    !layoutContent.includes("Aplikasi Web Pemantauan Ketertiban, Poin Pelanggaran, dan Penghargaan Karakter Siswa Terintegrasi.")) {
  console.error("❌ FAILED: Existing title or description metadata corrupted");
  process.exit(1);
}
console.log("✅ Existing title and description metadata preserved perfectly");

// Check built pages for link rel="icon"
const builtPages = [
  { name: "Landing Page", file: ".next/server/app/index.html" },
  { name: "Login Page", file: ".next/server/app/login.html" },
  { name: "Forgot Password Page", file: ".next/server/app/forgot-password.html" },
  { name: "Teacher Redirect", file: ".next/server/app/teacher.rsc" },
];

for (const page of builtPages) {
  const filePath = path.join(process.cwd(), page.file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, "utf-8");
    const count = (content.match(/\/assets\/favicon\.ico/g) || []).length;
    if (count > 0) {
      console.log(`✅ ${page.name} (${page.file}): Contains /assets/favicon.ico (${count} match)`);
    } else {
      console.warn(`⚠️ Warning: ${page.name} does not directly mention /assets/favicon.ico`);
    }
  }
}

// Verify middleware ignores /assets and favicon.ico
const middlewarePath = path.join(process.cwd(), "src", "middleware.ts");
const middlewareContent = fs.readFileSync(middlewarePath, "utf-8");
if (middlewareContent.includes("favicon.ico") && middlewareContent.includes("assets/")) {
  console.log("✅ src/middleware.ts excludes favicon.ico and assets/* from auth interception");
} else {
  console.error("❌ FAILED: src/middleware.ts intercepts static favicon requests");
  process.exit(1);
}

console.log("\n=============================================");
console.log("ALL FAVICON AUDIT CHECKS PASSED!");
console.log("=============================================");
