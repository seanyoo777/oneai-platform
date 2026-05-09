const crypto = require("crypto");

const TOKEN_SECRET = process.env.ONEAI_TOKEN_SECRET || "oneai-dev-token-secret";
const TOKEN_EXPIRES_HOURS = Number(process.env.ONEAI_TOKEN_EXPIRES_HOURS || 12);

function toBase64Url(value) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function fromBase64Url(value) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function signPayload(payloadText) {
  return crypto.createHmac("sha256", TOKEN_SECRET).update(payloadText).digest("base64url");
}

function issueUserToken(user) {
  const iat = Date.now();
  const payload = JSON.stringify({
    sub: user.id,
    email: user.email,
    role: user.role,
    iat,
    exp: iat + TOKEN_EXPIRES_HOURS * 60 * 60 * 1000
  });
  const payloadB64 = toBase64Url(payload);
  const signature = signPayload(payloadB64);
  return `${payloadB64}.${signature}`;
}

function verifyUserToken(token) {
  if (!token || !token.includes(".")) return null;
  const [payloadB64, signature] = token.split(".");
  const expected = signPayload(payloadB64);
  if (expected !== signature) return null;
  try {
    const payload = JSON.parse(fromBase64Url(payloadB64));
    if (!payload?.exp || Date.now() > Number(payload.exp)) return null;
    return payload;
  } catch {
    return null;
  }
}

module.exports = { issueUserToken, verifyUserToken };
