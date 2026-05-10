import type { Metadata } from "next";
import { Card } from "@/components/card";
import { AdminDeferredPanels } from "@/components/admin-deferred-panels";
import { IntegrationStrip } from "@/components/integration-strip";
import { PageHero } from "@/components/page-hero";
import { AdminRoleHint } from "@/components/admin-role-hint";
import { AdminUsersPanel } from "@/components/admin-users-panel";

export const metadata: Metadata = {
  title: "관리자",
  description: "회원·CMS·전략·AI 로그 등 운영 콘솔."
};

const adminMenus = [
  "대시보드",
  "회원 관리",
  "멤버십 관리",
  "추천인 관리 (기본 상시 운영)",
  "시그널 관리",
  "뉴스 관리",
  "종목 추천 관리",
  "전략 관리",
  "푸시 알림 관리",
  "통계"
];

export default function AdminPage() {
  const strategyPolicyRules = [
    "통합 점수 45점 미만: 자동 비활성화 후보",
    "최대낙폭 15% 초과: 자동 비활성화 후보",
    "표본 수 80건 미만: 관리자 검토 대기"
  ];

  return (
    <section className="space-y-6" aria-labelledby="admin-page-title">
      <IntegrationStrip heading="Admin · live feeds" />
      <PageHero titleId="admin-page-title" title="관리자" description="회원·CMS·전략·AI 로그 등 운영 콘솔">
        <AdminRoleHint />
      </PageHero>
      <Card title="관리자 메뉴">
        <ul className="grid gap-2 md:grid-cols-2">
          {adminMenus.map((menu) => (
            <li key={menu} className="rounded-lg border border-slate-700/50 bg-slate-900/70 p-3 text-sm shadow-inner shadow-black/15">
              {menu}
            </li>
          ))}
        </ul>
      </Card>
      <Card title="기본 운영 원칙">
        <ul className="space-y-1 text-sm text-slate-300">
          <li>레퍼럴 시스템은 모든 서비스에서 기본 기능으로 유지</li>
          <li>회원 등급, 추천인 카운트, VIP 만료일을 관리자에서 일괄 관리</li>
          <li>거래소/모의투자/커뮤니티 확장 시에도 동일한 권한 정책을 재사용</li>
        </ul>
      </Card>
      <Card title="전략 자동 비활성화 정책">
        <ul className="space-y-1 text-sm text-slate-300">
          {strategyPolicyRules.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ul>
      </Card>

      <p className="text-xs text-slate-500">
        아래 &quot;회원 관리&quot;만 첫 화면에서 바로 불러옵니다. 나머지 패널은 스크롤 시 로드되어 Render/Vercel 콜드 구간의 동시 요청을 줄입니다.
      </p>

      <AdminUsersPanel />

      <AdminDeferredPanels />
    </section>
  );
}
