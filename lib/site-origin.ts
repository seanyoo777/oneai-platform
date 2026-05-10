/**
 * OG·metadataBase·robots/sitemap용 사이트 절대 원점.
 * 로컬만 쓸 때는 비워 두어도 되고, 배포는 `NEXT_PUBLIC_SITE_URL` 또는 Vercel의 `VERCEL_URL`로 채워진다.
 */
export function getSiteOrigin(): string | null {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (raw && /^https?:\/\//i.test(raw)) {
    return raw.replace(/\/$/, "");
  }
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    const host = vercel.replace(/^https?:\/\//i, "").replace(/\/$/, "");
    return `https://${host}`;
  }
  return null;
}
