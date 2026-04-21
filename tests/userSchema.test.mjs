import test from "node:test";
import assert from "node:assert/strict";
import { buildDefaultUser, buildSchemaPatch, normalizeEmail, normalizeWallet } from "../userSchema.js";

test("normalizeEmail trims and lowercases", () => {
  assert.equal(normalizeEmail("  Foo@Bar.COM "), "foo@bar.com");
  assert.equal(normalizeEmail(""), null);
});

test("normalizeWallet trims wallet string", () => {
  assert.equal(normalizeWallet(" 0xabc "), "0xabc");
  assert.equal(normalizeWallet(null), null);
});

test("buildDefaultUser creates consistent defaults", () => {
  const user = buildDefaultUser({
    uid: "uid_1",
    wallet: " 0xabc ",
    email: " TEST@MAIL.COM "
  });

  assert.equal(user.uid, "uid_1");
  assert.equal(user.wallet, "0xabc");
  assert.equal(user.email, "test@mail.com");
  assert.equal(user.points, 0);
  assert.equal(user.streak, 1);
  assert.equal(user.providers.wallet, true);
  assert.equal(user.providers.email, true);
  assert.equal(user.system.status, "active");
  assert.equal(user.system.role, "user");
});

test("buildSchemaPatch backfills missing/invalid fields", () => {
  const patch = buildSchemaPatch({
    wallet: "0xabc",
    email: "a@b.com",
    points: "12",
    providers: {},
    system: {}
  });

  assert.equal(patch["providers.wallet"], true);
  assert.equal(patch["providers.email"], true);
  assert.equal(patch["system.status"], "active");
  assert.equal(patch["system.role"], "user");
  assert.equal(patch.points, 12);
  assert.equal(patch.streak, 1);
});
