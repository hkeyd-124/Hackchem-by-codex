export function formatBackfillReport(report, { maxRows = 20 } = {}) {
  const runAt = report?.runAt || "unknown";
  const dryRun = report?.dryRun === true;
  const totalUsers = report?.totalUsers || 0;
  const changedUsers = report?.changedUsers || 0;
  const totalPatchedFields = report?.totalPatchedFields || 0;
  const logs = Array.isArray(report?.logs) ? report.logs : [];

  const lines = [
    `Backfill runAt: ${runAt}`,
    `Mode: ${dryRun ? "DRY_RUN" : "APPLY"}`,
    `Users scanned: ${totalUsers}`,
    `Users changed: ${changedUsers}`,
    `Fields patched: ${totalPatchedFields}`
  ];

  if (logs.length === 0) {
    lines.push("No schema changes needed.");
    return lines.join("\n");
  }

  lines.push("Changed users:");
  logs.slice(0, maxRows).forEach((entry, index) => {
    lines.push(`${index + 1}. ${entry.uid} -> ${entry.patchKeys?.join(", ") || "no_keys"}`);
  });

  if (logs.length > maxRows) {
    lines.push(`...and ${logs.length - maxRows} more rows`);
  }

  return lines.join("\n");
}
