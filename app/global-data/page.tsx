import { Card } from "@/components/card";

const datasets = [
  "미국 주식: 전체 종목 시세/재무/뉴스 메타",
  "한국 주식: 전체 종목 시세/수급/공시 메타",
  "글로벌 지수/원자재/환율/암호화폐 지표",
  "경제지표 캘린더 + 이벤트 리스크 맵"
];

export default function GlobalDataPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Global Data</h1>
      <Card title="글로벌 데이터 확장 로드맵" description="미국/한국 전체 시장 데이터 확장 준비">
        <ul className="space-y-2 text-sm text-slate-300">
          {datasets.map((data) => (
            <li key={data} className="rounded-md bg-slate-900 p-3">
              {data}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
