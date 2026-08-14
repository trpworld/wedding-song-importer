const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

function testTabSwitcher() {
  console.log("==============================================================");
  console.log(" 🧪 STEP 2 TEST: SAFE TAB NAVIGATION & VIEW SWITCHER");
  console.log("==============================================================\n");

  const appJsPath = path.join(__dirname, "premiere-extension", "client", "app.js");
  const appJsCode = fs.readFileSync(appJsPath, "utf8");

  const storageMap = new Map();
  const mockLocalStorage = {
    getItem: (key) => storageMap.get(key) || null,
    setItem: (key, value) => storageMap.set(key, String(value)),
    clear: () => storageMap.clear()
  };

  const elementMap = new Map();
  function createMockElement(id) {
    const el = {
      id: id,
      className: "",
      value: "",
      textContent: "",
      style: { display: "none" },
      listeners: {},
      addEventListener: function(event, fn) { this.listeners[event] = fn; },
      click: function() { if (this.listeners['click']) this.listeners['click'](); }
    };
    elementMap.set(id, el);
    return el;
  }

  // Create initial tab DOM elements
  const tabSub = createMockElement("tabSubmissions");
  const tabDown = createMockElement("tabDownloads");
  const tabTpl = createMockElement("tabTemplate");

  const navSub = createMockElement("navTabSubmissions");
  const navDown = createMockElement("navTabDownloads");
  const navTpl = createMockElement("navTabTemplate");

  const logConsole = createMockElement("logConsole");
  logConsole.appendChild = () => {};
  logConsole.scrollTop = 0;

  tabSub.style.display = "block";
  navSub.className = "tab-btn active";

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
    fetch: () => Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true, data: [] }) }),
    setInterval: () => 1,
    clearInterval: () => {},
    setTimeout: setTimeout,
    console: console
  };

  mockDom.CSInterface.prototype.SystemPath = { EXTENSION: "extension_path" };

  vm.createContext(mockDom);
  vm.runInContext(appJsCode, mockDom);

  // 1. Initial State Check
  console.log("1. Checking Initial Tab State...");
  console.log("Submissions Tab Display:", tabSub.style.display, "Nav Class:", navSub.className);
  assert.strictEqual(tabSub.style.display, "block");
  assert.strictEqual(navSub.className, "tab-btn active");

  // 2. Switch to Downloads Tab
  console.log("\n2. Switching to tabDownloads...");
  mockDom.switchTab("tabDownloads");

  console.log("Submissions Tab Display:", tabSub.style.display);
  console.log("Downloads Tab Display:", tabDown.style.display, "Nav Class:", navDown.className);
  assert.strictEqual(tabSub.style.display, "none");
  assert.strictEqual(tabDown.style.display, "block");
  assert.strictEqual(navDown.className, "tab-btn active");

  // 3. Switch to Template Tab
  console.log("\n3. Switching to tabTemplate...");
  mockDom.switchTab("tabTemplate");

  console.log("Downloads Tab Display:", tabDown.style.display);
  console.log("Template Tab Display:", tabTpl.style.display, "Nav Class:", navTpl.className);
  assert.strictEqual(tabDown.style.display, "none");
  assert.strictEqual(tabTpl.style.display, "block");
  assert.strictEqual(navTpl.className, "tab-btn active");

  console.log("\n==============================================================");
  console.log(" 🎉 STEP 2 VERIFICATION PASSED (100% SUCCESS)!");
  console.log("==============================================================");
}

testTabSwitcher();
