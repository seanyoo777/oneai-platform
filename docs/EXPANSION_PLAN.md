# OneAI 확장 아키텍처 메모

## 목표
거래소 완성 후 모의투자와 커뮤니티를 연결하여, 연습/경기/수익률 기반 재미 요소까지 확장 가능한 구조를 유지한다.

## 모듈 순서
1. Exchange Core
   - 주문, 체결, 포지션, 지갑, 리스크 한도
2. Paper Trading
   - 가상 잔고, 동일 전략 엔진 재사용, 성과 기록
3. Community
   - 전략 공유, 리그, 챌린지, 리더보드
4. Unified Profile
   - 실전/모의/커뮤니티 활동 통합 사용자 지표

## 공통 설계 원칙
- 기존 기능 삭제 없이 누적 확장
- 서비스 레이어 분리 (UI / API / Provider)
- 전략 엔진 재사용 (실전/모의 동일 규칙)
- 랭킹 산정 시 위험조정 성과 지표 동시 사용
- 수익 보장 표현 금지

## 관리자 기본 정책 (필수)
- 레퍼럴 기능은 전체 사이트 기본 기능으로 상시 유지
- 회원 등급, 추천인 카운트, VIP 만료일, 대회 참여 권한을 관리자에서 관리
- 리그/커뮤니티 보상 정책 변경 이력 저장

## 차기 DB 후보 테이블
- exchange_orders
- exchange_fills
- paper_accounts
- paper_orders
- leaderboard_snapshots
- community_posts
- challenge_events
- challenge_entries
