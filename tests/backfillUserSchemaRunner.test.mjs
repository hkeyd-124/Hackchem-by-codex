import test from "node:test";
import assert from "node:assert/strict";
import { runBackfillWithData } from "../scripts/backfillUserSchemaRunner.js";

test("runBackfillWithData does not call updateUser in dryRun mode", async () => {
  let updateCalls = 0;

  const result = await runBackfillWithData({
    dryRun: true,
    users: [
      {
        id: "uid_1",
        data: { wallet: "0xabc", providers: {}, system: {} }
      }
    ],
    updateUser: async () => {
      updateCalls += 1;
    }
  });

  assert.equal(result.dryRun, true);
  assert.equal(result.changedUsers, 1);
  assert.equal(updateCalls, 0);
  assert.equal(typeof result.runAt, "string");
});

test("runBackfillWithData applies updates in non-dryRun mode", async () => {
  const updates = [];

  const result = await runBackfillWithData({
    dryRun: false,
    users: [
      {
        id: "uid_2",
        data: { wallet: "0xdef", providers: {}, system: {} }
      }
    ],
    updateUser: async (uid, patch) => {
      updates.push({ uid, patch });
    }
  });

  assert.equal(result.dryRun, false);
  assert.equal(result.changedUsers, 1);
  assert.equal(updates.length, 1);
  assert.equal(updates[0].uid, "uid_2");
  assert.equal(updates[0].patch["providers.wallet"], true);
});
