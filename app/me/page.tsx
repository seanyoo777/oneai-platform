import { Card } from "@/components/card";
import { users } from "@/lib/dummy-data";
import { AuthPanel } from "@/components/auth-panel";

export default function MePage() {
  const me = users[0];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">내 정보</h1>
      <AuthPanel />
      <Card title={me.nickname} description={me.email}>
        <ul className="space-y-1 text-sm text-slate-300">
          <li>가입일자: {me.createdAt}</li>
          <li>내 추천코드: {me.referralCode}</li>
          <li>회원등급: {me.role}</li>
          <li>멤버십 상태: {me.membershipType}</li>
          <li>멤버십 만료일: {me.membershipExpiresAt ?? "없음"}</li>
        </ul>
      </Card>
    </div>
  );
}
