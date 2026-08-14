const assert = require('assert');

async function testAgentRobustness() {
  console.log("==============================================================");
  console.log(" 🧪 STEP 3 TEST: LOCAL AGENT PORT & DOWNLOAD ENGINE STABILITY");
  console.log("==============================================================\n");

  const agentUrl = "http://localhost:5050";

  // 1. Test /health endpoint
  console.log("1. Testing GET /health endpoint...");
  const healthRes = await fetch(`${agentUrl}/health`);
  const healthJson = await healthRes.json();
  console.log("Health Status:", healthRes.status, "Message:", healthJson.message);
  assert.strictEqual(healthRes.status, 200);
  assert.strictEqual(healthJson.status, "ok");
  console.log("✅ Verified: Local Agent port 5050 is active and responding!");

  // 2. Test /download endpoint with invalid URL error trap
  console.log("\n2. Testing /download with invalid YouTube URL (error trap check)...");
  const downloadPayload = {
    submissionId: "test-robustness-1",
    clientName: "Robustness Couple",
    songs: [
      {
        ritualName: "Invalid Track Test",
        url: "https://invalid-nonexistent-youtube-domain-xyz.com/watch?v=00000",
        notes: "Invalid URL test"
      }
    ],
    downloadDir: "/tmp/wedding_test_robustness"
  };

  const downRes = await fetch(`${agentUrl}/download`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(downloadPayload)
  });

  const downJson = await downRes.json();
  console.log("Download Response Status:", downRes.status, "Status Key:", downJson.status);
  console.log("Errors array length:", downJson.errors?.length);
  assert.ok(downRes.status === 200 || downRes.status === 500, "Should return HTTP 200/500 with JSON payload");
  assert.ok(Array.isArray(downJson.errors), "Errors must be an array");
  console.log("✅ Verified: Agent gracefully traps download errors without crashing process!");

  console.log("\n==============================================================");
  console.log(" 🎉 STEP 3 VERIFICATION PASSED (100% SUCCESS)!");
  console.log("==============================================================");
}

testAgentRobustness().catch(err => {
  console.error("❌ STEP 3 TEST FAILED:", err);
  process.exit(1);
});
