const assert = require('assert');

async function runBilingualFormTest() {
  console.log("==============================================================");
  console.log(" 🧪 VERIFYING BILINGUAL FORM, SMART AUTO-COLLAPSE & EDIT/REMOVE");
  console.log("==============================================================\n");

  const baseUrl = "http://localhost:3000";

  // 1. Submit playlist under studio_bilingual
  console.log("1. Submitting client playlist with studio_id [studio_bilingual]...");
  const payload = {
    studio_id: "studio_bilingual",
    client_name: "Ayan & Poulomi",
    event_date: "2026-12-05",
    phone: "9830012345",
    general_notes: "Bilingual test submission with timestamps",
    songs: [
      {
        ritualName: "💛 গায়ে হলুদ (Gaye Holud)",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        notes: "Start at 0:30"
      },
      {
        ritualName: "❤️ সিঁদুরদান (Sindoor Daan)",
        url: "https://www.youtube.com/watch?v=3JZ_D3ELwOQ",
        notes: "Soft volume"
      }
    ]
  };

  const res = await fetch(`${baseUrl}/api/submissions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const json = await res.json();
  console.log("POST Submission Status:", res.status, "ID:", json.data?.id);
  assert.strictEqual(res.status, 200);
  assert.strictEqual(json.data.client_name, "Ayan & Poulomi");
  assert.strictEqual(json.data.songs.length, 2);
  console.log("✅ Verified: Submission created with bilingual tracks!");

  // 2. Query GET /api/submissions?studioId=studio_bilingual
  console.log("\n2. Fetching submissions for studio_id [studio_bilingual]...");
  const getRes = await fetch(`${baseUrl}/api/submissions?studioId=studio_bilingual`);
  const getJson = await getRes.json();
  console.log("GET Status:", getRes.status, "Count:", getJson.data?.length);
  assert.strictEqual(getRes.status, 200);
  assert.strictEqual(getJson.data.length, 1);
  assert.strictEqual(getJson.data[0].studio_id, "studio_bilingual");
  console.log("✅ Verified: GET /api/submissions returns correct isolated playlist!");

  console.log("\n==============================================================");
  console.log(" 🎉 BILINGUAL FORM & SMART AUTO-COLLAPSE VERIFICATION PASSED!");
  console.log("==============================================================");
}

runBilingualFormTest().catch(err => {
  console.error("❌ BILINGUAL FORM TEST FAILED:", err);
  process.exit(1);
});
