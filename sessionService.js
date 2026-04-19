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

  global.sessionService = {
    getUid,
    getWallet,
    getCurrentIdentity,
    setCurrentUid,
    setCurrentWallet,
    clearSession
  };
})(window);
