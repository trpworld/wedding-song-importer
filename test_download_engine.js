const assert = require('assert');

async function testDownloadEngine() {
  console.log("==============================================================");
  console.log(" 🧪 STEP 1 TEST: ULTRA-FAST DOWNLOAD ENGINE & PROGRESS API");
  console.log("==============================================================\n");

  const agentUrl = "http://localhost:5050";

  // 1. Health check
  console.log("1. Checking Agent Health /health...");
  const healthRes = await fetch(`${agentUrl}/health`);
  const healthJson = await healthRes.json();
  console.log("Health Status:", healthRes.status, "Service:", healthJson.service);
  assert.strictEqual(healthRes.status, 200);
  assert.strictEqual(healthJson.status, "ok");

  // 2. Poll initial progress for non-existent job
  console.log("\n2. Polling GET /progress?job_id=job-test-123...");
  const progRes = await fetch(`${agentUrl}/progress?job_id=job-test-123`);
  const progJson = await progRes.json();
  console.log("Initial Progress:", progJson);
  assert.strictEqual(progRes.status, 200);
  assert.strictEqual(progJson.status, "idle");
  assert.strictEqual(progJson.percentage, 0);

  // 3. Test progress state transition during /download simulation
  console.log("\n3. Triggering download job and checking live progress state...");
  const jobId = `job-test-${Date.now()}`;
  const downloadPayload = {
    job_id: jobId,
    submissionId: "sub-speed-1",
    clientName: "Speed Test Couple",
    songs: [
      { ritualName: "Borjatri", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", notes: "Fast" }
    ],
    downloadDir: "/tmp/wedding_speed_test"
  };

  const downPromise = fetch(`${agentUrl}/download`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(downloadPayload)
  });

  // Short delay then poll progress
  await new Promise(r => setTimeout(r, 200));
  const activeProgRes = await fetch(`${agentUrl}/progress?job_id=${jobId}`);
  const activeProgJson = await activeProgRes.json();
  console.log("Active Job Progress:", activeProgJson);
  assert.strictEqual(activeProgRes.status, 200);
  assert.ok(activeProgJson.percentage >= 0, "Percentage should be >= 0");

  const downRes = await downPromise;
  const downJson = await downRes.json();
  console.log("Download Finish Status:", downRes.status, "Message:", downJson.message);
  assert.strictEqual(downRes.status, 200);

  // Poll final completed progress
  const finalProgRes = await fetch(`${agentUrl}/progress?job_id=${jobId}`);
  const finalProgJson = await finalProgRes.json();
  console.log("Final Job Progress:", finalProgJson);
  assert.strictEqual(finalProgJson.status, "completed");
  assert.strictEqual(finalProgJson.percentage, 100);

  console.log("\n==============================================================");
  console.log(" 🎉 STEP 1 VERIFICATION PASSED (100% SUCCESS)!");
  console.log("==============================================================");
}

testDownloadEngine().catch(err => {
  console.error("❌ STEP 1 TEST FAILED:", err);
  process.exit(1);
});
