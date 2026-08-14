const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

async function verifyShareFeature() {
  console.log("==============================================================");
  console.log(" 🧪 VERIFYING CLIENT LINK COPY & WHATSAPP SHARE FEATURE");
  console.log("==============================================================\n");

  const appJsPath = path.join(__dirname, "premiere-extension", "client", "app.js");
  const appJsCode = fs.readFileSync(appJsPath, "utf8");

  const storageMap = new Map();
  const mockLocalStorage = {
    getItem: (key) => storageMap.get(key) || null,
    setItem: (key, value) => storageMap.set(key, String(value)),
    clear: () => storageMap.clear()
  };

  let openedUrl = "";
  let elementMap = new Map();

  function createMockElement(id) {
    const el = {
      id: id,
      value: "",
      textContent: "",
      title: "",
      listeners: {},
      addEventListener: function(event, fn) { this.listeners[event] = fn; },
      click: function() { if (this.listeners['click']) this.listeners['click'](); },
      select: function() {},
      appendChild: function() {}
    };
    elementMap.set(id, el);
    return el;
  }

  const mockDom = {
    document: {
      addEventListener: () => {},
      createElement: () => ({ className: "", textContent: "", appendChild: () => {} }),
      getElementById: (id) => elementMap.get(id) || createMockElement(id),
      execCommand: (cmd) => true
    },
    localStorage: mockLocalStorage,
    navigator: {
      clipboard: {
        writeText: (txt) => { mockDom.copiedText = txt; return Promise.resolve(); }
      }
    },
    CSInterface: function() {
      this.evalScript = (s, cb) => { if (cb) cb(""); };
      this.openURLInDefaultBrowser = (url) => { openedUrl = url; };
    },
    fetch: () => Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true, data: [] }) }),
    setTimeout: setTimeout,
    console: console
  };

  mockDom.CSInterface.prototype.SystemPath = { EXTENSION: "extension_path" };

  vm.createContext(mockDom);
  vm.runInContext(appJsCode, mockDom);

  // Initialize UI elements in mock DOM
  createMockElement("studioIdInput");
  createMockElement("clientUrlDisplay");
  createMockElement("btnSaveStudio");
  createMockElement("btnCopyLink");
  createMockElement("btnShareWhatsApp");
  createMockElement("btnRefresh");
  createMockElement("searchInput");
  createMockElement("btnSelectFolder");
  createMockElement("logConsole");

  mockDom.initApp();

  // 1. Verify default client URL display
  const defaultUrl = mockDom.getClientFormUrl();
  console.log("1. Default Client URL:", defaultUrl);
  assert.strictEqual(defaultUrl, "https://wedding-song-importer.vercel.app/trpworld");

  // 2. Change Studio ID to studio_royal
  console.log("\n2. Changing Studio ID to studio_royal...");
  mockLocalStorage.setItem("wedding_studio_id", "studio_royal");
  mockDom.updateClientUrlDisplay();

  const updatedUrl = mockDom.getClientFormUrl();
  console.log("Updated Client URL:", updatedUrl);
  assert.strictEqual(updatedUrl, "https://wedding-song-importer.vercel.app/studio_royal");

  const displayEl = elementMap.get("clientUrlDisplay");
  assert.strictEqual(displayEl.value, "https://wedding-song-importer.vercel.app/studio_royal");

  // 3. Test Copy Link handler
  console.log("\n3. Triggering handleCopyLink()...");
  mockDom.handleCopyLink();
  await new Promise(r => setTimeout(r, 100));
  assert.strictEqual(mockDom.copiedText, "https://wedding-song-importer.vercel.app/studio_royal");
  const copyBtn = elementMap.get("btnCopyLink");
  assert.strictEqual(copyBtn.textContent, "✅ Copied!");
  console.log("✅ Copy link verified! Text copied:", mockDom.copiedText);

  // 4. Test WhatsApp Share handler
  console.log("\n4. Triggering handleShareWhatsApp()...");
  mockDom.handleShareWhatsApp();
  console.log("Opened WhatsApp Share URL:", openedUrl);
  assert.ok(openedUrl.includes("https://api.whatsapp.com/send?text="), "URL must be WhatsApp API link");
  assert.ok(openedUrl.includes("https%3A%2F%2Fwedding-song-importer.vercel.app%2Fstudio_royal"), "WhatsApp share text must contain encoded studio URL");
  console.log("✅ WhatsApp share link verified!");

  console.log("\n==============================================================");
  console.log(" 🎉 CLIENT LINK COPY & WHATSAPP SHARE VERIFICATION PASSED!");
  console.log("==============================================================");
}

verifyShareFeature().catch(err => {
  console.error("❌ SHARE FEATURE TEST FAILED:", err);
  process.exit(1);
});
