export function normalizeEmail(email) {
  return email ? String(email).trim().toLowerCase() : "";
}

export function normalizeWallet(wallet) {
  return wallet ? String(wallet).trim().toLowerCase() : "";
}

export function buildDefaultUser({ uid, wallet = null, email = null, nowIso }) {
  const normalizedWallet = normalizeWallet(wallet);
  const normalizedEmail = normalizeEmail(email);

  return {
    uid,
    wallet: normalizedWallet || null,
    email: normalizedEmail || null,
    emailNormalized: normalizedEmail || null,

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

  const normalizedEmail = normalizeEmail(userData.email);
  const normalizedWallet = normalizeWallet(userData.wallet);

  // normalize email
  if (normalizedEmail && userData.email !== normalizedEmail) {
    patch.email = normalizedEmail;
  }

  if (normalizedEmail && userData.emailNormalized !== normalizedEmail) {
    patch.emailNormalized = normalizedEmail;
  }

  // normalize wallet
  if (normalizedWallet && userData.wallet !== normalizedWallet) {
    patch.wallet = normalizedWallet;
  }

  // providers
  if (typeof providers.wallet !== "boolean") {
    patch["providers.wallet"] = !!normalizedWallet;
  }

  if (typeof providers.email !== "boolean") {
    patch["providers.email"] = !!normalizedEmail;
  }

  // system
  if (!system.status) {
    patch["system.status"] = "active";
  }

  if (!system.role) {
    patch["system.role"] = "user";
  }

  // numeric
  if (typeof userData.points !== "number") {
    patch.points = Number(userData.points) || 0;
  }

  if (typeof userData.streak !== "number") {
    patch.streak = Number(userData.streak) || 1;
  }

  return patch;
}
