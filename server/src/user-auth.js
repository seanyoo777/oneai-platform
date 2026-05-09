const { verifyUserToken } = require("./auth-token");

function getBearerToken(req) {
  const authHeader = req.headers.authorization || "";
  if (!authHeader.startsWith("Bearer ")) return "";
  return authHeader.slice(7);
}

function requireUser(req, res, next) {
  const token = getBearerToken(req);
  const payload = verifyUserToken(token);
  if (!payload?.sub) {
    res.status(401).json({ ok: false, message: "로그인이 필요합니다." });
    return;
  }
  req.user = payload;
  next();
}

module.exports = { requireUser };
