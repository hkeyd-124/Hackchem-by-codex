import test from "node:test";
import assert from "node:assert/strict";

const storage = new Map();
global.localStorage = {
  getItem(key) {
    return storage.has(key) ? storage.get(key) : null;
  },
  setItem(key, value) {
    storage.set(key, String(value));
  },
  removeItem(key) {
    storage.delete(key);
  },
  clear() {
    storage.clear();
  }
};

global.window = global;
await import("../lessonProgressService.js");

const fakeSessionService = {
  buildScopedKey(prefix, lessonId, scopedUser) {
    return `${prefix}_${lessonId}_${scopedUser}`;
  }
};

test("buildLessonStorageKeys builds new and legacy keys", () => {
  const keys = window.lessonProgressService.buildLessonStorageKeys({
    lessonId: "organic_2",
    uid: "uid_1",
    wallet: "0xabc",
    sessionService: fakeSessionService
  });

  assert.equal(keys.progressKey, "progress_organic_2_uid_1");
  assert.equal(keys.bestKey, "best_organic_2_uid_1");
  assert.equal(keys.oldProgressKey, "progress_organic_2_0xabc");
  assert.equal(keys.oldBestKey, "best_organic_2_0xabc");
});

test("migrateLegacyLessonKeys copies legacy values once", () => {
  storage.clear();
  storage.set("progress_organic_2_0xabc", "{\"score\":100}");
  storage.set("best_organic_2_0xabc", "250");

  window.lessonProgressService.migrateLegacyLessonKeys({
    oldProgressKey: "progress_organic_2_0xabc",
    progressKey: "progress_organic_2_uid_1",
    oldBestKey: "best_organic_2_0xabc",
    bestKey: "best_organic_2_uid_1"
  });

  assert.equal(storage.get("progress_organic_2_uid_1"), "{\"score\":100}");
  assert.equal(storage.get("best_organic_2_uid_1"), "250");
});

test("getRank keeps thresholds unchanged", () => {
  assert.equal(window.lessonProgressService.getRank(359), "bronze");
  assert.equal(window.lessonProgressService.getRank(360), "silver");
  assert.equal(window.lessonProgressService.getRank(419), "silver");
  assert.equal(window.lessonProgressService.getRank(420), "gold");
});
