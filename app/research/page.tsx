import { Card } from "@/components/card";
import { strategies } from "@/lib/dummy-data";

export default function ResearchPage() {
  const scored = strategies
    .map((strategy) => {
      const win = strategy.winRate;
      const mddPenalty = Math.max(0, 100 - Math.abs(strategy.maxDrawdown) * 5);
      const returnScore = Math.max(0, Math.min(100, strategy.avgReturn * 20));
      const total = win * 0.5 + mddPenalty * 0.3 + returnScore * 0.2;
      return { ...strategy, total: Number(total.toFixed(2)) };
    })
    .sort((a, b) => b.total - a.total);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">OneAI Research</h1>
      <Card title="전략 연구소" description="백테스트/리스크 분석 (더미)">
        <div className="space-y-2">
          {scored.map((strategy) => (
            <div key={strategy.id} className="rounded-md bg-slate-900 p-3 text-sm">
              <p className="font-medium">{strategy.name}</p>
              <p className="text-slate-300">
                승률 {strategy.winRate}% / 평균 수익률 {strategy.avgReturn}% / 최대 손실 {strategy.maxDrawdown}%
              </p>
              <p className="text-blue-300">통합 점수: {strategy.total}</p>
            </div>
          ))}
        </div>
      </Card>
      <Card title="평가 원칙" description="승률 단독이 아닌 위험조정 성과 기반">
        <p className="text-sm text-slate-300">
          승률, 평균 수익률, 최대 손실을 함께 반영해 전략 순위를 계산합니다. 투자 참고용 정보이며 수익을 보장하지
          않습니다.
        </p>
      </Card>
    </div>
  );
}
