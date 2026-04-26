// userService.js

import { db } from "./firebase.js";
import { doc, getDoc, setDoc } 
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { normalizeEmail, normalizeWallet, buildDefaultUser } from "./userSchema.js";

// 🔥 tạo UID chuẩn
function generateUID(){
  return "uid_" + crypto.randomUUID();
}

// ============================
// 🔍 TÌM USER THEO WALLET
// ============================
export async function getUserByWallet(wallet){
  wallet = normalizeWallet(wallet);
  if (!wallet) return null;

  const ref = doc(db, "wallet_index", wallet);
  const snap = await getDoc(ref);

  if(!snap.exists()) return null;

  return snap.data().uid;
}

// ============================
// 🔍 TÌM USER THEO EMAIL
// ============================
export async function getUserByEmail(email){
email = normalizeEmail(email);
  if (!email) return null;
  const ref = doc(db, "email_index", email);
  const snap = await getDoc(ref);

  if(!snap.exists()) return null;

  return snap.data().uid;
}

// ============================
// 🆕 TẠO USER MỚI
// ============================
export async function createUser({wallet=null, email=null, uid: providedUid=null}){
wallet = normalizeWallet(wallet);
  email = normalizeEmail(email);
  const uid = providedUid || generateUID();

  // 🔥 TẠO USER
  await setDoc(doc(db, "users", uid), buildDefaultUser({ uid, wallet, email }), { merge: true });

  // 🔥 TẠO INDEX WALLET
  if(wallet){
    await setDoc(doc(db, "wallet_index", wallet), {
      uid: uid
    });
  }

  // 🔥 TẠO INDEX EMAIL
  if(email){
    await setDoc(doc(db, "email_index", email), {
      uid: uid
    });
  }

  return uid;
}
