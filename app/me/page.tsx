import { AuthPanel } from "@/components/auth-panel";

export default function MePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">내 정보</h1>
      <AuthPanel />
    </div>
  );
}
