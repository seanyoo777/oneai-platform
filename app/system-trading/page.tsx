import { Card } from "@/components/card";

const exchanges = ["Binance", "Bybit", "Bitget", "OKX"];

const capabilities = [
  "거래소별 API Key 연결 관리",
  "전략별 자동 실행 ON/OFF",
  "레퍼럴 + 멤버십 기간 기반 사용 권한",
  "위험관리 중심 주문 제한(최대 포지션/손절 필수)",
  "실행 이력/오류 로그/재시도 큐"
];

export default function SystemTradingPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">시스템 트레이딩</h1>
      <Card title="1차 개발 범위" description="실거래 연동 준비형 자동매매 운영 콘솔">
        <ul className="space-y-2 text-sm text-slate-300">
          {capabilities.map((item) => (
            <li key={item} className="rounded-md bg-slate-900 p-3">
              {item}
            </li>
          ))}
        </ul>
      </Card>
      <Card title="지원 거래소" description="공용 커넥터 인터페이스로 관리">
        <div className="grid gap-2 md:grid-cols-4">
          {exchanges.map((name) => (
            <div key={name} className="rounded-md bg-slate-900 p-3 text-center text-sm">
              {name}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
