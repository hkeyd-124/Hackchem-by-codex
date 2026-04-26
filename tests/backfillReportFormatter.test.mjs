import test from "node:test";
import assert from "node:assert/strict";
import { formatBackfillReport } from "../scripts/backfillReportFormatter.js";

test("formatBackfillReport prints summary and no-change message", () => {
  const text = formatBackfillReport({
    runAt: "2026-04-21T00:00:00.000Z",
    dryRun: true,
    totalUsers: 10,
    changedUsers: 0,
    totalPatchedFields: 0,
    logs: []
  });

  assert.match(text, /DRY_RUN/);
  assert.match(text, /Users scanned: 10/);
  assert.match(text, /No schema changes needed/);
});

test("formatBackfillReport prints changed rows and truncation note", () => {
  const logs = [
    { uid: "uid_1", patchKeys: ["providers.wallet", "system.status"] },
    { uid: "uid_2", patchKeys: ["points"] }
  ];

  const text = formatBackfillReport(
    {
      runAt: "2026-04-21T00:00:00.000Z",
      dryRun: false,
      totalUsers: 20,
      changedUsers: 2,
      totalPatchedFields: 3,
      logs
    },
    { maxRows: 1 }
  );

  assert.match(text, /Mode: APPLY/);
  assert.match(text, /1\. uid_1 -> providers\.wallet, system\.status/);
  assert.match(text, /\.\.\.and 1 more rows/);
});
