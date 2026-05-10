/**
 * 통합 플랫폼용 단일 API 클라이언트 진입점.
 * 호스트가 분리되어도 베이스 URL·인증 헤더 규약은 여기서만 조정한다.
 */
/** 로컬 기본은 OneAI 전용 포트(4200). 서버 `PORT`·`.env.local`과 맞출 것 */
const defaultBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4200";

function joinApiUrl(base: string, path: string): string {
  if (path.startsWith("http")) return path;
  const b = base.replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${b}${p}`;
}

export type OneaiJson =
  | Record<string, unknown>
  | unknown[]
  | string
  | number
  | boolean
  | null;

export async function oneaiFetch<T extends OneaiJson = Record<string, unknown>>(
  path: string,
  init?: RequestInit & { accessToken?: string | null }
): Promise<{ res: Response; json: T }> {
  const url = joinApiUrl(defaultBase, path);
  const headers = new Headers(init?.headers);
  if (!headers.has("Content-Type") && init?.body && typeof init.body === "string") {
    headers.set("Content-Type", "application/json");
  }
  const token = init?.accessToken;
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  const res = await fetch(url, { ...init, headers });
  const text = await res.text();
  let json = {} as T;
  if (text) {
    try {
      json = JSON.parse(text) as T;
    } catch {
      json = { raw: text } as unknown as T;
    }
  }
  return { res, json };
}

export function getOneaiApiBaseUrl(): string {
  return defaultBase.replace(/\/$/, "");
}

/** 비 JSON/HTML 에러 본문 등에서 사용자에게 보여줄 한 줄 메시지 */
export function oneaiErrorHint(json: unknown, res: Response, fallback: string): string {
  if (json && typeof json === "object") {
    const o = json as Record<string, unknown>;
    const code = typeof o.code === "string" && o.code.trim() ? `[${o.code}] ` : "";
    if (typeof o.message === "string" && o.message.trim()) return `${code}${o.message} (${res.status})`;
    if (typeof o.raw === "string" && o.raw.trim()) return `${code}${o.raw.slice(0, 200)} (${res.status})`;
  }
  return `${fallback} (${res.status})`;
}
