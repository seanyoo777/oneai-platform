import { Card } from "@/components/card";
import { marketSummary } from "@/lib/dummy-data";

export default function MarketPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">OneAI Market</h1>
      <p className="text-sm text-slate-300">시장 대시보드와 AI 브리핑 (더미 데이터 기반)</p>
      <Card title="시장 지표">
        <div className="grid gap-2 md:grid-cols-2">
          {marketSummary.map((item) => (
            <div key={item.name} className="rounded-md bg-slate-900 p-3 text-sm">
              <p className="text-slate-400">{item.name}</p>
              <p className="font-semibold">{item.value}</p>
              <p className="text-blue-400">{item.change}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
