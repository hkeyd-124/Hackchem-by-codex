(function (global) {
  function normalize(value) {
    if (!value) return "";
    return String(value).trim();
  }

  function getUid() {
    return normalize(localStorage.getItem("uid"));
  }

  function getWallet() {
    return normalize(localStorage.getItem("wallet"));
  }

  function getCurrentIdentity() {
    const uid = getUid();
    const wallet = getWallet();

    return {
      uid: uid || null,
      wallet: wallet || null,
      userId: uid || wallet || "guest",
      isGuest: !uid && !wallet
    };
  }

function getStorageUserId() {
  const { uid, wallet } = getCurrentIdentity();
  return uid || wallet || null;
}

function getStorageUserIdOrGuest() {
  return getStorageUserId() || "guest";
}

function buildScopedKey(prefix, entityId, scopedUserId) {
  const userId = scopedUserId || getStorageUserIdOrGuest();
  return `${prefix}_${entityId}_${userId}`;
}
  function setCurrentUid(uid) {
    const value = normalize(uid);
    if (!value) return;
    localStorage.setItem("uid", value);
  }

  function setCurrentWallet(wallet) {
    const value = normalize(wallet);
    if (!value) return;
    localStorage.setItem("wallet", value);
  }

function clearSession() {
  localStorage.removeItem("uid");
  localStorage.removeItem("wallet");
  localStorage.removeItem("username");
}

function clearUid() {
  localStorage.removeItem("uid");
}
global.sessionService = {
  getUid,
  getWallet,
  getCurrentIdentity,

  // 🔥 Phase 1.1
  getStorageUserId,
  getStorageUserIdOrGuest,
  buildScopedKey,

  // setters
  setCurrentUid,
  setCurrentWallet,

  // clear
  clearUid,
  clearSession
};
    clearSession
  };
})(window);
