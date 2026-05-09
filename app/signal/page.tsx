import { Card } from "@/components/card";
import { signals } from "@/lib/dummy-data";

export default function SignalPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">OneAI Signal</h1>
      <p className="text-sm text-slate-300">투자 참고용 정보로 제공되는 AI 분석 기반 시그널</p>
      <Card title="실시간 시그널">
        <div className="space-y-2">
          {signals.map((signal) => (
            <div key={signal.id} className="rounded-md bg-slate-900 p-3 text-sm">
              <p className="font-medium">{signal.symbol}</p>
              <p className="text-slate-300">
                방향: {signal.direction} / 진입가: {signal.entryPrice} / 손절가: {signal.stopLoss} / 목표가:{" "}
                {signal.targetPrice}
              </p>
              <p className="text-slate-400">{signal.reason}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
