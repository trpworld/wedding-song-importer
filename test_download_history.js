const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

async function testDownloadHistory() {
  console.log("==============================================================");
  console.log(" 🧪 TESTING PERSISTENT DOWNLOAD HISTORY & RE-DOWNLOAD BUTTON");
  console.log("==============================================================\n");

  const appJsPath = path.join(__dirname, "premiere-extension", "client", "app.js");
  const appJsCode = fs.readFileSync(appJsPath, "utf8");

  const storageMap = new Map();
  const mockLocalStorage = {
    getItem: (key) => storageMap.get(key) || null,
    setItem: (key, value) => storageMap.set(key, String(value)),
    clear: () => storageMap.clear()
  };

  let renderedNodes = [];
  const mockDom = {
    document: {
      addEventListener: () => {},
      createElement: (tag) => {
        const node = {
          tag: tag,
          className: "",
          textContent: "",
          innerHTML: "",
          style: {},
          children: [],
          listeners: {},
          appendChild: function(c) { this.children.push(c); },
          addEventListener: function(evt, fn) { this.listeners[evt] = fn; }
        };
        return node;
      },
      getElementById: (id) => {
        if (id === "contentArea") {
          return {
            innerHTML: "",
            appendChild: function(child) { renderedNodes.push(child); }
          };
        }
        return { style: {} };
      }
    },
    localStorage: mockLocalStorage,
    window: { location: { origin: "http://localhost:3000" } },
    navigator: { clipboard: { writeText: () => Promise.resolve() } },
    CSInterface: function() { this.evalScript = (s, cb) => { if (cb) cb(""); }; },
    fetch: () => Promise.resolve({ ok: true, json: () => Promise.resolve({}) }),
    setInterval: () => 1,
    clearInterval: () => {},
    setTimeout: setTimeout,
    console: console
  };

  mockDom.CSInterface.prototype.SystemPath = { EXTENSION: "extension_path" };

  vm.createContext(mockDom);
  vm.runInContext(appJsCode, mockDom);

  // 1. Initial State Check (No History)
  console.log("1. Checking non-downloaded submission state...");
  mockDom.submissions = [
    { id: "sub-history-1", client_name: "Rahul & Priya", event_date: "2026-11-20", status: "Pending", songs: [] }
  ];
  mockDom.renderSubmissions("");

  assert.strictEqual(renderedNodes.length, 1);
  const initialCard = renderedNodes[0];
  const initialBtn = initialCard.children.find(c => c.tag === "button");
  console.log("Initial Button Text:", initialBtn.innerHTML);
  assert.strictEqual(initialBtn.innerHTML, "📥 Download & Import to Premiere Pro");

  // 2. Mark Downloaded in LocalStorage History
  console.log("\n2. Marking sub-history-1 as downloaded in localStorage history...");
  mockDom.markSubmissionDownloaded("sub-history-1");
  const storedHistory = JSON.parse(mockLocalStorage.getItem("wedding_downloaded_history"));
  console.log("Stored History Array:", storedHistory);
  assert.ok(storedHistory.includes("sub-history-1"));

  // 3. Re-render Submissions and check Badge + Re-download Button
  renderedNodes = [];
  mockDom.renderSubmissions("");

  const updatedCard = renderedNodes[0];
  const updatedBtn = updatedCard.children.find(c => c.tag === "button");
  const infoDiv = updatedCard.children.find(c => c.className === "card-info");

  console.log("Updated Info HTML:", infoDiv.innerHTML);
  console.log("Updated Button Class:", updatedBtn.className);
  console.log("Updated Button Text:", updatedBtn.innerHTML);

  assert.ok(infoDiv.innerHTML.includes("✅ Downloaded"));
  assert.ok(updatedBtn.className.includes("btn-redownload"));
  assert.strictEqual(updatedBtn.innerHTML, "🔄 Re-download & Import");

  console.log("\n==============================================================");
  console.log(" 🎉 PERSISTENT DOWNLOAD HISTORY VERIFICATION PASSED (100%)!");
  console.log("==============================================================");
}

testDownloadHistory().catch(err => {
  console.error("❌ TEST FAILED:", err);
  process.exit(1);
});
