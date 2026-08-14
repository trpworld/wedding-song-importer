const assert = require('assert');

async function runTemplateBuilderTest() {
  console.log("==============================================================");
  console.log(" 🧪 VERIFYING CUSTOM STUDIO RITUAL TEMPLATE BUILDER & API");
  console.log("==============================================================\n");

  const baseUrl = "http://localhost:3000";

  // 1. Save custom template for studio_custom
  console.log("1. Saving custom template for studio_custom via POST /api/templates...");
  const customRituals = [
    { id: "c1", name: "🎬 Teaser Track", englishTag: "Teaser" },
    { id: "c2", name: "💍 Varmala Drop", englishTag: "Varmala" },
    { id: "c3", name: "💃 After Party Dance", englishTag: "AfterParty" }
  ];

  const postTplRes = await fetch(`${baseUrl}/api/templates`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      studio_id: "studio_custom",
      rituals: customRituals
    })
  });

  const postTplJson = await postTplRes.json();
  console.log("POST Template Response Status:", postTplRes.status, "Count:", postTplJson.data?.length);
  assert.strictEqual(postTplRes.status, 200, "POST /api/templates should return 200 OK");
  assert.strictEqual(postTplJson.data.length, 3, "Custom rituals count must be 3");

  // 2. GET /api/templates?studioId=studio_custom
  console.log("\n2. Fetching template for studio_custom via GET /api/templates?studioId=studio_custom...");
  const getCustomRes = await fetch(`${baseUrl}/api/templates?studioId=studio_custom`);
  const getCustomJson = await getCustomRes.json();
  console.log("GET Custom Status:", getCustomRes.status, "Rituals:", getCustomJson.data?.map(r => r.name));
  assert.strictEqual(getCustomRes.status, 200);
  assert.strictEqual(getCustomJson.data.length, 3);
  assert.strictEqual(getCustomJson.data[0].name, "🎬 Teaser Track");
  console.log("✅ Verified: studio_custom returns custom ritual template!");

  // 3. GET /api/templates?studioId=unknown_studio (Fallback to Default)
  console.log("\n3. Fetching template for unknown_studio (testing fallback to default template)...");
  const getUnkRes = await fetch(`${baseUrl}/api/templates?studioId=unknown_studio`);
  const getUnkJson = await getUnkRes.json();
  console.log("GET Unknown Studio Status:", getUnkRes.status, "Default Rituals Count:", getUnkJson.data?.length);
  assert.strictEqual(getUnkRes.status, 200);
  assert.ok(getUnkJson.data.length >= 25, "Default fallback template should contain 25 rituals");
  console.log("✅ Verified: unknown_studio falls back to default wedding template!");

  // 4. Test submission using custom ritual template
  console.log("\n4. Submitting client playlist for studio_custom...");
  const subPayload = {
    studio_id: "studio_custom",
    client_name: "Custom Studio Couple (Rohan & Sneha)",
    event_date: "2026-11-18",
    songs: [
      {
        ritualName: "🎬 Teaser Track",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        notes: "High energy transition"
      }
    ]
  };

  const subRes = await fetch(`${baseUrl}/api/submissions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(subPayload)
  });

  const subJson = await subRes.json();
  console.log("Submission Status:", subRes.status, "Saved ID:", subJson.data?.id);
  assert.strictEqual(subRes.status, 200);
  assert.strictEqual(subJson.data.studio_id, "studio_custom");
  console.log("✅ Verified: Client submission saved under studio_custom with custom ritual!");

  console.log("\n==============================================================");
  console.log(" 🎉 CUSTOM STUDIO RITUAL TEMPLATE BUILDER VERIFICATION PASSED!");
  console.log("==============================================================");
}

runTemplateBuilderTest().catch(err => {
  console.error("❌ TEMPLATE BUILDER TEST FAILED:", err);
  process.exit(1);
});
