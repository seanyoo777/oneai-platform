const ADMIN_TOKEN = process.env.ONEAI_ADMIN_TOKEN || "oneai-dev-admin-token";

function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const bearerToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  const headerToken = req.headers["x-admin-token"] || "";
  const token = String(bearerToken || headerToken || "");

  if (!token || token !== ADMIN_TOKEN) {
    res.status(401).json({
      ok: false,
      message: "관리자 인증 실패",
      hint: "Authorization: Bearer <ONEAI_ADMIN_TOKEN> 헤더를 사용하세요."
    });
    return;
  }
  req.adminActor = String(req.headers["x-admin-id"] || "admin");
  next();
}

module.exports = { requireAdmin };
