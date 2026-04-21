import { db } from "../firebase.js";
import {
  collection,
  getDocs,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { buildSchemaPatch } from "../userSchema.js";

export async function backfillUserSchema({ dryRun = true } = {}) {
  const usersSnap = await getDocs(collection(db, "users"));
  const logs = [];

  for (const userDoc of usersSnap.docs) {
    const userData = userDoc.data();
    const patch = buildSchemaPatch(userData);
    const patchKeys = Object.keys(patch);

    if (patchKeys.length === 0) continue;

    logs.push({ uid: userDoc.id, patch });

    if (!dryRun) {
      await updateDoc(doc(db, "users", userDoc.id), patch);
    }
  }

  return {
    dryRun,
    totalUsers: usersSnap.size,
    changedUsers: logs.length,
    logs
  };
}
