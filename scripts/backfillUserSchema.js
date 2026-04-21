import { db } from "../firebase.js";
import {
  collection,
  getDocs,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { planUserSchemaBackfill } from "./backfillUserSchemaCore.js";

export async function backfillUserSchema({ dryRun = true } = {}) {
  const usersSnap = await getDocs(collection(db, "users"));
  const users = usersSnap.docs.map((userDoc) => ({
    id: userDoc.id,
    data: userDoc.data()
  }));

  const plan = planUserSchemaBackfill(users);

  if (!dryRun) {
    for (const entry of plan.logs) {
      await updateDoc(doc(db, "users", entry.uid), entry.patch);
    }
  }

  return {
    runAt: new Date().toISOString(),
    dryRun,
    ...plan
  };
}
