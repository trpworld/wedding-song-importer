const cp = require('child_process');
const path = require('path');
const fs = require('fs');
const assert = require('assert');

async function runPhase3Test() {
  console.log("==============================================================");
  console.log(" 🧪 PHASE 3 VERIFICATION: Standalone macOS Binary Execution Test");
  console.log("==============================================================\n");

  const binaryPath = path.join(__dirname, "dist_staging", "bin", "wedding-agent-darwin");
  console.log("1. Checking binary existence at:", binaryPath);
  assert.ok(fs.existsSync(binaryPath), `Binary file must exist at ${binaryPath}`);

  // Ensure executable permissions
  fs.chmodSync(binaryPath, '755');
  const stats = fs.statSync(binaryPath);
  console.log(`Binary size: ${(stats.size / (1024 * 1024)).toFixed(2)} MB`);

  // 2. Kill any running process on port 5050 & wait for release
  try {
    cp.execSync("lsof -ti:5050 | xargs kill -9 2>/dev/null || true");
  } catch (e) {}

  let attempts = 0;
  while (attempts < 10) {
    try {
      const check = cp.execSync("lsof -ti:5050 2>/dev/null || true").toString().trim();
      if (!check) break;
    } catch (e) {}
    await new Promise(r => setTimeout(r, 500));
    attempts++;
  }

  // 3. Spawn compiled standalone binary directly
  console.log("\n2. Spawning standalone binary directly (no Python runtime)...");
  const agentProc = cp.spawn(binaryPath, [], {
    detached: true,
    stdio: 'ignore'
  });
  agentProc.unref();

  // Poll until HTTP 200 health check succeeds
  console.log("\n3. Testing GET http://localhost:5050/health...");
  let healthOk = false;
  for (let i = 0; i < 10; i++) {
    await new Promise(r => setTimeout(r, 800));
    try {
      const res = await fetch("http://localhost:5050/health");
      if (res.ok) {
        healthOk = true;
        const healthJson = await res.json();
        console.log("Health HTTP Status:", res.status, "Payload:", healthJson);
        assert.strictEqual(healthJson.status, "ok", "Status must be ok");
        break;
      }
    } catch (e) {}
  }
  assert.ok(healthOk, "Standalone binary health check failed to respond on port 5050");

  // 5. Test /download endpoint with custom directory override
  console.log("\n4. Testing POST http://localhost:5050/download with standalone binary...");
  const customTargetDir = path.join(__dirname, "scratch", "BinaryTestOutput");
  fs.mkdirSync(customTargetDir, { recursive: true });

  const dlPayload = {
    id: "binary-test-001",
    clientName: "Standalone Binary Test Couple",
    eventDate: "2026-10-10",
    phone: "+1 555-0199",
    general_notes: "Downloaded using compiled standalone binary!",
    downloadDir: customTargetDir,
    songs: [
      {
        ritualName: "Standalone Test Song",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        notes: "Binary verification"
      }
    ]
  };

  const dlRes = await fetch("http://localhost:5050/download", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dlPayload)
  });

  const dlJson = await dlRes.json();
  console.log("Download Result Status:", dlJson.status);
  console.log("Downloaded Notes File:", dlJson.notes_file);
  assert.strictEqual(dlJson.status, "success", "Download status must be success");
  assert.ok(fs.existsSync(dlJson.notes_file), "Special_Notes.txt must exist");

  const notesText = fs.readFileSync(dlJson.notes_file, "utf8");
  console.log("\n📄 Special_Notes.txt Preview:");
  console.log(notesText);

  // 6. Terminate process cleanly
  console.log("\n5. Terminating test process...");
  try {
    cp.execSync("lsof -ti:5050 | xargs kill -9 2>/dev/null || true");
  } catch (e) {}

  console.log("\n==============================================================");
  console.log(" 🎉 PHASE 3 VERIFICATION TEST PASSED (100% SUCCESS)");
  console.log("==============================================================");
}

runPhase3Test().catch(err => {
  console.error("❌ PHASE 3 TEST FAILED:", err);
  try {
    cp.execSync("lsof -ti:5050 | xargs kill -9 2>/dev/null || true");
  } catch (e) {}
  process.exit(1);
});
