// authEmail.js
import { getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendEmailVerification
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import { doc, setDoc } 
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { db } from "./firebase.js";
import { getUserByEmail, createUser } from "./userService.js";
import { app } from "./firebase.js";
import { normalizeEmail } from "./userSchema.js";
import {
  AUTH_ACTIONS,
  resolveAuthErrorAction,
  getEmailVerificationResult,
  isUserBanned
} from "./authEmailFlow.js";

const auth = getAuth(app);

// ============================
// 🔥 LOGIN / REGISTER EMAIL
// ============================
export async function loginWithEmail(email, password){
email = normalizeEmail(email);
  if (!email) {
    alert("Email không hợp lệ!");
    return null;
  }
  let userCredential;

  // ============================
  // 🔥 STEP 1: LOGIN FIREBASE AUTH
  // ============================
  try{
    userCredential = await signInWithEmailAndPassword(auth, email, password);
   await userCredential.user.reload();

if(getEmailVerificationResult(userCredential.user.emailVerified) === "NOT_VERIFIED"){

  // 🔥 LƯU email tạm để resend
  localStorage.setItem("pending_verify_email", email);

  alert("⚠️ Email chưa xác thực! Kiểm tra hộp thư hoặc gửi lại.");

  return "NOT_VERIFIED"; // 🔥 signal đặc biệt
}
  }catch(err){

    // 👉 nếu chưa có tài khoản → tạo mới
    const action = resolveAuthErrorAction(err.code);
    if(action === AUTH_ACTIONS.CREATE_ACCOUNT){
      try{
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(userCredential.user);
      }catch(createErr){
        // Tài khoản đã tồn tại nhưng credential không hợp lệ → tránh vòng lặp kẹt login
        if(createErr.code === "auth/email-already-in-use"){
          alert("Email đã tồn tại, vui lòng kiểm tra lại mật khẩu!");
          return null;
        }
        throw createErr;
      }

// 🔥 lưu email để resend
localStorage.setItem("pending_verify_email", email);

alert("📩 Email xác nhận đã được gửi, hãy kiểm tra!!");

return "NOT_VERIFIED";
    }
    else if(action === AUTH_ACTIONS.WRONG_PASSWORD){
      alert("Sai mật khẩu!");
      return null;
    }
    else{
      throw err;
    }
  }

  // ============================
  // 🔥 STEP 2: XÁC ĐỊNH UID ĐÚNG
  // ============================
  const firebaseUid = userCredential.user.uid;
  let uid = firebaseUid;

  // Ưu tiên email_index cũ để giữ tương thích, nếu lỗi quyền thì fallback firebase uid
  try{
    const mappedUid = await getUserByEmail(email);
    if(mappedUid) uid = mappedUid;
  }catch(indexErr){
    if(indexErr?.code !== "permission-denied" && indexErr?.code !== "firestore/permission-denied"){
      throw indexErr;
    }
  }

  // 👉 nếu uid hiện tại chưa có profile trong hệ của bạn → tạo user mới
  try{
    const snap = await getDoc(doc(db, "users", uid));
    if(!snap.exists()){
      await createUser({ email, uid });
    }
  }catch(profileErr){
    if(profileErr?.code !== "permission-denied" && profileErr?.code !== "firestore/permission-denied"){
      throw profileErr;
    }
    // fallback an toàn theo firebase uid khi rule yêu cầu auth.uid
    uid = firebaseUid;
    await createUser({ email, uid });
  }

  // ============================
  // 🔥 STEP 3: ĐẢM BẢO INDEX
  // ============================
  try{
    await setDoc(doc(db, "email_index", email), {
      uid: uid
    });
  }catch(indexWriteErr){
    if(indexWriteErr?.code !== "permission-denied" && indexWriteErr?.code !== "firestore/permission-denied"){
      throw indexWriteErr;
    }
  }

// 🔥 CHECK BAN
const snap = await getDoc(doc(db, "users", uid));

if(snap.exists()){
  const data = snap.data();

  if(isUserBanned(data)){
    alert("🚫 Tài khoản đã bị khóa!");
    return null;
  }
}
  // ============================
  // 🔥 STEP 4: LƯU LOCAL
  // ============================
  window.sessionService.setCurrentUid(uid);

  // ❗ KHÔNG set wallet ở đây
  // ❗ KHÔNG link tự động

  return uid;
}
