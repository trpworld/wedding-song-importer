const { execSync } = require('child_process');

function runMasterSmokeTest() {
  console.log("==============================================================");
  console.log(" 🚀 MASTER DIRECTIVE SMOKE TEST: ALL SYSTEMS GO");
  console.log("==============================================================\n");

  const tests = [
    { name: "Step 1: Dynamic Base URL & Config Builder", file: "test_url_builder.js" },
    { name: "Step 2: Client Route Handling & CORS Preflight", file: "test_api_cors_routes.js" },
    { name: "Step 3: Local Agent Port & Download Engine Stability", file: "test_agent_robustness.js" },
    { name: "Step 4: CEP Extension ES3 & Path Integration", file: "test_jsx_es3_paths.js" },
    { name: "3-Tab UI Architecture: DOM & Preserved Elements", file: "test_tab_dom.js" },
    { name: "3-Tab Navigation: Switcher & State Management", file: "test_tab_switcher.js" },
    { name: "Real-Time Auto-Draft Persistence & Hydration", file: "test_draft_persistence.js" },
    { name: "High-Speed Engine: Multi-Threaded Download & Progress API", file: "test_download_engine.js" },
    { name: "Real-Time UI: Dynamic Progress Bar & Polling", file: "test_ui_progress.js" },
    { name: "Feature: Persistent Download History & Re-download Button", file: "test_download_history.js" },
    { name: "Feature: Custom Studio Ritual Template Builder", file: "test_template_builder.js" },
    { name: "Feature: Bilingual Form & Smart Auto-Collapse", file: "test_bilingual_form.js" },
    { name: "Feature: Client Link Copy & WhatsApp Share", file: "test_share_feature.js" },
    { name: "Phase 1: Multi-Studio API Isolation", file: "test_phase1.js" },
    { name: "Phase 2: CEP Panel Studio Switcher & ES3", file: "test_phase2.js" },
    { name: "Phase 4: 1-Click Installer, Plist & ZIP Package", file: "test_phase4.js" },
  ];

  let passed = 0;

  for (let i = 0; i < tests.length; i++) {
    const t = tests[i];
    console.log(`\n--------------------------------------------------------------`);
    console.log(` RUNNING TEST ${i + 1}/${tests.length}: ${t.name}`);
    console.log(`--------------------------------------------------------------`);

    try {
      const output = execSync(`node ${t.file}`, { encoding: "utf8", cwd: __dirname });
      console.log(output);
      passed++;
    } catch (err) {
      console.error(`❌ TEST FAILED: ${t.name}`);
      console.error(err.stdout || err.message);
      process.exit(1);
    }
  }

  console.log("\n==============================================================");
  console.log(` 🎉 ALL ${passed}/${tests.length} MASTER SYSTEM TESTS PASSED 100%!`);
  console.log("==============================================================");
}

runMasterSmokeTest();
