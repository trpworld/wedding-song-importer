const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

async function testUiProgress() {
  console.log("==============================================================");
  console.log(" 🧪 STEP 2 TEST: REAL-TIME DYNAMIC PROGRESS BAR IN CEP CLIENT");
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
      style: { display: "none", width: "0%" },
      listeners: {},
      addEventListener: function(event, fn) { this.listeners[event] = fn; },
      click: function() { if (this.listeners['click']) this.listeners['click'](); },
      appendChild: function() {}
    };
    elementMap.set(id, el);
    return el;
  }

  let polledCount = 0;
  const mockDom = {
    document: {
      addEventListener: () => {},
      createElement: () => ({ className: "", textContent: "", style: {}, appendChild: () => {} }),
      getElementById: (id) => elementMap.get(id) || createMockElement(id)
    },
    localStorage: mockLocalStorage,
    window: { location: { origin: "http://localhost:3000" } },
    navigator: { clipboard: { writeText: () => Promise.resolve() } },
    CSInterface: function() { this.evalScript = (s, cb) => { if (cb) cb(""); }; },
    fetch: (url) => {
      polledCount++;
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          status: polledCount >= 3 ? "completed" : "downloading",
          percentage: polledCount >= 3 ? 100 : polledCount * 30,
          speed: "⚡ 4.5 MB/s",
          eta: "2s",
          current_song: "Gaye Holud"
        })
      });
    },
    setInterval: function(fn, delay) {
      fn();
      setTimeout(function() {
        fn();
        setTimeout(function() {
          fn();
        }, 10);
      }, 10);
      return 123;
    },
    clearInterval: () => {},
    setTimeout: setTimeout,
    console: console
  };

  mockDom.CSInterface.prototype.SystemPath = { EXTENSION: "extension_path" };

  vm.createContext(mockDom);
  vm.runInContext(appJsCode, mockDom);

  // 1. Initialize DOM elements for sub-123
  createMockElement("progress-container-sub-123");
  createMockElement("progress-status-sub-123");
  createMockElement("progress-meta-sub-123");
  createMockElement("progress-bar-sub-123");

  console.log("1. Starting progress polling simulation for job-test-456...");
  mockDom.startProgressPolling("job-test-456", "sub-123");

  await new Promise(r => setTimeout(r, 100));

  const boxEl = elementMap.get("progress-container-sub-123");
  const barEl = elementMap.get("progress-bar-sub-123");
  const statusEl = elementMap.get("progress-status-sub-123");
  const metaEl = elementMap.get("progress-meta-sub-123");

  console.log("Box Display Style:", boxEl.style.display);
  console.log("Bar Fill Width:", barEl.style.width);
  console.log("Status Text:", statusEl.textContent);
  console.log("Meta Text:", metaEl.textContent);

  assert.strictEqual(boxEl.style.display, "block");
  assert.strictEqual(barEl.style.width, "100%");
  assert.ok(statusEl.textContent.includes("Complete") || statusEl.textContent.includes("Gaye Holud"));
  assert.ok(metaEl.textContent.includes("100%"));

  console.log("\n==============================================================");
  console.log(" 🎉 STEP 2 VERIFICATION PASSED (100% SUCCESS)!");
  console.log("==============================================================");
}

testUiProgress().catch(err => {
  console.error("❌ STEP 2 TEST FAILED:", err);
  process.exit(1);
});
