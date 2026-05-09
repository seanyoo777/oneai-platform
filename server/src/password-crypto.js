const crypto = require("crypto");

function hashPassword(password) {
  const iterations = 120000;
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.pbkdf2Sync(password, salt, iterations, 32, "sha256").toString("hex");
  return `pbkdf2$${iterations}$${salt}$${derived}`;
}

function verifyPassword(password, storedHash) {
  if (!storedHash) return false;

  if (storedHash.startsWith("pbkdf2$")) {
    const parts = storedHash.split("$");
    if (parts.length !== 4) return false;
    const iterations = Number(parts[1]);
    const salt = parts[2];
    const expected = parts[3];
    const derived = crypto.pbkdf2Sync(password, salt, iterations, 32, "sha256").toString("hex");
    if (derived.length !== expected.length) return false;
    try {
      return crypto.timingSafeEqual(Buffer.from(derived, "hex"), Buffer.from(expected, "hex"));
    } catch {
      return false;
    }
  }

  const legacy = crypto.createHash("sha256").update(password).digest("hex");
  return storedHash === legacy;
}

function makeReferralCode(nickname) {
  const suffix = crypto.randomBytes(3).toString("hex").toUpperCase();
  const prefix = (nickname || "ONE").replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 4) || "ONE";
  return `${prefix}${suffix}`;
}

module.exports = { hashPassword, verifyPassword, makeReferralCode };
