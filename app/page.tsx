import { Card } from "@/components/card";
import { marketSummary, news, signals } from "@/lib/dummy-data";

export default function HomePage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">OneAI 홈</h1>
        <p className="mt-2 text-slate-300">AI 분석 기반 통합 투자정보 플랫폼 MVP 대시보드</p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card title="오늘의 시장 요약">
          <ul className="space-y-1 text-sm text-slate-300">
            {marketSummary.map((m) => (
              <li key={m.name} className="flex justify-between">
                <span>{m.name}</span>
                <span>{m.value}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card title="AI 시장 브리핑" description="위험관리 중심 분석">
          <p className="text-sm text-slate-300">
            이벤트 리스크는 중간 수준입니다. 변동성이 높아 손절 기준과 포지션 크기 제한이 권장됩니다.
          </p>
        </Card>
        <Card title="실시간 HOT 종목" description="참고용 시그널">
          <ul className="space-y-2 text-sm">
            {signals.map((s) => (
              <li key={s.id} className="rounded-md bg-slate-900 p-2">
                {s.symbol} · {s.strategyName} · 강도 {s.confidenceScore}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="중요 뉴스">
          <ul className="space-y-2 text-sm text-slate-300">
            {news.map((n) => (
              <li key={n.id}>
                <p className="font-medium text-white">{n.title}</p>
                <p>{n.summary}</p>
              </li>
            ))}
          </ul>
        </Card>
        <Card title="멤버십 안내" description="무료 / 레퍼럴 / VIP">
          <p className="text-sm text-slate-300">
            무료회원은 기본 뉴스와 일부 시그널이 제공되며, VIP회원은 실시간 전체 시그널과 전략 연구소를 이용할 수
            있습니다.
          </p>
        </Card>
      </div>
    </div>
  );
}
