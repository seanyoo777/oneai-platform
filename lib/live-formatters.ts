/** 공개 API 시세 행 표시용 — 서버는 숫자·문자 혼용 가능 */
export type SummaryRow = { name: string; value?: unknown; change?: unknown };

export function fmtLiveValue(v: unknown): string {
  if (typeof v === "number") {
    if (Math.abs(v) >= 1000) return v.toLocaleString("ko-KR", { maximumFractionDigits: 2 });
    return v.toLocaleString("ko-KR", { maximumFractionDigits: 4 });
  }
  if (v === null || v === undefined) return "—";
  return String(v);
}

export function fmtLiveChange(c: unknown): string {
  if (typeof c === "number") {
    const sign = c >= 0 ? "+" : "";
    return `${sign}${c.toFixed(2)}%`;
  }
  return String(c ?? "");
}
