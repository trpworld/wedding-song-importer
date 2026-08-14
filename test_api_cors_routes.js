const assert = require('assert');

async function testApiCorsRoutes() {
  console.log("==============================================================");
  console.log(" 🧪 STEP 2 TEST: CLIENT ROUTE HANDLING & CORS PREFLIGHT");
  console.log("==============================================================\n");

  const baseUrl = "http://localhost:3000";

  // 1. Test OPTIONS Preflight for /api/submissions
  console.log("1. Testing OPTIONS preflight for /api/submissions...");
  const optSubRes = await fetch(`${baseUrl}/api/submissions`, { method: "OPTIONS" });
  console.log("OPTIONS Submissions Status:", optSubRes.status);
  console.log("CORS Header Origin:", optSubRes.headers.get("access-control-allow-origin"));
  assert.strictEqual(optSubRes.status, 200);
  assert.strictEqual(optSubRes.headers.get("access-control-allow-origin"), "*");

  // 2. Test OPTIONS Preflight for /api/templates
  console.log("\n2. Testing OPTIONS preflight for /api/templates...");
  const optTplRes = await fetch(`${baseUrl}/api/templates`, { method: "OPTIONS" });
  console.log("OPTIONS Templates Status:", optTplRes.status);
  console.log("CORS Header Methods:", optTplRes.headers.get("access-control-allow-methods"));
  assert.strictEqual(optTplRes.status, 200);
  assert.strictEqual(optTplRes.headers.get("access-control-allow-origin"), "*");

  // 3. Test GET /api/submissions?studioId=studio_cors_test with CORS headers
  console.log("\n3. Testing GET /api/submissions with CORS headers...");
  const getSubRes = await fetch(`${baseUrl}/api/submissions?studioId=studio_cors_test`);
  console.log("GET Submissions Status:", getSubRes.status);
  assert.strictEqual(getSubRes.status, 200);
  assert.strictEqual(getSubRes.headers.get("access-control-allow-origin"), "*");

  // 4. Test GET /api/templates?studioId=studio_cors_test with CORS headers
  console.log("\n4. Testing GET /api/templates with CORS headers...");
  const getTplRes = await fetch(`${baseUrl}/api/templates?studioId=studio_cors_test`);
  console.log("GET Templates Status:", getTplRes.status);
  assert.strictEqual(getTplRes.status, 200);
  assert.strictEqual(getTplRes.headers.get("access-control-allow-origin"), "*");

  console.log("\n==============================================================");
  console.log(" 🎉 STEP 2 VERIFICATION PASSED (100% SUCCESS)!");
  console.log("==============================================================");
}

testApiCorsRoutes().catch(err => {
  console.error("❌ STEP 2 TEST FAILED:", err);
  process.exit(1);
});
