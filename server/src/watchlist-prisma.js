const { getPrisma } = require("./prisma-client");

async function getWatchlist(userId) {
  const prisma = getPrisma();
  const rows = await prisma.watchlistItem.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" }
  });
  return rows.map((r) => ({
    id: r.id,
    symbol: r.symbol,
    market: r.market,
    note: r.note,
    addedAt: r.createdAt.toISOString()
  }));
}

async function setWatchlist(userId, items) {
  const prisma = getPrisma();
  await prisma.$transaction(async (tx) => {
    await tx.watchlistItem.deleteMany({ where: { userId } });
    if (items.length > 0) {
      await tx.watchlistItem.createMany({
        data: items.map((it) => ({
          userId,
          symbol: it.symbol,
          market: it.market,
          note: it.note
        }))
      });
    }
  });
}

module.exports = { getWatchlist, setWatchlist };
