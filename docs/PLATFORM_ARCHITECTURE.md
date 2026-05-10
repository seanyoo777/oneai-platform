# OneAI 통합 플랫폼 아키텍처 가이드

이 레포는 **단일 MVP 배포물**이지만, 설계 목표는 **여러 저장소·배포 단위로 나뉜 뒤에도 하나의 생태계처럼 동작**하는 것이다. “프로젝트별로 따로 노는 코드”가 되지 않도록 아래 축을 지킨다.

---

## 1. 정체성 커널 (Identity Kernel)

- **전역 사용자 ID**: `User.id`(UUID)는 모든 서비스에서 동일한 사람을 가리키는 **유일한 상관관계 키**다. 신규 기능은 다른 사용자 테이블을 만들지 않고 이 ID를 참조한다.
- **인증 토큰**: 현재는 자체 JWT 형태의 액세스 토큰 + 리프레시 토큰. 향후 중앙 발급(OIDC/공통 Auth 서비스)으로 바꿔도 **클레임의 `sub` = 동일 user_id**를 유지한다.
- **레퍼럴**: `referralCode` / `referredBy` 필드로 확장 가능한 구조를 이미 사용 중이며, 다른 제품 라인에서도 동일 필드명·의미를 재사용한다.

---

## 2. 경계 컨텍스트 (Bounded contexts — 논리 모듈)

코드는 **도메인별 라우트 등록 모듈**(`server/src/routes/*.js`)로 나뉜다. 물리적으로는 한 프로세스여도, 다음 분리를 전제로 책임을 나눈다.

| 컨텍스트 | 책임 | 예시 경로 |
|----------|------|-----------|
| **identity** | 회원·세션·토큰 | `/api/auth/*` |
| **profile** | 사용자별 설정(관심종목 등) | `/api/me/*` |
| **billing** | 결제·멤버십·지갑 연결 | `/api/payments/*` |
| **market-data** | 시세·뉴스·시그널·스캔·글로벌 데이터 | `/api/market`, `/api/news`, … |
| **research** | 전략·정책 점수 등 분석 산출물 | `/api/research/*` |
| **system-trading** | 거래소 커넥터·자격 | `/api/system-trading/*` |
| **admin** | 운영·감사 | `/api/admin/*` |
| **cms** | 공개 배너·기사·추천·이벤트 (저장은 파일 또는 DB) | `GET /api/cms/public`, `GET/POST/PATCH/DELETE /api/admin/cms/…` |

**billing 요약:** 공개 `GET /api/payments/membership/catalog`(플랜·금액만), 로그인 `GET /api/payments/membership/quote`·`POST /api/payments/wallet/connect`, 웹훅 `POST /api/payments/membership/webhook`. 입금 주소·정산은 서버 단일 진실.

나중에 서비스로 쪼갤 때는 **경로 prefix 또는 게이트웨이 라우팅**으로 그대로 옮긴다. 공개 조회 부하는 **`ONEAI_PUBLIC_CACHE_TTL_MS`**로 일부 마켓 데이터 경로에 인메모리 TTL 캐시를 적용할 수 있다.

### 관리자 RBAC (요약)

| 역할 | 회원 R/W | 전략 액션 | 감사 조회 | AI 서빙 로그 | CMS |
|------|-----------|-----------|-----------|----------------|-----|
| super_admin (`ONEAI_ADMIN_TOKEN`) | 예 | 예 | 예 | 예 | 전체 |
| ops_admin | 예 | 예 | 예 | 예 | 조회만 |
| cs_admin | 예 | 아니오 | 예 | 아니오 | 아니오 |
| marketing_admin | 아니오 | 아니오 | 예 | 아니오 | 전체 |
| billing_admin | 아니오 | 아니오 | 예 | 아니오 | 아니오 |

클라이언트는 **`GET /api/platform/meta`** 로 기능 플래그·버전을 맞춘다.

---

## 3. 데이터·소스 어댑터

- **수집 계층**은 `sources`, `connectors`, `stock-scan` 등 **어댑터 패턴**으로 유지한다. 외부 API 장애 시 대체 소스는 동일 인터페이스 뒤에서 교체한다.
- **금액·정산**은 항상 서버에서만 확정한다 (프론트 표시용 숫자는 신뢰하지 않음).

---

## 4. 관측 가능성·감사

- **AuditLog / StrategyAction** 등 기존 저장 패턴을 재사용한다.
- **AI·시그널 서빙**은 `AiRecommendationLog`(또는 파일 `server/data/ai-recommendation-logs.json`)에 요약만 남긴다 — 전문 본문 저장 지양.
- 로그 이벤트 타입·actor·target은 **통합 로그 파이프**(향후 중앙 수집)로 보낼 수 있게 문자열 식별자를 일관되게 쓴다.

---

## 5. 배포 단위 식별

- **`ONEAI_PLATFORM_SERVICE_ID`**: 기본 `oneai-core`. 다른 바륨(예: 결제 워커 전용)을 두면 헬스·메타로 구분한다.
- **`ONEAI_API_VERSION`**: 공개 API 호환 단위 (문서·클라이언트와 함께 버전업).

`/health` 응답에 `platformServiceId`, `apiVersion`, `serverPackageVersion` 등이 포함되면, 통합 모니터링에서 서비스를 구분하기 쉽다.

---

## 6. 클라이언트

- 프론트는 **`lib/oneai-api.ts`** 한 진입점으로 API 베이스 URL·인증 헤더를 통일한다. 향후 여러 호스트(마켓 데이터 전용 등)로 나뉘어도 프록시/환경변수만 바꾼다.
- 로컬 개발 시 기본 베이스는 **`http://localhost:4200`** (`NEXT_PUBLIC_API_BASE_URL`) — 동일 머신에서 TetherGet(4000)·TGX(4100) 등과 포트 충돌을 피하기 위함이다.

---

## 7. 금지·주의

- 동일 목적의 **중복 User 테이블 / 중복 로그인 구현** 금지.
- 기존 공개 경로·동작을 깨는 대규모 리네임은 **버전드 API** 또는 호환 기간을 두고 진행한다 (`기존 기능 삭제 금지` 원칙).

---

## 참고

- 상위 원칙: [`docs/PRINCIPLES.md`](PRINCIPLES.md)
