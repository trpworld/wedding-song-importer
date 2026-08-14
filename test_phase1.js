const assert = require('assert');

async function runPhase1Test() {
  console.log("==============================================================");
  console.log(" 🧪 PHASE 1 VERIFICATION: Multi-Studio API Isolation Test");
  console.log("==============================================================\n");

  const baseUrl = "http://localhost:3000";

  // 1. Submit for studio_alpha
  console.log("1. Submitting playlist for studio_alpha...");
  const alphaPayload = {
    studio_id: "studio_alpha",
    client_name: "Alpha Couple (Arjun & Diya)",
    event_date: "2026-11-20",
    phone: "+91 9000000001",
    general_notes: "Alpha studio project notes",
    songs: [{ ritualName: "Gaye Holud (Alpha)", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" }]
  };

  const alphaRes = await fetch(`${baseUrl}/api/submissions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(alphaPayload)
  });
  const alphaJson = await alphaRes.json();
  console.log("Alpha POST Status:", alphaRes.status, "ID:", alphaJson.data?.id);
  assert.strictEqual(alphaRes.status, 200, "Alpha POST status should be 200");
  assert.strictEqual(alphaJson.data.studio_id, "studio_alpha", "Studio ID should be studio_alpha");

  // 2. Submit for studio_beta
  console.log("\n2. Submitting playlist for studio_beta...");
  const betaPayload = {
    studio_id: "studio_beta",
    client_name: "Beta Couple (Vikram & Neha)",
    event_date: "2026-12-05",
    phone: "+91 9000000002",
    general_notes: "Beta studio project notes",
    songs: [{ ritualName: "Sindoor Daan (Beta)", url: "https://www.youtube.com/watch?v=kJQP7kiw5Fk" }]
  };

  const betaRes = await fetch(`${baseUrl}/api/submissions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(betaPayload)
  });
  const betaJson = await betaRes.json();
  console.log("Beta POST Status:", betaRes.status, "ID:", betaJson.data?.id);
  assert.strictEqual(betaRes.status, 200, "Beta POST status should be 200");
  assert.strictEqual(betaJson.data.studio_id, "studio_beta", "Studio ID should be studio_beta");

  // 3. Query GET /api/submissions?studioId=studio_alpha
  console.log("\n3. Querying GET /api/submissions?studioId=studio_alpha...");
  const getAlphaRes = await fetch(`${baseUrl}/api/submissions?studioId=studio_alpha`);
  const getAlphaJson = await getAlphaRes.json();
  console.log("Alpha GET Status:", getAlphaRes.status, "Count:", getAlphaJson.data?.length);

  assert.strictEqual(getAlphaRes.status, 200, "GET Alpha status should be 200");
  assert.ok(getAlphaJson.data.length > 0, "Alpha data array should not be empty");
  getAlphaJson.data.forEach(item => {
    assert.strictEqual(item.studio_id, "studio_alpha", `All items returned for studio_alpha must have studio_id='studio_alpha'. Found: ${item.studio_id}`);
  });
  console.log("✅ Verified: GET /api/submissions?studioId=studio_alpha returns ONLY studio_alpha submissions!");

  // 4. Query GET /api/submissions?studioId=studio_beta
  console.log("\n4. Querying GET /api/submissions?studioId=studio_beta...");
  const getBetaRes = await fetch(`${baseUrl}/api/submissions?studioId=studio_beta`);
  const getBetaJson = await getBetaRes.json();
  console.log("Beta GET Status:", getBetaRes.status, "Count:", getBetaJson.data?.length);

  assert.strictEqual(getBetaRes.status, 200, "GET Beta status should be 200");
  assert.ok(getBetaJson.data.length > 0, "Beta data array should not be empty");
  getBetaJson.data.forEach(item => {
    assert.strictEqual(item.studio_id, "studio_beta", `All items returned for studio_beta must have studio_id='studio_beta'. Found: ${item.studio_id}`);
  });
  console.log("✅ Verified: GET /api/submissions?studioId=studio_beta returns ONLY studio_beta submissions!");

  console.log("\n==============================================================");
  console.log(" 🎉 PHASE 1 VERIFICATION TEST PASSED (100% SUCCESS)");
  console.log("==============================================================");
}

runPhase1Test().catch(err => {
  console.error("❌ PHASE 1 TEST FAILED:", err);
  process.exit(1);
});
