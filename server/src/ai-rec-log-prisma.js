const { getPrisma } = require("./prisma-client");

function map(r) {
  return {
    id: r.id,
    channel: r.channel,
    kind: r.kind,
    summary: r.summary,
    modelVersion: r.modelVersion,
    createdAt: r.createdAt.toISOString()
  };
}

async function append(entry) {
  const prisma = getPrisma();
  const row = await prisma.aiRecommendationLog.create({
    data: {
      channel: String(entry.channel),
      kind: String(entry.kind),
      summary: entry.summary && typeof entry.summary === "object" ? entry.summary : undefined,
      modelVersion: entry.modelVersion != null ? String(entry.modelVersion) : null
    }
  });
  return map(row);
}

async function readRecent(limit) {
  const prisma = getPrisma();
  const rows = await prisma.aiRecommendationLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit
  });
  return rows.map(map);
}

module.exports = { append, readRecent };
