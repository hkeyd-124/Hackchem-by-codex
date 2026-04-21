import { db } from "../firebase.js";
import {
  collection,
  getDocs as getDocsFs,
  doc,
  updateDoc as updateDocFs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { runBackfillWithData } from "./backfillUserSchemaRunner.js";

export async function backfillUserSchema({ dryRun = true, deps = {} } = {}) {
  const firestoreDb = deps.db || db;
  const getDocsFn = deps.getDocs || getDocsFs;
  const updateDocFn = deps.updateDoc || updateDocFs;
  const collectionFn = deps.collection || collection;
  const docFn = deps.doc || doc;

  const usersSnap = await getDocsFn(collectionFn(firestoreDb, "users"));
  const users = usersSnap.docs.map((userDoc) => ({
    id: userDoc.id,
    data: userDoc.data()
  }));

  return runBackfillWithData({
    users,
    dryRun,
    updateUser: async (uid, patch) => {
      await updateDocFn(docFn(firestoreDb, "users", uid), patch);
    }
  });
}
