/** 공통 API 에러 코드 (문서·프론트 공유용). 기존 라우트는 점진적으로 적용 */
const ErrorCodes = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
  RATE_LIMITED: "RATE_LIMITED",
  INTERNAL: "INTERNAL"
};

function sendOk(res, data = {}) {
  res.json({ ok: true, ...data });
}

function sendError(res, status, code, message) {
  res.status(status).json({ ok: false, code, message });
}

module.exports = { ErrorCodes, sendOk, sendError };
