# 외부 데이터·연동 참고 (OneAI)

소스 레이어는 `server/src/sources/`에서 어댑터로 교체·확장합니다. **실패 시 기존 더미로 폴백**하는 패턴을 유지합니다.

## 활성화 가능한 연동

### CoinGecko (암호화폐 스팟 가격)

| 항목 | 내용 |
|------|------|
| 용도 | `GET /api/market/summary`의 **BTC·ETH** 행에 USD 기준 시세·24h 변동률 병합 |
| 문서 | [CoinGecko API](https://docs.coingecko.com/reference/simple-price) |
| 인증 | 공개 엔드포인트는 API 키 없이 사용 가능 (호출 한도·레이트 리밋 준수) |
| 환경 변수 | `ONEAI_COINGECKO=1` 또는 `true` 로 켬. 미설정·`0`이면 더미만 사용 |

선택:

- `ONEAI_COINGECKO_TIMEOUT_MS` — 요청 타임아웃(ms), 기본 `8000`.

구현: `server/src/sources/coingecko.js`, 조합: `server/src/sources/index.js`.

### Finnhub (미국 시장 — NASDAQ 요약 행)

| 항목 | 내용 |
|------|------|
| 용도 | `GET /api/market/summary`의 **NASDAQ** 행에 심볼 **현재가·전일대비 %** 병합 (지수·ETF 프록시) |
| 문서 | [Finnhub Quote](https://finnhub.io/docs/api/quote) |
| 인증 | [무료 API 키](https://finnhub.io/register) — `FINNHUB_API_KEY`에만 설정 (미설정 시 더미) |
| 심볼 | `ONEAI_FINNHUB_SYMBOL` 기본 `QQQ` (나스닥 100 ETF). `SPY` 등으로 변경 가능 |

선택: `ONEAI_FINNHUB_TIMEOUT_MS` (기본 `8000`).

구현: `server/src/sources/finnhub.js`.

### Finnhub 시장 뉴스 (`/api/news`)

| 항목 | 내용 |
|------|------|
| 용도 | `GET /api/news` 본문을 Finnhub **general**(등) 카테고리 헤드라인으로 대체 |
| 문서 | [Market news](https://finnhub.io/docs/api/market-news) |
| 조건 | `FINNHUB_API_KEY` + **`ONEAI_FINNHUB_NEWS=1`** 동시 설정 |

선택: `ONEAI_FINNHUB_NEWS_CATEGORY`(기본 `general`), `ONEAI_FINNHUB_NEWS_LIMIT`, `ONEAI_FINNHUB_NEWS_TIMEOUT_MS`.

구현: `server/src/sources/finnhub-news.js`, 조합: `server/src/sources/index.js`.

### 플랫폼 메타·헬스 (`integrations`)

`/health` 및 `GET /api/platform/meta`에 **`integrations`** 객체가 포함됩니다 (키 미노출, 켜짐 여부만).

| 필드 | 의미 |
|------|------|
| `coingecko` | `ONEAI_COINGECKO` 활성 |
| `finnhubQuote` | `FINNHUB_API_KEY` 설정됨 |
| `finnhubNews` | 키 있음 + `ONEAI_FINNHUB_NEWS` 활성 |
| `yahooKospi` | `ONEAI_YAHOO_KOSPI` 활성 |

프론트에서는 **`IntegrationStrip`** (`components/integration-strip.tsx`)가 홈·Market·News·Signal·Global Data·Research·Scan·Membership·Exchange·시스템 트레이딩 등 페이지 상단에서 동일 필드를 Crypto·KOSPI·US·News 칩으로 표시합니다.

### Yahoo Finance Chart — KOSPI (^KS11)

| 항목 | 내용 |
|------|------|
| 용도 | `GET /api/market/summary`의 **KOSPI** 행에 **현재가·전일 대비 %** 병합 (`regularMarketPrice` / `chartPreviousClose`) |
| 비고 | **비공식** 공개 엔드포인트 — 레이아웃·차단 정책 변경 가능. 배포 환경(IP)에 따라 실패할 수 있음 |
| 인증 | 불필요 · `User-Agent` 헤더 전송 |
| 환경 변수 | `ONEAI_YAHOO_KOSPI=1` 로 켬 |

선택:

- `ONEAI_YAHOO_SYMBOL` — 차트 경로용 인코딩 심볼, 기본 `%5EKS11` (^KS11).
- `ONEAI_YAHOO_TIMEOUT_MS` (기본 `10000`).
- `ONEAI_YAHOO_USER_AGENT` — 기본 브라우저형 문자열.

구현: `server/src/sources/yahoo-kospi.js`.

## 로드맵·키 발급 후 연결 예정

아래는 스키마·커넥터 개념만 문서화합니다. 실제 키는 서버 환경변수만 사용하고 저장소에 넣지 마세요.

| 영역 | 후보 프로바이더 | 비고 |
|------|-----------------|------|
| 미국 주식 (심볼 확장) | Polygon.io, Alpha Vantage | 다종목·심층 시세 |
| 국내 주식·체결급 시세 | 증권사 Open API (예: 한국투자증권 KIS) | 실시간·주문 연동 시 필수 |
| 매크로·캘린더 | Economic Calendar API 등 | 이벤트 리스크 맵 |
| 뉴스 | NewsAPI, RSS 집계 | 토큰 비용·저작권 |

거래소 커넥터 개념은 `server/src/connectors.js` 및 `GET /api/system-trading/exchanges`.

## 운영 체크리스트

1. 새 프로바이더 추가 시 **별도 모듈** + `sources/index.js`에서만 조합.
2. 공개 API는 **캐시** (`ONEAI_PUBLIC_CACHE_TTL_MS`)와 타임아웃으로 보호.
3. 응답 형식 `{ ok, ... }` 및 프론트 `lib/oneai-api.ts` 규약 유지.
