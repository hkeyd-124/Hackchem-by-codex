export function normalizeEmail(email) {
  if (!email) return null;
  return String(email).trim().toLowerCase();
}

export function normalizeWallet(wallet) {
  if (!wallet) return null;
  return String(wallet).trim();
}

export function buildDefaultUser({ uid, wallet = null, email = null, nowIso }) {
  const normalizedWallet = normalizeWallet(wallet);
  const normalizedEmail = normalizeEmail(email);

  return {
    uid,
    wallet: normalizedWallet,
    email: normalizedEmail,

    name: "",
    avatar: "",
    cover: "",

    points: 0,
    streak: 1,
    lastCheckin: "",

    createdAt: nowIso || new Date().toISOString(),

    providers: {
      wallet: !!normalizedWallet,
      email: !!normalizedEmail
    },
    system: {
      status: "active",
      role: "user"
    }
  };
}

export function buildSchemaPatch(userData = {}) {
  const patch = {};
  const providers = userData.providers || {};
  const system = userData.system || {};

  if (typeof providers.wallet !== "boolean") {
    patch["providers.wallet"] = !!userData.wallet;
  }
  if (typeof providers.email !== "boolean") {
    patch["providers.email"] = !!userData.email;
  }

  if (!system.status) {
    patch["system.status"] = "active";
  }
  if (!system.role) {
    patch["system.role"] = "user";
  }

  if (typeof userData.points !== "number") {
    patch.points = Number(userData.points) || 0;
  }
  if (typeof userData.streak !== "number") {
    patch.streak = Number(userData.streak) || 1;
  }

  return patch;
}
