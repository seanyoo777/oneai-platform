const { authLimiter } = require("../rate-limit-auth");
const { ErrorCodes, sendOk, sendError } = require("../api-response");
const { issueUserToken } = require("../auth-token");
const { issueRefreshToken, consumeRefreshToken, revokeRefreshToken } = require("../refresh-token-store");
const { registerUser, authenticateUser, getUserById } = require("../user-store");
const { requireUser } = require("../user-auth");
const { asyncHandler } = require("../async-handler");

/** Identity — 회원·세션 (통합 플랫폼의 단일 user_id 발급 지점) */
function registerAuthRoutes(router) {
  router.post("/auth/register", authLimiter, asyncHandler(async (req, res) => {
    const email = String(req.body?.email ?? "").trim();
    const password = String(req.body?.password ?? "");
    const nickname = String(req.body?.nickname ?? "").trim();
    const referredBy = String(req.body?.referredBy ?? "").trim();
    if (!email || !password || !nickname) {
      sendError(res, 400, ErrorCodes.VALIDATION_ERROR, "email, password, nickname은 필수입니다.");
      return;
    }
    try {
      const user = await registerUser({ email, password, nickname, referredBy: referredBy || null });
      const token = issueUserToken(user);
      const refreshToken = await issueRefreshToken(user.id);
      sendOk(res, { user, token, refreshToken });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "회원가입 실패";
      if (/이미 가입된 이메일/.test(msg)) {
        sendError(res, 409, ErrorCodes.CONFLICT, msg);
        return;
      }
      sendError(res, 400, ErrorCodes.VALIDATION_ERROR, msg);
    }
  }));

  router.post("/auth/login", authLimiter, asyncHandler(async (req, res) => {
    const email = String(req.body?.email ?? "").trim();
    const password = String(req.body?.password ?? "");
    const user = await authenticateUser(email, password);
    if (!user) {
      sendError(res, 401, ErrorCodes.UNAUTHORIZED, "이메일 또는 비밀번호가 올바르지 않습니다.");
      return;
    }
    const token = issueUserToken(user);
    const refreshToken = await issueRefreshToken(user.id);
    sendOk(res, { user, token, refreshToken });
  }));

  router.get("/auth/me", requireUser, asyncHandler(async (req, res) => {
    const user = await getUserById(req.user.sub);
    if (!user) {
      sendError(res, 404, ErrorCodes.NOT_FOUND, "사용자를 찾을 수 없습니다.");
      return;
    }
    sendOk(res, { user });
  }));

  router.post("/auth/refresh", authLimiter, asyncHandler(async (req, res) => {
    const refreshToken = String(req.body?.refreshToken ?? "");
    if (!refreshToken) {
      sendError(res, 400, ErrorCodes.VALIDATION_ERROR, "refreshToken이 필요합니다.");
      return;
    }
    const userId = await consumeRefreshToken(refreshToken);
    if (!userId) {
      sendError(res, 401, ErrorCodes.UNAUTHORIZED, "유효하지 않거나 만료된 refresh token입니다.");
      return;
    }
    const user = await getUserById(userId);
    if (!user) {
      sendError(res, 404, ErrorCodes.NOT_FOUND, "사용자를 찾을 수 없습니다.");
      return;
    }
    const token = issueUserToken(user);
    const rotatedRefreshToken = await issueRefreshToken(user.id);
    sendOk(res, { token, refreshToken: rotatedRefreshToken });
  }));

  router.post("/auth/logout", asyncHandler(async (req, res) => {
    const refreshToken = String(req.body?.refreshToken ?? "");
    if (refreshToken) await revokeRefreshToken(refreshToken);
    sendOk(res, {});
  }));
}

module.exports = { registerAuthRoutes };
