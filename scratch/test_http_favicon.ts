import { spawn } from "child_process";
import http from "http";

const PORT = 3009;

function fetchUrl(path: string): Promise<{ statusCode: number; headers: http.IncomingHttpHeaders; body: string }> {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:${PORT}${path}`, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => resolve({ statusCode: res.statusCode || 0, headers: res.headers, body }));
    }).on("error", reject);
  });
}

async function run() {
  console.log("Starting Next.js production server for E2E favicon test...");
  const server = spawn("npx", ["next", "start", "-p", String(PORT)], {
    env: { ...process.env, PORT: String(PORT) },
    stdio: "pipe",
  });

  // Wait for server to be ready
  let ready = false;
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    try {
      const res = await fetchUrl("/");
      if (res.statusCode === 200) {
        ready = true;
        break;
      }
    } catch {
      // not ready yet
    }
  }

  if (!ready) {
    console.error("Server failed to start within timeout");
    server.kill();
    process.exit(1);
  }

  console.log("Next.js server is ready. Testing HTTP responses...");

  // 1. Primary Favicon
  const resAssets = await fetchUrl("/assets/favicon.ico");
  console.log(`GET /assets/favicon.ico -> HTTP ${resAssets.statusCode} (Length: ${resAssets.body.length} bytes, Type: ${resAssets.headers["content-type"]})`);
  if (resAssets.statusCode !== 200) {
    console.error("❌ FAILED: /assets/favicon.ico did not return HTTP 200");
  }

  // 2. Root Fallback Favicon (direct browser request)
  const resRoot = await fetchUrl("/favicon.ico");
  console.log(`GET /favicon.ico -> HTTP ${resRoot.statusCode} (Length: ${resRoot.body.length} bytes, Type: ${resRoot.headers["content-type"]})`);
  if (resRoot.statusCode !== 200) {
    console.error("❌ FAILED: /favicon.ico did not return HTTP 200");
  }

  // 3. Landing Page HTML Head
  const resLanding = await fetchUrl("/");
  const hasIconLanding = resLanding.body.includes('<link rel="icon" href="/assets/favicon.ico"/>');
  console.log(`Landing Page HTML contains <link rel="icon" href="/assets/favicon.ico"/>: ${hasIconLanding ? "✅ YES" : "❌ NO"}`);

  // 4. Login Page HTML Head
  const resLogin = await fetchUrl("/login");
  const hasIconLogin = resLogin.body.includes('<link rel="icon" href="/assets/favicon.ico"/>');
  console.log(`Login Page HTML contains <link rel="icon" href="/assets/favicon.ico"/>: ${hasIconLogin ? "✅ YES" : "❌ NO"}`);

  // 5. Check duplicate icon tags on landing
  const iconTagCount = (resLanding.body.match(/<link[^>]*rel="icon"/g) || []).length;
  console.log(`Landing Page <link rel="icon"> count: ${iconTagCount} (Expected: 1)`);

  server.kill();
  console.log("=== End of HTTP Favicon Test ===");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
