const cp = require('child_process');
const path = require('path');
const fs = require('fs');
const assert = require('assert');

async function runPhase4Test() {
  console.log("==============================================================");
  console.log(" 🧪 PHASE 4 VERIFICATION: 1-Click Installer, Plist & ZIP Test");
  console.log("==============================================================\n");

  const zipPath = path.join(__dirname, "dist", "Wedding_Song_Importer_MacOS.zip");
  console.log("1. Checking production ZIP archive existence at:", zipPath);
  assert.ok(fs.existsSync(zipPath), `ZIP archive file must exist at ${zipPath}`);

  const zipStats = fs.statSync(zipPath);
  console.log(`Production ZIP Size: ${(zipStats.size / (1024 * 1024)).toFixed(2)} MB`);

  // 2. Test ZIP Integrity using unzip -t
  console.log("\n2. Testing ZIP archive integrity (unzip -t)...");
  const unzipTestOutput = cp.execSync(`unzip -t "${zipPath}"`).toString();
  assert.ok(unzipTestOutput.includes("No errors detected in compressed data"), "ZIP archive integrity check failed");
  console.log("✅ ZIP Archive Integrity Check PASSED (0 errors)!");

  // 3. Test Installation Dry-Run & Plist Lint
  console.log("\n3. Testing 1-Click Installation Script (Install.command)...");
  const installScriptPath = path.join(__dirname, "dist_staging", "Install.command");
  assert.ok(fs.existsSync(installScriptPath), "Install.command must exist");

  // Run Install.command
  const installOutput = cp.execSync(`bash "${installScriptPath}"`).toString();
  console.log("Install Log Summary:\n", installOutput.split('\n').slice(0, 10).join('\n'));

  // 4. Verify installed artifacts
  const installedCepPath = path.join(process.env.HOME, "Library", "Application Support", "Adobe", "CEP", "extensions", "com.wedding.songimporter");
  const installedBinaryPath = path.join(process.env.HOME, "Library", "Application Support", "WeddingSongImporter", "bin", "wedding-agent-darwin");
  const installedPlistPath = path.join(process.env.HOME, "Library", "LaunchAgents", "com.trpworld.weddingimporter.plist");

  console.log("\n4. Verifying Installed Locations:");
  console.log(" - Installed CEP Extension Path:", installedCepPath, fs.existsSync(installedCepPath) ? "✅ EXISTS" : "❌ MISSING");
  console.log(" - Installed Binary Executable Path:", installedBinaryPath, fs.existsSync(installedBinaryPath) ? "✅ EXISTS" : "❌ MISSING");
  console.log(" - Installed LaunchAgent Plist Path:", installedPlistPath, fs.existsSync(installedPlistPath) ? "✅ EXISTS" : "❌ MISSING");

  assert.ok(fs.existsSync(installedCepPath), "Installed CEP directory must exist");
  assert.ok(fs.existsSync(installedBinaryPath), "Installed binary executable must exist");
  assert.ok(fs.existsSync(installedPlistPath), "Installed LaunchAgent plist must exist");

  // 5. Plist Syntax Verification using plutil -lint
  console.log("\n5. Verifying LaunchAgent plist syntax (plutil -lint)...");
  const plistLintOutput = cp.execSync(`plutil -lint "${installedPlistPath}"`).toString().trim();
  console.log("plutil Result:", plistLintOutput);
  assert.ok(plistLintOutput.includes("OK"), "LaunchAgent plist syntax verification failed");
  console.log("✅ LaunchAgent Plist Syntax Verification PASSED!");

  console.log("\n==============================================================");
  console.log(" 🎉 PHASE 4 VERIFICATION TEST PASSED (100% SUCCESS)");
  console.log("==============================================================");
}

runPhase4Test().catch(err => {
  console.error("❌ PHASE 4 TEST FAILED:", err);
  process.exit(1);
});
