const fs = require('fs');
const path = require('path');
const assert = require('assert');

function testTabDom() {
  console.log("==============================================================");
  console.log(" 🧪 STEP 1 TEST: 3-TAB DOM ARCHITECTURE & DOM INTEGRITY");
  console.log("==============================================================\n");

  const indexPath = path.join(__dirname, "premiere-extension", "client", "index.html");
  const html = fs.readFileSync(indexPath, "utf8");

  // 1. Verify Tab Nav Buttons
  console.log("1. Checking Tab Navigation Buttons...");
  assert.ok(html.includes('id="navTabSubmissions"'), "Missing navTabSubmissions button");
  assert.ok(html.includes('id="navTabDownloads"'), "Missing navTabDownloads button");
  assert.ok(html.includes('id="navTabTemplate"'), "Missing navTabTemplate button");
  console.log("✅ All 3 Tab Navigation Buttons Present!");

  // 2. Verify Tab Panels
  console.log("\n2. Checking Tab Panel Containers...");
  assert.ok(html.includes('id="tabSubmissions"'), "Missing tabSubmissions panel");
  assert.ok(html.includes('id="tabDownloads"'), "Missing tabDownloads panel");
  assert.ok(html.includes('id="tabTemplate"'), "Missing tabTemplate panel");
  console.log("✅ All 3 Tab Panel Containers Present!");

  // 3. Verify Preserved Critical Element IDs
  console.log("\n3. Verifying Preserved Core DOM Element IDs...");
  const requiredIds = [
    "statusPill", "statusText", "btnRefresh", "studioIdInput", "btnSaveStudio", "btnToggleTemplate",
    "baseUrlInput", "btnSaveBaseUrl", "clientUrlDisplay", "btnCopyLink", "btnShareWhatsApp",
    "searchInput", "folderPathText", "btnSelectFolder", "contentArea", "downloadsArea",
    "templateBuilderSection", "btnCloseTemplate", "tplRitualName", "tplEnglishTag",
    "btnAddTplRitual", "tplRitualList", "btnResetTemplate", "btnSaveTemplate", "logConsole"
  ];

  requiredIds.forEach(id => {
    assert.ok(html.includes(`id="${id}"`), `Missing required DOM ID: #${id}`);
  });
  console.log(`✅ All ${requiredIds.length} Core DOM Element IDs Intact!`);

  console.log("\n==============================================================");
  console.log(" 🎉 STEP 1 VERIFICATION PASSED (100% SUCCESS)!");
  console.log("==============================================================");
}

testTabDom();
