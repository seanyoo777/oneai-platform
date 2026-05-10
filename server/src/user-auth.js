const { verifyUserToken } = require("./auth-token");
const { ErrorCodes, sendError } = require("./api-response");

function getBearerToken(req) {
  const authHeader = req.headers.authorization || "";
  if (!authHeader.startsWith("Bearer ")) return "";
  return authHeader.slice(7);
}

function requireUser(req, res, next) {
  const token = getBearerToken(req);
  const payload = verifyUserToken(token);
  if (!payload?.sub) {
    sendError(res, 401, ErrorCodes.UNAUTHORIZED, "로그인이 필요합니다.");
    return;
  }
  req.user = payload;
  next();
}

module.exports = { requireUser };
