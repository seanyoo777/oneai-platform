# Agent instructions — OneAI / 원에이아이

이 저장소에서 코드·설계 작업 시 **아래 순서로 기준을 적용**한다.

## 1. 필수 참조

- **전체 원칙(상세):** [`docs/PRINCIPLES.md`](docs/PRINCIPLES.md) — 플랫폼 전용 10항 + 통합 생태계 공통 10항의 단일 소스.
- **통합 플랫폼 구조:** [`docs/PLATFORM_ARCHITECTURE.md`](docs/PLATFORM_ARCHITECTURE.md) — Identity 커널, 경계 컨텍스트, 헬스 메타, `lib/oneai-api` 진입점.
- **기능·변경 타임라인:** [`docs/CHANGELOG.md`](docs/CHANGELOG.md)
- **Cursor 규칙:** `.cursor/rules/oneai-principles.mdc` (`alwaysApply`) — 요약 및 세션 단위 상기용.

`docs/PRINCIPLES.md`와 충돌하면 **문서를 우선**하고, 규칙 파일은 문서에 맞게 갱신한다.

## 2. 요약 (구현 시 빠른 체크)

- 데이터: **소스 분리**, 장애 시 **fallback**; AI 추천은 **로그**.
- 서버: **금액·정산은 서버만** 신뢰; API **응답·에러코드·인증** 통일.
- 제품: **모바일 우선 UI**; **모의 vs 실거래** 데이터 분리; 관심종목·캐싱·검색 고려.
- 조직/운영: 통합 **`user_id`**·레퍼럴 확장; 관리자 **RBAC**; **공통 로그** 유형.
- 변경: **기존 기능 삭제 금지**; 추가 전 회귀·스모크; 마일스톤마다 **테스트 리포트**.

## 3. 코드 탐색 힌트

- 백엔드 진입: `server/src/index.js`, 라우트 조합 `server/src/router.js`, 도메인별 등록 `server/src/routes/*.js`
- 플랫폼 메타: `GET /api/platform/meta` · 관리자 RBAC: `server/src/admin-auth.js`
- 프론트 API 호출: 우선 [`lib/oneai-api.ts`](lib/oneai-api.ts) (`oneaiFetch`)로 통일
- 데이터 소스 레이어: `server/src/sources` 등 기존 패턴 유지·확장
- 회원·감사: `server/src/user-store*.js`, audit/action 관련 store — 같은 패턴으로 확장

배포·스모크는 `docs/PRINCIPLES.md` 운영 절과 README를 따른다.
