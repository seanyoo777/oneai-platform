/** 빌드 타임에 주입되는 관리자 Bearer용 공개 토큰 (클라이언트 번들) */
export function getPublicAdminToken(): string {
  return process.env.NEXT_PUBLIC_ADMIN_TOKEN ?? "";
}
