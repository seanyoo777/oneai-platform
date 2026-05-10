/**
 * 관리자 인증 + 역할(RBAC) — 통합 플랫폼에서 동일 패턴으로 게이트웨이·다른 서비스에 복제 가능.
 * ONEAI_ADMIN_TOKEN 만 설정된 경우: 기존과 동일하게 최고관리자(super_admin)로 동작.
 */

const DEFAULT_DEV_TOKEN = "oneai-dev-admin-token";

/** 공개 문서·코드와 맞출 역할 문자열 */
const AdminRoles = {
  SUPER_ADMIN: "super_admin",
  OPS_ADMIN: "ops_admin",
  CS_ADMIN: "cs_admin",
  MARKETING_ADMIN: "marketing_admin",
  BILLING_ADMIN: "billing_admin"
};

function getPrimaryAdminToken() {
  return process.env.ONEAI_ADMIN_TOKEN || DEFAULT_DEV_TOKEN;
}

function extractBearer(req) {
  const authHeader = req.headers.authorization || "";
  const bearerToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  const headerToken = req.headers["x-admin-token"] || "";
  return String(bearerToken || headerToken || "");
}

/**
 * @returns {{ role: string, tokenKey: string } | null}
 */
function resolveAdminSession(token) {
  const t = String(token || "");
  if (!t) return null;

  if (t === getPrimaryAdminToken()) {
    return { role: AdminRoles.SUPER_ADMIN, tokenKey: "primary" };
  }
  if (process.env.ONEAI_ADMIN_TOKEN_OPS && t === process.env.ONEAI_ADMIN_TOKEN_OPS) {
    return { role: AdminRoles.OPS_ADMIN, tokenKey: "ops" };
  }
  if (process.env.ONEAI_ADMIN_TOKEN_CS && t === process.env.ONEAI_ADMIN_TOKEN_CS) {
    return { role: AdminRoles.CS_ADMIN, tokenKey: "cs" };
  }
  if (process.env.ONEAI_ADMIN_TOKEN_MARKETING && t === process.env.ONEAI_ADMIN_TOKEN_MARKETING) {
    return { role: AdminRoles.MARKETING_ADMIN, tokenKey: "marketing" };
  }
  if (process.env.ONEAI_ADMIN_TOKEN_BILLING && t === process.env.ONEAI_ADMIN_TOKEN_BILLING) {
    return { role: AdminRoles.BILLING_ADMIN, tokenKey: "billing" };
  }

  return null;
}

function requireAdmin(req, res, next) {
  const token = extractBearer(req);
  const session = resolveAdminSession(token);

  if (!session) {
    res.status(401).json({
      ok: false,
      code: "UNAUTHORIZED",
      message: "관리자 인증 실패",
      hint: "Authorization: Bearer <ONEAI_ADMIN_TOKEN> 또는 역할별 관리자 토큰을 사용하세요."
    });
    return;
  }

  req.adminRole = session.role;
  req.adminTokenKey = session.tokenKey;
  req.adminActor = String(req.headers["x-admin-id"] || session.tokenKey || "admin");
  next();
}

/** requireAdmin 이후에 연결. 허용 역할 중 하나일 때만 통과 */
function requireAdminRoles(...allowed) {
  const allowedSet = new Set(allowed);
  return (req, res, next) => {
    if (!req.adminRole) {
      res.status(500).json({ ok: false, message: "내부 오류: 관리자 역할 없음" });
      return;
    }
    if (!allowedSet.has(req.adminRole)) {
      res.status(403).json({
        ok: false,
        code: "FORBIDDEN",
        message: "이 작업을 수행할 관리자 권한이 없습니다.",
        role: req.adminRole,
        requiredOneOf: allowed
      });
      return;
    }
    next();
  };
}

module.exports = {
  AdminRoles,
  requireAdmin,
  requireAdminRoles,
  resolveAdminSession,
  extractBearer,
  getPrimaryAdminToken
};
