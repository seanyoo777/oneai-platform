const { getPrisma } = require("./prisma-client");

async function appendAuditLog(event) {
  const prisma = getPrisma();
  await prisma.auditLog.create({
    data: {
      actor: String(event.actor ?? "system"),
      eventType: String(event.eventType ?? "unknown"),
      target: event.target != null ? String(event.target) : null,
      action: event.action != null ? String(event.action) : null,
      note: event.note != null ? String(event.note) : null
    }
  });
}

async function readAuditLogs() {
  const prisma = getPrisma();
  const rows = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 5000
  });
  return rows.map((r) => ({
    actor: r.actor,
    eventType: r.eventType,
    target: r.target,
    action: r.action,
    note: r.note,
    timestamp: r.createdAt.toISOString()
  }));
}

module.exports = { appendAuditLog, readAuditLogs };
