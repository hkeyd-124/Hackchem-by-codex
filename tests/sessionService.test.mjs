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
await import("../sessionService.js");

test("getCurrentIdentity prefers uid over wallet", () => {
  storage.clear();
  storage.set("uid", "uid_1");
  storage.set("wallet", "0xabc");

  const identity = window.sessionService.getCurrentIdentity();
  assert.equal(identity.uid, "uid_1");
  assert.equal(identity.wallet, "0xabc");
  assert.equal(identity.userId, "uid_1");
  assert.equal(identity.isGuest, false);
});

test("getCurrentIdentity falls back to wallet then guest", () => {
  storage.clear();
  storage.set("wallet", "0xabc");
  let identity = window.sessionService.getCurrentIdentity();
  assert.equal(identity.userId, "0xabc");
  assert.equal(identity.isGuest, false);

  storage.clear();
  identity = window.sessionService.getCurrentIdentity();
  assert.equal(identity.userId, "guest");
  assert.equal(identity.isGuest, true);
});

test("buildScopedKey uses explicit user or current fallback", () => {
  storage.clear();
  storage.set("uid", "uid_2");
  assert.equal(
    window.sessionService.buildScopedKey("progress", "organic_1"),
    "progress_organic_1_uid_2"
  );
  assert.equal(
    window.sessionService.buildScopedKey("progress", "organic_1", "custom"),
    "progress_organic_1_custom"
  );
});

test("set/clear helpers update storage keys", () => {
  storage.clear();
  window.sessionService.setCurrentUid("uid_3");
  window.sessionService.setCurrentWallet("0xdef");
  assert.equal(storage.get("uid"), "uid_3");
  assert.equal(storage.get("wallet"), "0xdef");

  window.sessionService.clearUid();
  assert.equal(storage.has("uid"), false);

  storage.set("username", "name");
  window.sessionService.clearSession();
  assert.equal(storage.has("wallet"), false);
  assert.equal(storage.has("username"), false);
});
