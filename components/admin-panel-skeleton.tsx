/** dynamic() 로딩 폴백 — 가벼운 플레이스홀더 */
export function AdminPanelSkeleton({ label }: { label: string }) {
  return (
    <div className="animate-pulse rounded-lg border border-slate-800 bg-slate-900/40 p-6">
      <p className="text-sm text-slate-500">{label} 불러오는 중…</p>
    </div>
  );
}
