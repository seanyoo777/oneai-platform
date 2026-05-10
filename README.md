# OneAI / 원에이아이 MVP

모든 시장을 하나의 AI로.

**현재 버전:** `0.3.54` (루트 `package.json`과 동일 · 변경 요약은 [`docs/CHANGELOG.md`](docs/CHANGELOG.md))

## 개요
- OneAI는 코인/국내주식/미국주식/선물/뉴스/시그널/전략 연구를 통합한 AI 기반 투자정보 플랫폼입니다.
- 본 MVP는 더미 데이터 기반으로 동작하며, 추후 실제 API 연동이 쉽도록 데이터 수집 레이어를 분리했습니다.

**개발 원칙(플랫폼·통합 생태계):** [`docs/PRINCIPLES.md`](docs/PRINCIPLES.md) · 통합 구조: [`docs/PLATFORM_ARCHITECTURE.md`](docs/PLATFORM_ARCHITECTURE.md) · **외부 연동·키 준비:** [`docs/INTEGRATIONS.md`](docs/INTEGRATIONS.md) · **진행 기록:** [`docs/CHANGELOG.md`](docs/CHANGELOG.md) · Cursor/에이전트: [`AGENTS.md`](AGENTS.md)

## 기술 스택
- Frontend: Next.js + React + TailwindCSS
- Backend: Node.js + Express
- Database: PostgreSQL **(선택)** — `DATABASE_URL` 없으면 `server/data/users.json` 파일 저장소

## 실행
```bash
npm install
npm run dev
```

백엔드:
```bash
cd server
npm install
npm run dev
```

기본적으로 API는 **`http://localhost:4200`** 에서 뜹니다. 다른 로컬 MVP와 포트를 나누려면 예를 들어 TetherGet **4000**, TGX **4100**, OneAI **4200**처럼 고정하고, 이 저장소에서는 `server`의 **`PORT`**(또는 `server/.env`)와 루트 **`.env.local`의 `NEXT_PUBLIC_API_BASE_URL`**을 같은 호스트·포트로 맞추면 됩니다.

### 프로덕션급 회원 저장 (PostgreSQL)

로컬에서 Postgres 올리기 (프로젝트 루트):
```bash
docker compose up -d
```

`server/.env` 또는 환경변수에 예시:
```
DATABASE_URL=postgresql://oneai:oneai_dev_local@localhost:5432/oneai
```

스키마 반영:
```bash
cd server
npx prisma db push
```

Render 등 클라우드에서는 **PostgreSQL 애드온** 생성 후 `DATABASE_URL`만 넣으면 동일하게 동작합니다. 미설정 시 기존처럼 파일 저장소를 사용합니다.

## 준수 원칙
- 수익 보장 표현 금지
- 투자 참고용 정보 / AI 분석 기반 / 위험관리 중심 표현 유지
- 기존 기능 삭제 없이 누적 확장 방식 개발

## 확장 로드맵 (누적 확장)
- 1차: ONE AI 본체 + 시스템 트레이딩
  - 거래소 연동 준비: Binance, Bybit, Bitget, OKX
  - 레퍼럴 + 멤버십 기간 조건 기반 자동 실행 게이트
- 2차: 모의투자(Paper Trading) 모듈 추가 (가상자산, 거래 기록, 랭킹)
- 3차: 커뮤니티 모듈 추가 (전략 공유, 대회, 리그, 성과 보드)
- 4차: 실전/모의/커뮤니티 통합 리그로 확장

## 관리자 기본 정책
- 추천인(레퍼럴) 정책은 전 서비스 공통 기본 구성으로 유지
- 관리자에서 회원등급/레퍼럴 카운트/VIP 만료일을 항상 관리 가능해야 함
- 신규 모듈(거래소, 모의투자, 커뮤니티) 추가 시 동일한 회원/권한 체계 재사용

## 공개 마켓·스캔·글로벌 API (본문은 `{ ok: true, … }` 형태로 통일)
- `GET /api/market/summary` → `{ ok, summary }`
- `GET /api/signals` → `{ ok, signals }`
- `GET /api/news` → `{ ok, news }`
- `GET /api/system-trading/exchanges` → `{ ok, exchanges }`
- `GET /api/system-trading/eligibility` → `{ ok, eligible, reason, referralOk, membershipOk }`
- `GET /api/global-data/coverage` → `{ ok, …coverage 필드 }`
- `GET /api/scan/overview` → `{ ok, universeCount, fields, scanners }`
- `GET /api/scan/results?type=` → `{ ok, results }`

### 서버 스모크 테스트
`/health`(서비스명·`platformServiceId`·`apiVersion`·`serverPackageVersion`·`features`·`userStorage` 등), `/api/platform/meta`(위와 id/version/`serverPackageVersion` 일치), `/api/cms/public`, `/api/market/summary`, `/api/signals`, `/api/news`, `/api/scan/overview`, `/api/system-trading/exchanges`, `/api/system-trading/eligibility`, `/api/global-data/coverage`, `/api/research/strategy-scores`, `/api/research/strategy-policy`, `/api/scan/results?type=all`, `/api/payments/membership/catalog` (`{ ok, plans }`), 존재하지 않는 `/api/...` 경로의 **`404` + `NOT_FOUND`** 응답을 확인합니다. 호출 순서·세부 검증은 `server/scripts/smoke-api.js` 주석과 코드가 기준입니다.

GitHub에 푸시·PR 시 **`.github/workflows/smoke-api.yml`**으로 API 스모크(`server/**` 등 변경 시), **`.github/workflows/next-build.yml`**으로 `lint`·`typecheck`·`next build`(`app`·`components`·`lib`·`scripts`·`.eslintrc.json` 등 변경 시)가 실행됩니다. **수동 실행(`workflow_dispatch`)**은 경로와 무관하게 항상 해당 작업을 돌릴 수 있고, **동일 브랜치 중복 실행 취소(`concurrency`)**도 적용됩니다.

```bash
cd server
npm run smoke
# 원격: SMOKE_API_BASE=https://your-api.example.com npm run smoke
```

## 검색기 MVP
- 국내주식 검색기 MVP 스키마/규칙/API는 `docs/STOCK_SCANNER_MVP.md` 참고
- 초기에는 더미 데이터로 계산하고, 이후 실데이터 API로 provider만 교체

## 전략 성능 점수 API
- `GET /api/research/strategy-scores` → `{ ok: true, scores: [...] }` — 승률/손익비/최대낙폭 등 조합 점수
- `GET /api/research/strategy-policy` → `{ ok: true, policyConfig, evaluatedAt, results }` — 비활성화 후보 판정
- `POST /api/admin/strategies/action` → `{ ok: true, strategyId, action, note, actor, processedAt }` — 관리자 승인/재활성화 등
- `GET /api/admin/strategies/action-history` → `{ ok: true, entries: [...] }`

## 인증/회원 API (D1)
- `POST /api/auth/register`
  - email/password/nickname/referredBy로 회원가입
- `POST /api/auth/login`
  - 이메일 로그인, 토큰 발급
- `GET /api/auth/me`
  - Bearer 토큰 기반 내 정보 조회
- `POST /api/auth/refresh`
  - refresh token으로 access token 재발급(회전)
- `POST /api/auth/logout`
  - refresh token 폐기
- `GET /api/admin/users` (관리자 토큰 필요)
- `PATCH /api/admin/users/:id` (관리자 토큰 필요)
  - 회원등급/멤버십 타입/VIP 만료일 수정

## 관심종목 API (로그인 필요)
- `GET /api/me/watchlist`
- `PUT /api/me/watchlist` — 본문 `{ "items": [ { "symbol", "market", "note?" } ] }` 전체 치환
- `ONEAI_FEATURE_WATCHLIST=0` 이면 **API 403** 및 `/me` 관심종목 UI 미표시 (`/api/platform/meta`의 `features.watchlist`와 동일 규칙)
- 서버 환경변수 `ONEAI_WATCHLIST_MAX` — 최대 저장 개수 (기본 100)

## 프론트 환경변수
- `NEXT_PUBLIC_API_BASE_URL` (예: `http://localhost:4200`)
- `NEXT_PUBLIC_SITE_URL` (선택, 예: `https://your-domain.com`) — OG·canonical·`metadataBase`·`robots.txt`/`sitemap.xml`의 사이트 URL
- **Vercel:** `VERCEL_URL`이 자동 설정되며, `NEXT_PUBLIC_SITE_URL`이 없을 때 위 용도의 기본 원점으로 쓰인다.
- `NEXT_PUBLIC_ADMIN_TOKEN` (관리자 패널 API 호출용)

## API 오류 형식 (통일)
- 실패 시 가능한 한 `{ "ok": false, "code": "VALIDATION_ERROR" | "UNAUTHORIZED" | … , "message": "…" }` — 프론트는 `lib/oneai-api.ts`의 `oneaiErrorHint`로 표시.

## 공개 플랫폼 메타 (버전·기능 플래그)
- `GET /api/platform/meta` — `platformServiceId`, `apiVersion`, `features`(CMS·관심종목·AI로그·RBAC 사용 여부 등), `time`
- `/health` 응답에도 동일 `features` 포함
- 기능 끄기(선택): `ONEAI_FEATURE_CMS=0`, `ONEAI_FEATURE_WATCHLIST=0`, `ONEAI_FEATURE_AI_REC_LOG=0`
  - **CMS 끔:** `GET /api/cms/public`은 빈 블록만 반환; **`/api/admin/cms/*`는 403**
  - **AI 로그 끔:** 시그널 서빙 시 로그 미기록; **`GET /api/admin/ai-recommendation-logs`는 빈 배열**

## 서버 보안 환경변수
- `ONEAI_ADMIN_TOKEN` 최고관리자(super_admin) API 토큰 — 설정하지 않으면 로컬 기본값(`oneai-dev-admin-token`)이 사용되므로 **운영에서는 반드시 설정**
- **역할별 토큰 (선택)** — 설정 시 해당 토큰으로만 허용된 API만 호출 가능 (`GET /api/admin/session`으로 역할 확인)
  - `ONEAI_ADMIN_TOKEN_OPS` → 운영(ops_admin): 회원·전략·감사·AI 로그·CMS **조회**
  - `ONEAI_ADMIN_TOKEN_CS` → CS(cs_admin): 회원 조회/수정, 감사 로그 **조회**
  - `ONEAI_ADMIN_TOKEN_MARKETING` → 마케팅(marketing_admin): CMS **전체**, 감사 **조회**
  - `ONEAI_ADMIN_TOKEN_BILLING` → 정산(billing_admin): 감사 로그 **조회** (추후 정산 API 확장)
- `ONEAI_TOKEN_SECRET` 사용자 토큰 서명 키
- `ONEAI_TOKEN_EXPIRES_HOURS` 사용자 토큰 만료 시간(기본 12시간)
- `ONEAI_REFRESH_EXPIRES_DAYS` refresh token 만료 일수(기본 14일)

## 통합 플랫폼·배포 식별 (선택)
- `ONEAI_PLATFORM_SERVICE_ID` 헬스 등에서 노출되는 서비스 식별자(기본 `oneai-core`). 여러 배포가 있을 때 구분용.
- `ONEAI_API_VERSION` 공개 API 호환 버전 문자열(기본 `1`).

## 관리자 세션·감사로그 API
- `GET /api/admin/session` — `{ ok: true, role, actor }`
- `GET /api/admin/users` — `{ ok: true, users: [...] }` (역할별 토큰은 PLATFORM_ARCHITECTURE 참고)
- `GET /api/admin/strategies/action-history` — `{ ok: true, entries: [...] }`
- `GET /api/admin/audit-logs` — `{ ok: true, logs: [...] }` (최대 200건)

## AI·시그널 서빙 로그
- 공개 `GET /api/signals`가 **캐시를 새로 채울 때마다** 요약 로그가 남습니다(건수·심볼 목록 등). 본문 전체는 저장하지 않습니다.
- `ONEAI_SIGNAL_MODEL_VERSION` — 로그에 표시할 모델/버전 라벨(선택).
- `GET /api/admin/ai-recommendation-logs?limit=100` (관리자) — 최근 로그 조회. DB 모드: `AiRecommendationLog` 테이블(`prisma db push`).

## 운영 콘텐츠 (CMS) API
- `GET /api/cms/public` — 게시된 배너·큐레이션 기사·추천 종목·이벤트(인증 불필요)
- `GET /api/admin/cms/items?kind=` (관리자)
- `POST /api/admin/cms/items` — JSON: `kind`(banner|curated_article|featured_pick|event), `title`, `subtitle`, `body`, `linkUrl`, `badge`, `published`, `sortOrder`, 날짜 필드 등
- `PATCH /api/admin/cms/items/:id`
- `DELETE /api/admin/cms/items/:id`
- 파일 모드: `server/data/cms-content.json` (미존재 시 최초 요청에서 시드). DB 모드: `SiteContent` 테이블(`npx prisma db push`).

## 공개 조회 캐시 (선택)
- `ONEAI_PUBLIC_CACHE_TTL_MS` — `/api/market/summary`, `/api/signals`, `/api/news` 인메모리 캐시 TTL(ms). 기본 15000.

## 탈중앙화 지갑 결제 기반 멤버십 연장 (MVP)
- `GET /api/payments/membership/catalog` → `{ ok, plans: [{ planCode, days, amountUsdt }] }` (공개, 입금 주소 없음)
- `POST /api/payments/wallet/connect` (로그인 필요)
  - 사용자 지갑 주소를 계정에 연결
- `GET /api/payments/membership/quote?planCode=vip_30d` (로그인 필요)
  - 결제 금액/기간/입금 주소 조회
- `POST /api/payments/membership/webhook`
  - 온체인 결제 확인 웹훅(트랜잭션/컨펌/금액 검증 후 자동 연장)

### 결제 플로우
1. 사용자가 지갑 연결
2. 플랜 금액을 조회 후 지정 입금 주소로 송금
3. 체인 인덱서/웹훅이 결제 확인 API 호출
4. 검증 통과 시 VIP 멤버십 자동 연장

### 주의
- 현재는 웹훅 기반 MVP이며, 실제 서비스에서는 체인 인덱서(예: Alchemy, Moralis, 자체 노드)와 서명 검증을 추가하세요.

## 고지 문구
본 서비스는 투자정보 및 참고용 분석 데이터를 제공하는 플랫폼이며, 투자 결과를 보장하지 않습니다.
모든 투자 판단과 책임은 이용자 본인에게 있습니다.
