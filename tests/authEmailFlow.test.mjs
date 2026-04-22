import test from "node:test";
import assert from "node:assert/strict";
import {
  AUTH_ACTIONS,
  resolveAuthErrorAction,
  getEmailVerificationResult,
  isUserBanned
} from "../authEmailFlow.js";

test("resolveAuthErrorAction maps known auth errors", () => {
  assert.equal(resolveAuthErrorAction("auth/user-not-found"), AUTH_ACTIONS.CREATE_ACCOUNT);
  assert.equal(resolveAuthErrorAction("auth/invalid-credential"), AUTH_ACTIONS.CREATE_ACCOUNT);
  assert.equal(resolveAuthErrorAction("auth/wrong-password"), AUTH_ACTIONS.WRONG_PASSWORD);
  assert.equal(resolveAuthErrorAction("auth/network-request-failed"), AUTH_ACTIONS.THROW);
});

test("getEmailVerificationResult maps boolean to login contract state", () => {
  assert.equal(getEmailVerificationResult(true), "VERIFIED");
  assert.equal(getEmailVerificationResult(false), "NOT_VERIFIED");
});

test("isUserBanned checks user.system.status", () => {
  assert.equal(isUserBanned({ system: { status: "banned" } }), true);
  assert.equal(isUserBanned({ system: { status: "active" } }), false);
  assert.equal(isUserBanned({}), false);
});
