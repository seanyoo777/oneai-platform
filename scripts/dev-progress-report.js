/**
 * 전체 서비스 MVP 기준 완성도(%) — 백엔드 / DB·영속성 / 프론트 가중 평균
 * 실행: node scripts/dev-progress-report.js   또는   npm run progress
 * 1시간마다: docs/DEV_PROGRESS_REPORT.md 참고 (작업 스케줄러)
 *
 * 수치 일부는 레포 상태를 자동 스캔하고, 나머지는 아래 BASELINE을 주기적으로 손으로 맞춥니다.
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");

/** 사람이 주기적으로 갱신하는 기준선 (자동 점수와 혼합) */
const BASELINE = {
  /** 실거래·실결제 검증, 관측·보안 하드닝, 실데이터 소스 미연동 등 미완을 반영한 수동 추정 */
  backendManual: 68,
  databaseManual: 65,
  frontendManual: 53,
  /** 자동 계산 가중치 0~1 (나머지는 BASELINE 반영. 높이면 파일 존재 위주 점수 비중↑) */
  autoWeight: 0.28
};

function exists(rel) {
  try {
    return fs.existsSync(path.join(ROOT, rel));
  } catch {
    return false;
  }
}

function readText(rel) {
  try {
    return fs.readFileSync(path.join(ROOT, rel), "utf8");
  } catch {
    return "";
  }
}

function scoreBackendAuto() {
  let pts = 0;
  const checks = [
    ["server/src/router.js", 8],
    ["server/src/index.js", 6],
    ["server/src/api-response.js", 5],
    ["server/src/async-handler.js", 5],
    ["server/src/admin-auth.js", 8],
    ["server/src/platform-context.js", 5],
    ["server/scripts/smoke-api.js", 9],
    ["server/src/cache-memory.js", 4],
    ["server/src/rate-limit-auth.js", 5]
  ];
  let max = 0;
  for (const [p, w] of checks) {
    max += w;
    if (exists(p)) pts += w;
  }
  const routesDir = path.join(ROOT, "server/src/routes");
  let routeScore = 0;
  const routeMax = 24;
  try {
    const files = fs.readdirSync(routesDir).filter((f) => f.endsWith(".js"));
    routeScore = Math.min(routeMax, files.length * 3);
  } catch {
    routeScore = 0;
  }
  max += routeMax;
  pts += routeScore;
  return Math.min(100, Math.round((pts / max) * 100));
}

function scoreDatabaseAuto() {
  const schema = readText("server/prisma/schema.prisma");
  let pts = 0;
  const max = 100;
  if (schema.includes("datasource db")) pts += 15;
  if (schema.includes("model User")) pts += 15;
  if (schema.includes("model SiteContent")) pts += 12;
  if (schema.includes("model WatchlistItem")) pts += 10;
  if (schema.includes("model AiRecommendationLog")) pts += 10;
  if (schema.includes("model AuditLog")) pts += 10;
  if (schema.includes("model RefreshToken")) pts += 10;
  if (schema.includes("model MembershipPayment")) pts += 8;
  if (schema.includes("model StrategyAction")) pts += 5;
  if (exists("server/src/user-store.js") && readText("server/src/user-store.js").includes("useDatabase")) pts += 5;
  return Math.min(100, Math.round((pts / max) * 100));
}

function scoreFrontendAuto() {
  const appDir = path.join(ROOT, "app");
  let pageCount = 0;
  let liveHints = 0;
  try {
    const walk = (dir) => {
      for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, name.name);
        if (name.isDirectory()) walk(full);
        else if (name.name === "page.tsx") {
          pageCount += 1;
          const txt = readText(path.relative(ROOT, full));
          if (
            /oneaiFetch|PageLive|DashboardLive|HomeCmsSection|AuthPanel|WatchlistPanel|admin-users-panel/i.test(txt)
          ) {
            liveHints += 1;
          }
        }
      }
    };
    walk(appDir);
  } catch {
    return 40;
  }
  const apiCoverage = pageCount ? Math.round((liveHints / pageCount) * 55) : 0;
  const shellPts = exists("lib/oneai-api.ts") ? 15 : 0;
  const layoutPts = exists("app/layout.tsx") ? 10 : 0;
  const componentsPts = exists("components/auth-panel.tsx") ? 10 : 0;
  const adminPts = exists("app/admin/page.tsx") ? 10 : 0;
  let raw = apiCoverage + shellPts + layoutPts + componentsPts + adminPts;
  if (exists("app/error.tsx")) raw += 3;
  if (exists("app/not-found.tsx")) raw += 3;
  if (exists("app/loading.tsx")) raw += 2;
  return Math.min(100, raw);
}

function blend(auto, manual) {
  const w = BASELINE.autoWeight;
  return Math.round(auto * w + manual * (1 - w));
}

function overall(b, d, f) {
  return Math.round(b * 0.34 + d * 0.33 + f * 0.33);
}

function tier(pct) {
  if (pct < 30) return "PoC";
  if (pct < 55) return "알파";
  if (pct < 75) return "베타/MVP";
  if (pct < 88) return "출시 준비·하드닝";
  return "운영 수준(지속 개선)";
}

function main() {
  const autoB = scoreBackendAuto();
  const autoD = scoreDatabaseAuto();
  const autoF = scoreFrontendAuto();

  const backend = blend(autoB, BASELINE.backendManual);
  const database = blend(autoD, BASELINE.databaseManual);
  const frontend = blend(autoF, BASELINE.frontendManual);

  const total = overall(backend, database, frontend);
  const stamp = new Date().toISOString();

  const lines = [
    "========================================",
    `OneAI 개발 완성도 리포트  (${stamp})`,
    "========================================",
    "",
    "※ MVP·실서비스 오픈 가능 기준의 추정치입니다. 법무/결제 실검증/실거래 연동 등은 별도 과제입니다.",
    "",
    `[백엔드 API·운영]     ${backend}%`,
    `[DB·영속성]          ${database}%`,
    `[프론트엔드]         ${frontend}%`,
    "",
    `>>> 전체 가중 평균    ${total}%  (${tier(total)})`,
    "",
    "--- 자동 스캔 참고 ---",
    `백엔드 자동 추정: ${autoB}% (라우트·스모크·미들웨어 존재)`,
    `DB 자동 추정:     ${autoD}% (Prisma 모델·듀얼 스토어 힌트)`,
    `프론트 자동 추정: ${autoF}% (페이지별 API 연동 힌트 비율 + 기본 골격)`,
    "",
    `블렌드 가중치 auto=${BASELINE.autoWeight} / 수동 베이스라인 혼합`,
    ""
  ];

  const text = lines.join("\n");
  console.log(text);

  if (process.argv.includes("--append")) {
    const logPath = path.join(ROOT, "docs", "progress-history.log");
    fs.appendFileSync(logPath, text + "\n", "utf8");
    console.log(`[append] ${logPath}`);
  }
}

main();
