# 국내주식 검색기 MVP 설계

## 목적
국내주식 종목 발굴 검색기를 더미 데이터 기반으로 먼저 구현하고, 이후 실제 API(KIS/키움/하나 등)로 교체 가능한 구조를 제공한다.

## 최소 데이터 스키마
- symbol: 종목코드
- name: 종목명
- price: 현재가
- changeRate: 등락률(%)
- volume: 현재 거래량
- avg20Volume: 20일 평균 거래량
- high20: 20일 고가
- instNetBuy: 기관 순매수
- foreignNetBuy: 외국인 순매수
- turnoverRate: 거래회전율
- newsScore: 뉴스 점수(0-100)
- themeScore: 테마 점수(0-100)
- closeSeries: 최근 종가 시계열(RSI 계산용)

## 검색기 규칙 (MVP)
- volume_surge: volume / avg20Volume >= 2.0
- breakout: price > high20
- rsi_reversal: RSI(14) <= 35
- flow_strength: 기관/외국인 순매수 동시 양수
- news_momentum: newsScore >= 75
- theme_strength: themeScore >= 70
- unusual_flow: volumeMultiple >= 2.5 and turnoverRate >= 8

## API
- GET /api/scan/overview
  - 스캐너 목록, 필드 목록, 유니버스 수 반환
- GET /api/scan/results?type=all
  - 전체 스캔 결과 반환
- GET /api/scan/results?type=breakout
  - 특정 검색기 결과만 반환

## 주의
- 검색 결과는 투자 참고용 정보이며, 수익을 보장하지 않는다.
- 실서비스 전 데이터 라이선스 및 실시간 표시 권한 검토가 필요하다.
