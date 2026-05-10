const express = require("express");
const cors = require("cors");
const { createRouter } = require("./router");
const { ErrorCodes, sendError } = require("./api-response");
const { asyncHandler } = require("./async-handler");
const { getPlatformMeta, getPublicFeatureFlags, getPublicIntegrationFlags } = require("./platform-context");

const app = express();
/** 로컬 기본 4200 — TetherGet(4000)·TGX(4100) 등과 포트 충돌 방지 */
const port = process.env.PORT || 4200;

/** Render 등 리버스 프록시 뒤에서 실제 클라이언트 IP·레이트리밋 정확도 향상 */
app.set("trust proxy", Number(process.env.TRUST_PROXY_HOPS || 1));
app.disable("x-powered-by");

app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

app.use(cors());
app.use(express.json());
app.use((err, _req, res, next) => {
  const parseFail =
    err.type === "entity.parse.failed" ||
    (err instanceof SyntaxError && err.status === 400 && "body" in err);
  if (parseFail) {
    res.status(400).json({
      ok: false,
      code: ErrorCodes.VALIDATION_ERROR,
      message: "JSON 본문 형식이 올바르지 않습니다."
    });
    return;
  }
  next(err);
});
app.use("/api", createRouter());

app.get("/health", asyncHandler(async (_req, res) => {
  const payload = {
    ok: true,
    service: "oneai-server",
    ...getPlatformMeta(),
    features: getPublicFeatureFlags(),
    integrations: getPublicIntegrationFlags(),
    userStorage: process.env.DATABASE_URL ? "postgresql" : "file"
  };

  if (process.env.DATABASE_URL) {
    try {
      const { getPrisma } = require("./prisma-client");
      await getPrisma().$queryRaw`SELECT 1`;
      payload.dbPing = "ok";
    } catch (err) {
      payload.dbPing = "error";
      payload.dbError = err instanceof Error ? err.message : "unknown";
      payload.ok = false;
    }
  }

  res.json(payload);
}));

/** 매칭되지 않은 경로 — HTML 대신 공통 API 형식 */
app.use((req, res) => {
  if (req.method === "GET" && req.path === "/favicon.ico") {
    res.status(404).end();
    return;
  }
  sendError(res, 404, ErrorCodes.NOT_FOUND, "요청한 경로를 찾을 수 없습니다.");
});

/** next(err) 또는 동기 예외 전달 시 (비동기 라우트는 각각 try/catch 권장) */
app.use((err, req, res, next) => {
  if (res.headersSent) {
    next(err);
    return;
  }
  console.error("[oneai-server]", err);
  const message =
    process.env.NODE_ENV === "production"
      ? "서버 오류가 발생했습니다."
      : err instanceof Error
        ? err.message
        : "서버 오류";
  sendError(res, 500, ErrorCodes.INTERNAL, message);
});

app.listen(port, () => {
  console.log(`OneAI server running on http://localhost:${port}`);
});
