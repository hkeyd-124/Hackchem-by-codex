export const AUTH_ACTIONS = {
  CREATE_ACCOUNT: "CREATE_ACCOUNT",
  WRONG_PASSWORD: "WRONG_PASSWORD",
  THROW: "THROW"
};

export function resolveAuthErrorAction(code) {
  if (code === "auth/user-not-found" || code === "auth/invalid-credential") {
    return AUTH_ACTIONS.CREATE_ACCOUNT;
  }
  if (code === "auth/wrong-password") {
    return AUTH_ACTIONS.WRONG_PASSWORD;
  }
  return AUTH_ACTIONS.THROW;
}

export function getEmailVerificationResult(emailVerified) {
  return emailVerified ? "VERIFIED" : "NOT_VERIFIED";
}

export function isUserBanned(userData = {}) {
  return userData?.system?.status === "banned";
}
