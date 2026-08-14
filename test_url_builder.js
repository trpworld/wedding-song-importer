const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

async function testUrlBuilder() {
  console.log("==============================================================");
  console.log(" 🧪 STEP 1 TEST: DYNAMIC BASE URL & CONFIG IN CEP EXTENSION");
  console.log("==============================================================\n");

  const appJsPath = path.join(__dirname, "premiere-extension", "client", "app.js");
  const appJsCode = fs.readFileSync(appJsPath, "utf8");

  const storageMap = new Map();
  const mockLocalStorage = {
    getItem: (key) => storageMap.get(key) || null,
    setItem: (key, value) => storageMap.set(key, String(value)),
    clear: () => storageMap.clear()
  };

  let elementMap = new Map();
  function createMockElement(id) {
    const el = {
      id: id,
      value: "",
      textContent: "",
      title: "",
      listeners: {},
      addEventListener: function(event, fn) { this.listeners[event] = fn; },
      click: function() { if (this.listeners['click']) this.listeners['click'](); }
    };
    elementMap.set(id, el);
    return el;
  }

  const mockDom = {
    document: {
      addEventListener: () => {},
      createElement: () => ({ className: "", textContent: "", appendChild: () => {} }),
      getElementById: (id) => elementMap.get(id) || createMockElement(id)
    },
    localStorage: mockLocalStorage,
    window: { location: { origin: "http://localhost:3000" } },
    navigator: { clipboard: { writeText: () => Promise.resolve() } },
    CSInterface: function() { this.evalScript = (s, cb) => { if (cb) cb(""); }; },
    fetch: () => Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true, data: [] }) }),
    setTimeout: setTimeout,
    console: console
  };

  mockDom.CSInterface.prototype.SystemPath = { EXTENSION: "extension_path" };

  vm.createContext(mockDom);
  vm.runInContext(appJsCode, mockDom);

  // 1. Test Default Base URL fallback
  console.log("1. Testing Default Base URL fallback...");
  const defaultBase = mockDom.getSavedBaseUrl();
  console.log("Default Base URL:", defaultBase);
  assert.strictEqual(defaultBase, "http://localhost:3000");

  // 2. Test Custom Saved Base URL with trailing slashes
  console.log("\n2. Setting custom Base URL with trailing slashes...");
  mockLocalStorage.setItem("wedding_base_url", "https://my-custom-domain.com///");
  const customBase = mockDom.getSavedBaseUrl();
  console.log("Cleaned Base URL:", customBase);
  assert.strictEqual(customBase, "https://my-custom-domain.com");

  // 3. Test Dynamic Client Form URL with special characters in Studio ID
  console.log("\n3. Testing Client Form URL construction with special characters...");
  mockLocalStorage.setItem("wedding_studio_id", "studio & royal / 2026");
  const clientUrl = mockDom.getClientFormUrl();
  console.log("Generated Client Form URL:", clientUrl);
  assert.strictEqual(clientUrl, "https://my-custom-domain.com/studio%20%26%20royal%20%2F%202026");

  // 4. Test API Endpoints Construction
  console.log("\n4. Testing Cloud API URL construction...");
  const submissionsApiUrl = mockDom.getCloudApiUrl("submissions?studioId=studio_alpha");
  console.log("Submissions API URL:", submissionsApiUrl);
  assert.strictEqual(submissionsApiUrl, "https://my-custom-domain.com/api/submissions?studioId=studio_alpha");

  const templatesApiUrl = mockDom.getCloudApiUrl("templates?studioId=studio_alpha");
  console.log("Templates API URL:", templatesApiUrl);
  assert.strictEqual(templatesApiUrl, "https://my-custom-domain.com/api/templates?studioId=studio_alpha");

  console.log("\n==============================================================");
  console.log(" 🎉 STEP 1 VERIFICATION PASSED (100% SUCCESS)!");
  console.log("==============================================================");
}

testUrlBuilder().catch(err => {
  console.error("❌ STEP 1 TEST FAILED:", err);
  process.exit(1);
});
