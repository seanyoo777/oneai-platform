import type { Metadata } from "next";
import { Card } from "@/components/card";
import { AuthPanel } from "@/components/auth-panel";
import { IntegrationStrip } from "@/components/integration-strip";
import { PageHero } from "@/components/page-hero";

export const metadata: Metadata = {
  title: "폼 미리보기",
  description: "회원가입·로그인·내 정보 조회 폼을 한 페이지에서 테스트합니다.",
  robots: { index: false, follow: false }
};

export default function AuthPreviewPage() {
  return (
    <section className="space-y-6" aria-labelledby="preview-auth-title">
      <IntegrationStrip heading="Preview · live feeds" />
      <PageHero
        titleId="preview-auth-title"
        eyebrow="Preview"
        title="로그인/회원가입 폼 미리보기"
        description="회원가입·로그인·내 정보 조회 폼을 한 페이지에서 테스트합니다."
      />
      <Card title="미리보기 안내">
        <ul className="space-y-1 text-sm text-slate-300">
          <li>회원가입, 로그인, 내 정보 조회 동작을 한 페이지에서 테스트할 수 있습니다.</li>
          <li>
            서버가 실행 중이어야 하며,{" "}
            <code className="rounded bg-slate-900 px-1.5 py-0.5 font-mono text-xs text-emerald-300/90">
              NEXT_PUBLIC_API_BASE_URL
            </code>{" "}
            값이 올바르게 설정되어야 합니다.
          </li>
          <li>이 페이지는 디자인/UX 점검용으로 반복 테스트에 사용할 수 있습니다.</li>
        </ul>
      </Card>
      <AuthPanel />
    </section>
  );
}
