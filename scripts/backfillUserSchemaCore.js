import { buildSchemaPatch } from "../userSchema.js";

export function planUserSchemaBackfill(users = []) {
  const logs = [];

  for (const user of users) {
    const uid = user.id;
    const userData = user.data || {};
    const patch = buildSchemaPatch(userData);
    const patchKeys = Object.keys(patch);

    if (patchKeys.length === 0) continue;

    logs.push({
      uid,
      patch,
      patchKeys
    });
  }

  return {
    totalUsers: users.length,
    changedUsers: logs.length,
    totalPatchedFields: logs.reduce((sum, item) => sum + item.patchKeys.length, 0),
    logs
  };
}
