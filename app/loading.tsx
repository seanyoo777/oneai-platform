export default function Loading() {
  return (
    <div
      className="flex min-h-[40vh] flex-col items-center justify-center gap-4 py-16"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div
        className="h-10 w-10 animate-spin rounded-full border-2 border-slate-600 border-t-emerald-400"
        aria-hidden
      />
      <p className="text-sm text-slate-400">불러오는 중…</p>
    </div>
  );
}
