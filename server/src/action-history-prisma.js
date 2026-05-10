const { getPrisma } = require("./prisma-client");

async function addHistoryRow(row) {
  const prisma = getPrisma();
  await prisma.strategyAction.create({
    data: {
      strategyId: String(row.strategyId ?? ""),
      action: String(row.action ?? ""),
      note: row.note != null ? String(row.note) : null,
      actor: row.actor != null ? String(row.actor) : null,
      ok: row.ok !== false
    }
  });
}

async function readHistory() {
  const prisma = getPrisma();
  const rows = await prisma.strategyAction.findMany({
    orderBy: { createdAt: "desc" },
    take: 1000
  });
  return rows.map((r) => ({
    ok: r.ok,
    strategyId: r.strategyId,
    action: r.action,
    note: r.note ?? "",
    actor: r.actor ?? "admin",
    processedAt: r.createdAt.toISOString()
  }));
}

module.exports = { readHistory, addHistoryRow };
