import test from "node:test";
import assert from "node:assert/strict";
import { planUserSchemaBackfill } from "../scripts/backfillUserSchemaCore.js";

test("planUserSchemaBackfill returns empty changes when schema is already valid", () => {
  const users = [
    {
      id: "uid_1",
      data: {
        wallet: "0xabc",
        email: "a@b.com",
        points: 10,
        streak: 2,
        providers: { wallet: true, email: true },
        system: { status: "active", role: "user" }
      }
    }
  ];

  const result = planUserSchemaBackfill(users);
  assert.equal(result.totalUsers, 1);
  assert.equal(result.changedUsers, 0);
  assert.equal(result.totalPatchedFields, 0);
});

test("planUserSchemaBackfill reports patch entries for missing schema fields", () => {
  const users = [
    {
      id: "uid_2",
      data: {
        wallet: "0xdef",
        email: "x@y.com",
        points: "5",
        providers: {},
        system: {}
      }
    }
  ];

  const result = planUserSchemaBackfill(users);
  assert.equal(result.totalUsers, 1);
  assert.equal(result.changedUsers, 1);
  assert.equal(result.logs[0].uid, "uid_2");
  assert.equal(result.logs[0].patch["providers.wallet"], true);
  assert.equal(result.logs[0].patch["system.status"], "active");
  assert.equal(result.logs[0].patch.points, 5);
});
