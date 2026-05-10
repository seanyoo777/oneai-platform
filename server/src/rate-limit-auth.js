const rateLimit = require("express-rate-limit");
const { ErrorCodes } = require("./api-response");

/** 로그인·가입·토큰 갱신 무차별 시도 완화 (프록시 뒤 IP 기준) */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.ONEAI_AUTH_RATE_LIMIT_MAX || 60),
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      ok: false,
      code: ErrorCodes.RATE_LIMITED,
      message: "요청이 너무 많습니다. 잠시 후 다시 시도하세요."
    });
  }
});

module.exports = { authLimiter };
