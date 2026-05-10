# OneAI 개발 진행 기록 (CHANGELOG)

**최신 진행 상황을 빠르게 볼 때:** 이 파일 → [`PLATFORM_ARCHITECTURE.md`](PLATFORM_ARCHITECTURE.md) → [`PRINCIPLES.md`](PRINCIPLES.md) → 루트 [`README.md`](../README.md) API 절.

형식은 [Keep a Changelog](https://keepachangelog.com/ko/1.0.0/)에 가깝게 유지합니다.

---

## [Unreleased]

### 예정 / 메모
- Prisma `SiteContent`, `AiRecommendationLog` 사용 시 배포마다 `npx prisma db push`로 스키마 동기화

---

## [0.3.51] - 2026-05-10

### Changed
- **`PlatformMetaProvider`** (`app/layout.tsx`): `GET /api/platform/meta` 단일 요청 후 `integrations` 공유. **`IntegrationStrip`** 은 Provider 내부에서는 재요청하지 않음(Provider 밖에서는 기존 자체 요청 폴백). 타입은 `lib/integration-flags.ts`.
- **`docs/PLATFORM_ARCHITECTURE.md`**, **`docs/INTEGRATIONS.md`**: 클라이언트 메타 로드 방식 반영.

---

## [0.3.50] - 2026-05-10

### Changed
- **`IntegrationStrip`:** 관리자(`/admin`)·폼 미리보기(`/preview/auth`) 상단에 배치. 운영 중 외부 피드 메타 확인 및 프리뷰 시 API 연결 점검에 활용. `docs/INTEGRATIONS.md` 목록 갱신.

---

## [0.3.49] - 2026-05-10

### Changed
- **`/me`:** 상단에 `IntegrationStrip` (`Account · live feeds`). `docs/INTEGRATIONS.md` UI 목록에 내 정보 경로 반영.

---

## [0.3.48] - 2026-05-10

### Changed
- **`IntegrationStrip`:** Signal, Global Data, Research, Scan, Membership, Exchange, 시스템 트레이딩 페이지 상단에 동일 패턴으로 배치. `docs/INTEGRATIONS.md`에 UI 위치 안내 추가.

---

## [0.3.47] - 2026-05-10

### Changed
- **`IntegrationStrip`**: 공용 컴포넌트로 분리(`components/integration-strip.tsx`). 홈·Market·News 상단에 배치 가능(`heading`·`className`).

---

## [0.3.46] - 2026-05-10

### Added
- **`components/home-integration-strip.tsx`:** 홈에서 `GET /api/platform/meta`의 `integrations`로 외부 피드 연결 여부 표시(Crypto·KOSPI·US·News).

---

## [0.3.45] - 2026-05-10

### Added
- **`integrations`** 공개 플래그: `getPublicIntegrationFlags()` — `/health`·`GET /api/platform/meta`에 `coingecko`·`finnhubQuote`·`finnhubNews`·`yahooKospi` boolean.
- **Finnhub 시장 뉴스:** `ONEAI_FINNHUB_NEWS=1` + `FINNHUB_API_KEY` 시 `GET /api/news`가 Finnhub 헤드라인 사용 (`server/src/sources/finnhub-news.js`).

### Changed
- **`server/scripts/smoke-api.js`:** `integrations` 형태 및 health/meta 일치 검증.

---

## [0.3.44] - 2026-05-10

### Added
- **Yahoo Chart KOSPI (`server/src/sources/yahoo-kospi.js`):** `ONEAI_YAHOO_KOSPI=1` 시 시장 요약 **KOSPI** 행을 ^KS11 메타 시세로 병합 (비공식 API · 실패 시 더미).

### Removed
- Stooq CSV 경로 — 현재 무료 다운로드에 apikey 요구로 제거.

---

## [0.3.43] - 2026-05-10

### Added
- **Finnhub 연동 (`server/src/sources/finnhub.js`):** `FINNHUB_API_KEY` 설정 시 시장 요약 **NASDAQ** 행을 지정 심볼(기본 `QQQ`) 시세로 병합. 타임아웃·오류 시 더미 유지.

### Changed
- **`server/src/sources/index.js`:** CoinGecko → Finnhub 순차 병합.
- **`docs/INTEGRATIONS.md`**, **`server/.env.example`:** Finnhub 절·변수 안내.

---

## [0.3.42] - 2026-05-10

### Added
- **`server/src/sources/`:** 더미(`dummy.js`)와 분리된 진입점(`index.js`). 선택 시 **CoinGecko** 공개 API로 시장 요약의 **BTC·ETH** 행 병합 (`ONEAI_COINGECKO=1`). 실패·타임아웃 시 더미 폴백.
- **`docs/INTEGRATIONS.md`:** 프로바이더 문서 링크·환경 변수·로드맵 표.

### Changed
- **`docs/PLATFORM_ARCHITECTURE.md`**, **`README.md`**, **`AGENTS.md`:** 연동 문서 및 `sources/` 경로 반영.

---

## [0.3.41] - 2026-05-10

### Changed
- **로컬 API 포트 분리:** Express 기본 `PORT` **4200** (기존 4000). `lib/oneai-api.ts` 폴백·`.env.local.example`·`server/.env.example`·스모크·CI 헬스 체크 동일. TetherGet(4000)·TGX(4100) 등과 동시 개발 시 충돌 완화 — 프로덕션은 배포 URL 그대로.

---

## [0.3.40] - 2026-05-10

### Added
- **`app/global-error.tsx`:** 루트 레이아웃 단계 오류 시 표시 (독립 `html`/`body`, `globals.css` 로드) — `error.tsx`와 동일 메시지·다시 시도 흐름.

---

## [0.3.39] - 2026-05-10

### Changed
- **`server/src/index.js`:** `app.disable("x-powered-by")`; 공통 미들웨어로 `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin` — 프론트 `next.config`와 같은 계열.

---

## [0.3.38] - 2026-05-10

### Changed
- **`next.config.mjs`:** `poweredByHeader: false`; 전역 `headers`에 `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`.

---

## [0.3.37] - 2026-05-10

### Added
- **`app/not-found.tsx`:** `metadata`(제목·설명·`robots: noindex`) — 탭 제목 `페이지 없음 · OneAI`.

---

## [0.3.36] - 2026-05-10

### Added
- **페이지 `metadata`:** Market·Signal·Scan·News·Research·Global Data·Exchange·멤버십·관리자·시스템 트레이딩 등 공개 라우트에 제목·설명 — 루트 `title.template` (`%s · OneAI`)와 조합.
- **`app/me/layout.tsx`:** 클라이언트 전용 `/me` 세그먼트용 메타데이터.
- **`app/preview/auth`:** 누락됐던 `metadata`(noindex) 복구.

---

## [0.3.35] - 2026-05-10

### Added
- **`app/page.tsx`:** 홈 전용 `metadata`(제목 `홈` → 브라우저 타이틀 `홈 · OneAI`, 설명).

### Changed
- **`app/layout.tsx`:** `metadata.title`을 `{ default, template: "%s · OneAI" }`로 통일 — 하위 페이지 `title` 문자열과 조합.

---

## [0.3.34] - 2026-05-10

### Added
- **`app/preview/auth/page.tsx`:** 페이지 `metadata`(제목·설명) 및 **`robots: { index: false, follow: false }`** — 미리보기 경로 검색 색인 방지.

---

## [0.3.33] - 2026-05-10

### Changed
- **CI (`next-build.yml`) `paths`:** `scripts/**`, `.eslintrc.json` 추가 — 진행도 스크립트·린트 규칙 변경 시에도 자동 빌드가 돈다.

---

## [0.3.32] - 2026-05-10

### Changed
- **CI:** `push`/`pull_request`에 `paths` 필터 — 프론트 관련 변경만 Next 빌드, `server/**` 변경만 API 스모크. **`workflow_dispatch`**는 경로와 무관하게 실행.

---

## [0.3.31] - 2026-05-10

### Added
- **CI:** `next-build.yml`·`smoke-api.yml`에 `workflow_dispatch`(수동 실행), `concurrency`(같은 브랜치에서 진행 중인 이전 실행 취소).

### Changed
- **`app/loading.tsx`:** 루트에 `role="status"`·`aria-live="polite"`·`aria-busy="true"` — 라우트 전환 로딩을 보조공학에 알림.

---

## [0.3.30] - 2026-05-10

### Added
- **스모크:** `/health`와 `/api/platform/meta`의 `serverPackageVersion` 일치 검증.

### Changed
- **`not-found`:** `<section aria-labelledby>`·제목 `id`; 안내 문단 `role="status"`.
- **`error`:** 동일 시맨틱 구조; 메시지 영역 `role="alert"`.

---

## [0.3.29] - 2026-05-10

### Changed
- **`MainNav`:** 로고 링크에 `aria-describedby`, 태그라인에 `id="site-tagline"`으로 부가 설명 연결.
- **`FooterNotice`:** 면책 문단을 `<section aria-labelledby>` + 스크린리더 전용 제목(`sr-only`)으로 구획.

---

## [0.3.28] - 2026-05-10

### Changed
- **`AdminRoleHint`:** 오류·로딩·역할 표시에 `role="status"`·`aria-live="polite"`.
- **`DeferredMount`:** 스크롤 전 안내 문구에 동일 스크린리더 알림.
- **`app/preview/auth`:** `<section aria-labelledby>`·제목 `id`; 환경변수명 `<code>` 스타일 통일.
- **`app/admin`:** 루트를 `<section aria-labelledby="admin-page-title">`로 정리.

---

## [0.3.27] - 2026-05-10

### Changed
- **`AdminStrategyPolicyPanel`:** `actionBusy`·`uiLocked`로 조회·액션 중 버튼 비활성화; 로딩·오류·목록 `aria-busy`/`aria-live`; 액션 이력 빈 안내는 초기 로드 완료 후에만.
- **`AdminAiRecLogPanel`:** 로그 조회 `loading`, 부제·메시지·목록 `aria-*`, 새로고침 비활성화; 빈 목록 안내는 로딩 종료 후에만.

---

## [0.3.26] - 2026-05-10

### Changed
- **`AdminUsersPanel`:** 목록 로드·회원별 수정 중 상태로 버튼·날짜 입력 비활성화; 목록 영역 `aria-bus`; 메시지 `aria-live`.
- **`AdminCmsPanel`:** 목록 로드(`listLoading`)·생성·토글·삭제(`actionBusy`) 중 UI 잠금·카드 부제 진행 문구·메시지 `aria-live`; `load()` 성공 여부 반환 및 생성 후 재조회 시 성공 메시지 유지.

---

## [0.3.25] - 2026-05-10

### Changed
- **`membership-page-live`:** 견적 로딩·오류·지갑 메시지에 `role="status"`·`aria-live="polite"`; 카드 부제의 API 문자열을 `<code>`로 표시.
- **지갑 연결:** 요청 중 입력·셀렉트 비활성화·`aria-busy`; `connectWallet` 예외 시 메시지 표시.

---

## [0.3.24] - 2026-05-10

### Changed
- **`AuthPanel`:** 회원가입·로그인·내 정보 조회 중 `busy` 상태 — 부제「요청 처리 중…」, 입력·버튼 비활성화, 폼에 `aria-busy`; 결과 메시지에 `role="status"`·`aria-live="polite"`.

---

## [0.3.23] - 2026-05-10

### Added
- **관심종목 패널:** `gate === pending`일 때 빈 화면 대신 카드 + 「플랫폼 설정 확인 중…」(`aria-live`).

### Changed
- **관심종목 패널:** 서버 목록 로드 중 부제·폼·버튼 비활성화; 피드백 문구에 `role="status"`; 빈 목록 안내는 로딩 완료 후에만 표시.

---

## [0.3.22] - 2026-05-10

### Changed
- **`LiveSystemExchanges`:** 로딩 시 부제·`aria-live`, 완료 후 서버 목록 vs 샘플 슬롯 안내; `description`을 `ReactNode`로 허용.
- **Exchange / 시스템 트레이딩 페이지:** 상단 안내 문구를 API·출처 확인에 맞게 조정.

---

## [0.3.21] - 2026-05-10

### Added
- **홈 대시보드:** 상단 `LivePageSubtitle`로 전체 로딩·데이터 출처 안내; 시장·시그널·뉴스 카드별 서버/샘플 구분 문구.

### Changed
- **`Card`:** `description`에 `ReactNode` 허용(문자열과 동일 스타일 래퍼).

---

## [0.3.20] - 2026-05-10

### Added
- **`LivePageSubtitle`** (`components/live-page-subtitle.tsx`) — 라이브 페이지 상단 부제에 `role="status"`·`aria-live="polite"`로 로딩 알림.

### Changed
- **라이브 페이지:** Market·News·Signal·Global Data·Research·Scan 상단 문구를 `LivePageSubtitle`로 통일 (Scan은 유니버스 수를 `children`으로 유지).

---

## [0.3.19] - 2026-05-10

### Added
- **Lint:** `eslint`, `eslint-config-next`, `.eslintrc.json` (`next/core-web-vitals`) — `npm run lint` 비대화·경고 해소 기준.

### Changed
- **멤버십 페이지 (`membership-page-live`):** 견적 조회 `useEffect` 의존성에 `catalogPlans` 포함 — 카탈로그 로드 후 견적 재조회·`react-hooks/exhaustive-deps` 경고 제거.
- **CI:** `next-build.yml`에 `npm run lint` 단계 추가.

---

## [0.3.18] - 2026-05-10

### Added
- **SEO:** `app/robots.ts` — `/admin`, `/preview` 크롤 제외, 사이트 URL이 있으면 `sitemap` 링크.
- **SEO:** `app/sitemap.ts` — 공개 페이지 정적 경로 목록(`NEXT_PUBLIC_SITE_URL` 또는 Vercel `VERCEL_URL`이 있을 때만 항목 생성).
- **유틸:** `lib/site-origin.ts`의 `getSiteOrigin()` — 위와 동일 규칙으로 절대 원점 결정.
- **CI:** `.github/workflows/next-build.yml` — `npm run typecheck`, `npm run build`.

### Changed
- **레이아웃:** `metadataBase` 계산을 `getSiteOrigin()`으로 통일.

---

## [0.3.17] - 2026-05-10

### Added
- **CI:** GitHub Actions 워크플로 `Server API smoke` — `server` 기동 후 `npm run smoke` (Ubuntu, Node 20).

### Changed
- **스모크 (`server/scripts/smoke-api.js`):** `/health` 필드 검증 강화(`service`, 플랫폼 메타·`features`·`userStorage`). `/api/platform/meta`와 `platformServiceId`·`apiVersion` 일치 확인.

---

## [0.3.16] - 2026-05-10

### Added
- **SEO:** `twitter` 메타데이터(`summary`). 선택적 `NEXT_PUBLIC_SITE_URL` 설정 시 `metadataBase`로 OG·canonical 절대 URL 정합.

### Changed
- **환경 예시:** `.env.local.example`에 `NEXT_PUBLIC_SITE_URL` 주석 추가.

---

## [0.3.15] - 2026-05-10

### Added
- **SEO:** 루트 `metadata`에 기본 `openGraph`(제목·설명·`locale`·`type`).

### Changed
- **스모크 (`server/scripts/smoke-api.js`):** `GET /api/cms/public` — `banners`·`articles`·`featuredPicks`·`events` 배열 검증 추가. README 스모크 절에 경로 추가 및 **스크립트가 단일 기준**임을 명시.

---

## [0.3.14] - 2026-05-10

### Added
- **메인 네비:** 상단 `<nav>`에 `aria-label="주요 메뉴"` (푸터 내비와 대응).

### Changed
- **스모크 (`server/scripts/smoke-api.js`):** `GET /api/system-trading/eligibility` (`eligible`, `referralOk`, `membershipOk`, `reason`) 검증 추가. README 스모크 설명 동기화.

---

## [0.3.13] - 2026-05-10

### Added
- **푸터:** 링크 `<nav>`에 `aria-label="바닥글 주요 링크"`.

### Changed
- **스모크 (`server/scripts/smoke-api.js`):** `GET /api/research/strategy-policy`, `GET /api/scan/results?type=all` 검증 추가. README 스모크 설명 동기화.

---

## [0.3.12] - 2026-05-10

### Added
- **접근성:** 루트 레이아웃에 **본문으로 건너뛰기** 링크(`#main-content`), `<main>`에 `id`·`tabIndex={-1}`.

### Changed
- **스모크 (`server/scripts/smoke-api.js`):** `GET /api/research/strategy-scores` (`{ ok, scores[] }`) 검증 추가. README 스모크 설명 동기화.

---

## [0.3.11] - 2026-05-10

### Changed
- **스모크 (`server/scripts/smoke-api.js`):** `GET /api/system-trading/exchanges`, `GET /api/global-data/coverage` 검증 추가. README 스모크 설명 동기화.
- **접근성:** 클립보드 복사 실패 안내 문구에 `role="status"` · `aria-live="polite"` (멤버십·내 정보).

---

## [0.3.10] - 2026-05-10

### Changed
- **메인 네비 (`MainNav`):** 현재 경로 탭 강조(`usePathname`)·`aria-current="page"` · 로고 블록을 홈(`/`) 링크로 연결.
- **스모크 (`server/scripts/smoke-api.js`):** `GET /api/scan/overview` (`universeCount`, `fields`, `scanners`) 검증 추가. README 스모크 설명 동기화.

---

## [0.3.9] - 2026-05-10

### Changed
- **스모크 (`server/scripts/smoke-api.js`):** `GET /api/signals`, `GET /api/news`에 `{ ok, signals|news }` 형태 검증 추가. README 스모크 설명 동기화.
- **접근성:** 멤버십·내 정보의 지갑/입금 **주소 복사** 버튼에 `aria-label` 추가.

---

## [0.3.8] - 2026-05-10

### Added
- **README:** 현재 버전(`package.json`과 동기) 및 CHANGELOG 링크 한 줄.
- **내 정보 (`AuthPanel`):** 연결 지갑이 있을 때 **주소 복사** 버튼 · 실패 힌트 (`lib/copy-to-clipboard` 재사용).
- **홈 대시보드:** 멤버십 카드에서 `/membership` · `/me` 바로가기 링크.

---

## [0.3.7] - 2026-05-10

### Added
- **Next.js:** 루트 `app/error.tsx`, `app/not-found.tsx`, `app/loading.tsx` — 오류 경계·404·전역 로딩; `scripts/dev-progress-report.js`에 오류/404/로딩 파일 가산 및 `frontendManual` 53 조정.
- **푸터:** `FooterNotice`에 홈·멤버십·내 정보 링크.
- **클립보드:** `lib/copy-to-clipboard.ts` — 멤버십 VIP 입금 주소·등록 지갑 주소 복사에 사용.
- **내 정보 페이지:** 멤버십 안내 링크 추가.
- **`PLATFORM_ARCHITECTURE.md`:** billing 공개·로그인·웹훅 경로 요약 문단.
- **멤버십 공개 카탈로그:** `GET /api/payments/membership/catalog` (`listMembershipPlans`, `MEMBERSHIP_PLAN_CATALOG` 단일 소스), 멤버십 페이지 상단 요금표 연동; **`npm run smoke`** 에 카탈로그 검증 추가.
- **내 정보:** `/api/auth/me`의 연결 지갑·네트워크 표시 및 멤버십 페이지 안내 링크 (`components/auth-panel.tsx`).
- **네비게이션:** 소형 화면에서 메뉴가 숨겨지지 않도록 가로 스크롤·줄바꿈 적용 (`components/main-nav.tsx`).
- **멤버십 지갑 연결:** 로그인 시 `POST /api/payments/wallet/connect` + 연결 지갑 표시 (`/api/auth/me` 동기화).
- **관리자 클라이언트:** `getPublicAdminToken()` (`lib/admin-env.ts`)로 `NEXT_PUBLIC_ADMIN_TOKEN` 소비 통일.
- **멤버십 페이지:** 로그인 시 `GET /api/payments/membership/quote`로 VIP 플랜(vip_30d/90d/365d) 견적·입금 주소 표시 (`components/membership-page-live.tsx`). 세션 키 **`lib/auth-storage.ts`** 로 AuthPanel과 공유.
- **연구·스캔·글로벌·거래소 화면 API 연동:** `ResearchPageLive` (`/api/research/strategy-scores`, `strategy-policy`), `ScanPageLive` (`/api/scan/overview`, `scan/results`), `GlobalDataPageLive` (`/api/global-data/coverage`), `LiveSystemExchanges` (`/api/system-trading/exchanges`) — 시스템 트레이딩·Exchange 페이지에 커넥터 카드 반영.
- **개발 완성도 리포트:** `npm run progress` / `npm run progress:log` (`scripts/dev-progress-report.js`), 운영 방법 `docs/DEV_PROGRESS_REPORT.md` (1시간마다는 로컬 작업 스케줄러로 실행).
- **마켓·시그널·뉴스 페이지 API 연동:** `MarketPageLive`, `SignalPageLive`, `NewsPageLive`에서 각각 공개 API 조회 후 더미 폴백 (`components/market-page-live.tsx` 등). 시세 표시용 **`lib/live-formatters.ts`** 공통화, 홈 대시보드도 동일 포맷터 사용.
- **홈 대시보드 API 연동:** `HomeDashboardLive`에서 `/api/market/summary`, `/api/signals`, `/api/news`를 병렬 조회하고, 오류·빈 응답 시 기존 더미 데이터로 폴백 (`components/home-dashboard-live.tsx`).
- **스모크:** 알 수 없는 `/api/...` 요청이 `{ ok: false, code: NOT_FOUND }` 인지 검증 (`server/scripts/smoke-api.js`).

---

## [0.3.6] - 2026-05-10

### Added
- **asyncHandler** (`server/src/async-handler.js`): `async` 라우트·`GET /health`에서 미처리 Promise rejection을 `next(err)`로 넘겨 전역 500 핸들러가 잡도록 적용 (`routes/*`, `index.js`).
- **전역 404 / 500 핸들러** (`server/src/index.js`): 존재하지 않는 경로는 `{ ok: false, code: NOT_FOUND }`, 처리 중 예외는 `{ ok: false, code: INTERNAL }` (프로덕션에서는 메시지 일반화).
- **스모크:** `GET /api/market/summary`가 `{ ok, summary }` 인지 추가 확인 (`server/scripts/smoke-api.js`).

### Fixed
- **`GET /api/system-trading/eligibility`**, **`GET /api/scan/results`:** 쿼리 파라미터를 `req.query`로 읽도록 정리 (`server/src/routes/market-data.js`).

---

## [0.3.5] - 2026-05-10

### Changed
- **의존성 상향:** 프론트 `next` 14.2.28, Tailwind/PostCSS/TypeScript·타입 정의 등 dev 의존성 패치; 서버 `express` 4.21.2 (동일 메이저 내 보안·유지보수 패치). 잠금 파일은 로컬에서 `npm install`로 동기화.

---

## [0.3.4] - 2026-05-10

### Changed
- **`POST /api/admin/strategies/action`**, **`POST /api/payments/membership/webhook`**, **`GET /api/platform/meta`** 응답을 `sendOk` 기준 `{ ok: true, … }` 로 통일 (웹훅·전략 본문 필드는 기존과 동일).
- **JSON 파싱 오류** 처리 시 `entity.parse.failed` 유형도 인식 (`server/src/index.js`).

---

## [0.3.3] - 2026-05-10

### Added
- **`npm run smoke`** (`server/scripts/smoke-api.js`) — `/health`·`/api/platform/meta` 확인; 환경변수 `SMOKE_API_BASE`.

### Changed
- **공개 마켓·스캔·글로벌 등** 응답을 `{ ok: true, … }` 로 통일 (기존 단일 배열/객체 전용 응답과 호환되지 않음 — 신규 클라이언트 기준).
- **잘못된 JSON 본문** → `400` + `VALIDATION_ERROR`.

---

## [0.3.2] - 2026-05-10

### Changed
- **`ONEAI_FEATURE_CMS=0`:** 공개 CMS는 빈 묶음만 반환, **관리자 CMS API는 403**.
- **`ONEAI_FEATURE_AI_REC_LOG=0`:** 시그널 배치 로그 미기록, 관리자 AI 로그 API는 **빈 목록**.

---

## [0.3.1] - 2026-05-10

### Changed
- **CMS·관리자 라우트** `sendOk`/`sendError`·`code` 정리 및 소스 포맷 정리.
- **관리자 목록 API:** `GET .../users` → `{ ok, users }`, `.../action-history` → `{ ok, entries }`, `.../audit-logs` → `{ ok, logs }` (프론트는 구 배열 응답 호환).
- **연구 API:** `strategy-scores` → `{ ok, scores }`, `strategy-policy` → `{ ok, policyConfig, evaluatedAt, results }`.
- **관심종목:** `ONEAI_FEATURE_WATCHLIST=0` 시 API **403** + `/me` 패널 숨김; README 중복 절 정리.

---

## [0.3.0] - 2026-05-10

### Added
- **`GET /api/platform/meta`**, `/health`의 `features`, 기능 플래그 env (`ONEAI_FEATURE_*`).
- **관리자 RBAC** — 역할별 토큰, `GET /api/admin/session`, **`AdminRoleHint`**.
- **README** API 오류 형식(`ok`/`code`/`message`) 안내.

### Changed
- **인증·결제·사용자 미들웨어·레이트리밋** 응답에 통합 **`code`** (`VALIDATION_ERROR`, `UNAUTHORIZED`, `NOT_FOUND`, `CONFLICT`, `RATE_LIMITED` 등).
- **`oneaiErrorHint`** — `[CODE]` 접두사로 에러 코드 표시.
- **홈 CMS** — `/api/platform/meta`에서 `features.cms === false`면 CMS 블록 비표시.
- **관리자 `/admin`** — 지연 로드·동적 import 유지.

---

## [0.2.0] - 2026-05-10

### Added
- **통합 문서:** `PRINCIPLES.md`, `PLATFORM_ARCHITECTURE.md`, 루트 `AGENTS.md`, Cursor 규칙 `oneai-principles.mdc`
- **서버 운영:** `trust proxy`, `express-rate-limit` (가입/로그인/refresh), `/health`에 `platformServiceId`·`apiVersion`·DB ping(옵션)
- **경로 모듈화:** `server/src/routes/*` (auth, profile, billing, market-data, cms-public, cms-admin, admin)
- **프론트 API 단일화:** `lib/oneai-api.ts` (`oneaiFetch`, `oneaiErrorHint`, `getOneaiApiBaseUrl`)
- **관심종목:** `GET/PUT /api/me/watchlist`, 파일/Prisma `WatchlistItem`, `/me` UI `WatchlistPanel`
- **CMS (관리 콘텐츠):** 배너·기사·추천·이벤트 — `GET /api/cms/public`, `admin/cms/items` CRUD, `SiteContent` / `server/data/cms-content.json`, 홈 `HomeCmsSection`, `AdminCmsPanel`
- **공개 API 캐시:** `ONEAI_PUBLIC_CACHE_TTL_MS` — 시세/시그널/뉴스 인메모리 TTL
- **AI·시그널 서빙 로그:** 캐시 갱신 시 요약 기록, `AiRecommendationLog` / `ai-recommendation-logs.json`, `GET /api/admin/ai-recommendation-logs`, `AdminAiRecLogPanel`, `ONEAI_SIGNAL_MODEL_VERSION`
- **관리자 UI 정리:** `AdminUsersPanel`·`AdminStrategyPolicyPanel` → `oneaiFetch` 기반, 응답/에러 처리 보강

### Fixed
- Prisma 스키마: 블록 주석 `/** */` → `//` (Prisma 파서 호환)

---

## [0.1.0] - 이전 (MVP 기준선)

- Next.js 앱(홈, market, signal, scan, research, admin, me 등), Express API, 소스 분리 `sources` / `connectors`
- 이메일 인증, refresh token, 관리자 토큰, 감사 로그, 멤버십/지갑 MVP, 전략 점수·정책 API

---

## 버전 번호

- **앱(프론트) 패키지:** 루트 `package.json` `version`
- **API 서버:** `server/package.json` `version` 및 `/health`의 `serverPackageVersion` ( `platform-context` )

이 CHANGELOG의 `[0.2.0]` 날짜·범위는 **대화 기준 작업 묶음**이며, npm 버전을 올릴 때 동기화하는 것을 권장합니다.
