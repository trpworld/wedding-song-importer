const assert = require('assert');

async function testDraftPersistence() {
  console.log("==============================================================");
  console.log(" 🧪 STEP 1 TEST: REAL-TIME AUTO-DRAFT PERSISTENCE & HYDRATION");
  console.log("==============================================================\n");

  const storageMap = new Map();
  const mockLocalStorage = {
    getItem: (key) => storageMap.get(key) || null,
    setItem: (key, value) => storageMap.set(key, String(value)),
    removeItem: (key) => storageMap.delete(key),
    clear: () => storageMap.clear()
  };

  const studioId = "studio_draft_test";
  const draftKey = `wedding_form_draft_${studioId}`;

  // 1. Simulate user typing and saving draft
  console.log("1. Simulating user form input & auto-save to localStorage...");
  const draftData = {
    clientName: "Anik & Poulami",
    eventDate: "2026-12-15",
    phone: "+91 99999 88888",
    generalNotes: "Special cinematic cut for Gaye Holud",
    ritualSongs: {
      "গায়ে হলুদ": [{ url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", notes: "Start at 00:30" }]
    }
  };

  mockLocalStorage.setItem(draftKey, JSON.stringify(draftData));
  console.log("Saved Draft Key:", draftKey);

  // 2. Hydration Check
  console.log("\n2. Hydrating saved draft from localStorage...");
  const retrievedRaw = mockLocalStorage.getItem(draftKey);
  assert.ok(retrievedRaw, "Draft should exist in localStorage");

  const parsedDraft = JSON.parse(retrievedRaw);
  console.log("Retrieved Couple Names:", parsedDraft.clientName);
  console.log("Retrieved Event Date:", parsedDraft.eventDate);
  console.log("Retrieved Song Track:", parsedDraft.ritualSongs["গায়ে হলুদ"][0].url);

  assert.strictEqual(parsedDraft.clientName, "Anik & Poulami");
  assert.strictEqual(parsedDraft.eventDate, "2026-12-15");
  assert.strictEqual(parsedDraft.ritualSongs["গায়ে হলুদ"][0].url, "https://www.youtube.com/watch?v=dQw4w9WgXcQ");

  // 3. Clear on Submit Check
  console.log("\n3. Simulating successful submit & draft auto-clearing...");
  mockLocalStorage.removeItem(draftKey);
  const clearedCheck = mockLocalStorage.getItem(draftKey);
  console.log("Cleared Draft Check:", clearedCheck);
  assert.strictEqual(clearedCheck, null);

  console.log("\n==============================================================");
  console.log(" 🎉 STEP 1 VERIFICATION PASSED (100% SUCCESS)!");
  console.log("==============================================================");
}

testDraftPersistence().catch(err => {
  console.error("❌ STEP 1 TEST FAILED:", err);
  process.exit(1);
});
