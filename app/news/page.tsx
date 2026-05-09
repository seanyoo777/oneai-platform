import { Card } from "@/components/card";
import { news } from "@/lib/dummy-data";

export default function NewsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">OneAI News</h1>
      <Card title="AI 뉴스 분석 센터">
        <ul className="space-y-3">
          {news.map((item) => (
            <li key={item.id} className="rounded-md bg-slate-900 p-3">
              <p className="text-xs text-slate-400">{item.category}</p>
              <p className="font-medium">{item.title}</p>
              <p className="text-sm text-slate-300">{item.summary}</p>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
