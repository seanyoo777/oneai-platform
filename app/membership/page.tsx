import { Card } from "@/components/card";

export default function MembershipPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">멤버십</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <Card title="무료회원">
          <p className="text-sm text-slate-300">기본 뉴스, 일부 시그널, 기본 차트, 제한된 검색 제공</p>
        </Card>
        <Card title="레퍼럴회원">
          <p className="text-sm text-slate-300">추천 가입 수에 따라 무료 기능 확대, 검색 사용량 증가</p>
        </Card>
        <Card title="VIP회원">
          <p className="text-sm text-slate-300">실시간 전체 시그널, AI 분석, 백테스트, 알림, VIP 리포트</p>
        </Card>
      </div>
    </div>
  );
}
