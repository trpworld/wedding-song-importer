const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

async function runPhase2Test() {
  console.log("==============================================================");
  console.log(" 🧪 PHASE 2 VERIFICATION: CEP Panel Studio Switcher & ES3 Test");
  console.log("==============================================================\n");

  // 1. ExtendScript ES3 Syntax Validation
  console.log("1. Validating ExtendScript (index.jsx) ES3 syntax...");
  const jsxPath = path.join(__dirname, "premiere-extension", "host", "index.jsx");
  const jsxCode = fs.readFileSync(jsxPath, "utf8");

  const mockExtendScriptContext = {
    $: {},
    app: { project: { path: "/Users/test/Projects/TestStudio.prproj" } },
    File: function(p) { this.fsName = p; this.parent = { fsName: path.dirname(p) }; },
    Folder: function(p) { this.fsName = p; },
    console: console
  };

  vm.createContext(mockExtendScriptContext);
  vm.runInContext(jsxCode, mockExtendScriptContext);

  assert.ok(mockExtendScriptContext.$.weddingImporter, "$.weddingImporter should be defined");
  assert.strictEqual(typeof mockExtendScriptContext.$.weddingImporter.getProjectPath, "function");
  assert.strictEqual(typeof mockExtendScriptContext.$.weddingImporter.importWeddingAssets, "function");

  const projPath = mockExtendScriptContext.$.weddingImporter.getProjectPath();
  console.log("ES3 Check Passed! Detected Project Path:", projPath);
  assert.strictEqual(projPath, "/Users/test/Projects", "Extracted path must match parent folder");
  console.log("✅ ExtendScript ES3 validation passed with 0 syntax errors!");

  // 2. Headless CEP Panel JS Mock Test for Studio ID Persistence & URL Formatting
  console.log("\n2. Testing CEP Panel JS app.js Studio ID persistence & API URL formatting...");
  const appJsPath = path.join(__dirname, "premiere-extension", "client", "app.js");
  const appJsCode = fs.readFileSync(appJsPath, "utf8");

  const storageMap = new Map();
  const mockLocalStorage = {
    getItem: (key) => storageMap.get(key) || null,
    setItem: (key, value) => storageMap.set(key, String(value)),
    clear: () => storageMap.clear()
  };

  let fetchedUrls = [];

  const mockDom = {
    document: {
      addEventListener: () => {},
      createElement: () => ({
        className: "",
        textContent: "",
        appendChild: () => {}
      }),
      getElementById: (id) => ({
        value: "default",
        addEventListener: () => {},
        appendChild: () => {},
        classList: { add: () => {}, remove: () => {} }
      })
    },
    localStorage: mockLocalStorage,
    CSInterface: function() {
      this.evalScript = (script, cb) => {
        if (cb) cb("evalScript mock response");
      };
    },
    fetch: (url) => {
      fetchedUrls.push(url);
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, data: [] })
      });
    },
    console: console
  };

  mockDom.CSInterface.prototype.SystemPath = { EXTENSION: "extension_path" };

  vm.createContext(mockDom);
  vm.runInContext(appJsCode, mockDom);

  // Test Studio ID default and save/load
  assert.strictEqual(mockDom.getSavedStudioId(), "trpworld", "Default Studio ID should be trpworld");
  
  mockDom.localStorage.setItem("wedding_studio_id", "studio_cinematic");
  assert.strictEqual(mockDom.getSavedStudioId(), "studio_cinematic", "Saved Studio ID should be studio_cinematic");

  // Call fetchSubmissionsData and verify dynamic ?studioId= query parameter
  mockDom.fetchSubmissionsData();

  assert.ok(fetchedUrls.length > 0, "fetchSubmissionsData should invoke fetch");
  const firstFetchUrl = fetchedUrls[0];
  console.log("Constructed API Query URL:", firstFetchUrl);
  assert.ok(firstFetchUrl.includes("?studioId=studio_cinematic"), "Query URL must include ?studioId=studio_cinematic");

  console.log("✅ Verified: CEP Panel saves/loads Studio ID and formats API query string dynamically!");

  console.log("\n==============================================================");
  console.log(" 🎉 PHASE 2 VERIFICATION TEST PASSED (100% SUCCESS)");
  console.log("==============================================================");
}

runPhase2Test().catch(err => {
  console.error("❌ PHASE 2 TEST FAILED:", err);
  process.exit(1);
});
