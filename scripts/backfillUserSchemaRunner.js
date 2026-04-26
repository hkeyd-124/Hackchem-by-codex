import { planUserSchemaBackfill } from "./backfillUserSchemaCore.js";

export async function runBackfillWithData({ users = [], dryRun = true, updateUser }) {
  const plan = planUserSchemaBackfill(users);

  if (!dryRun && typeof updateUser === "function") {
    for (const entry of plan.logs) {
      await updateUser(entry.uid, entry.patch);
    }
  }

  return {
    runAt: new Date().toISOString(),
    dryRun,
    ...plan
  };
}
