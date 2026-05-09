# OneAI / 원에이아이 MVP

모든 시장을 하나의 AI로.

## 개요
- OneAI는 코인/국내주식/미국주식/선물/뉴스/시그널/전략 연구를 통합한 AI 기반 투자정보 플랫폼입니다.
- 본 MVP는 더미 데이터 기반으로 동작하며, 추후 실제 API 연동이 쉽도록 데이터 수집 레이어를 분리했습니다.

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

## 검색기 MVP
- 국내주식 검색기 MVP 스키마/규칙/API는 `docs/STOCK_SCANNER_MVP.md` 참고
- 초기에는 더미 데이터로 계산하고, 이후 실데이터 API로 provider만 교체

## 전략 성능 점수 API
- `GET /api/research/strategy-scores`
- 승률/손익비/최대낙폭/기대값/표본 수를 조합해 전략 점수를 계산
- `GET /api/research/strategy-policy`
  - 기준 미달 전략 자동 비활성화 후보 판정
- `POST /api/admin/strategies/action`
  - 관리자 승인/보류/재활성화 처리
- `GET /api/admin/strategies/action-history`
  - 최근 관리자 전략 액션 이력 조회

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

## 프론트 환경변수
- `NEXT_PUBLIC_API_BASE_URL` (예: `http://localhost:4000`)
- `NEXT_PUBLIC_ADMIN_TOKEN` (관리자 패널 API 호출용)

## 서버 보안 환경변수
- `ONEAI_ADMIN_TOKEN` 관리자 API 토큰
- `ONEAI_TOKEN_SECRET` 사용자 토큰 서명 키
- `ONEAI_TOKEN_EXPIRES_HOURS` 사용자 토큰 만료 시간(기본 12시간)
- `ONEAI_REFRESH_EXPIRES_DAYS` refresh token 만료 일수(기본 14일)

## 관리자 감사로그 API
- `GET /api/admin/audit-logs` (관리자 토큰 필요)
  - 관리자 액션 이력(회원수정/전략액션)을 조회

## 탈중앙화 지갑 결제 기반 멤버십 연장 (MVP)
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
