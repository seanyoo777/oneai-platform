const crypto = require("crypto");
const { getPrisma } = require("./prisma-client");

const REFRESH_EXPIRES_DAYS = Number(process.env.ONEAI_REFRESH_EXPIRES_DAYS || 14);

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

async function issueRefreshToken(userId) {
  const prisma = getPrisma();
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000);

  await prisma.refreshToken.deleteMany({
    where: { userId }
  });

  await prisma.refreshToken.create({
    data: {
      tokenHash,
      userId,
      expiresAt
    }
  });

  return token;
}

async function consumeRefreshToken(token) {
  const prisma = getPrisma();
  const tokenHash = hashToken(token);
  const row = await prisma.refreshToken.findUnique({ where: { tokenHash } });
  if (!row) return null;
  if (row.expiresAt.getTime() <= Date.now()) {
    await prisma.refreshToken.delete({ where: { tokenHash } });
    return null;
  }
  await prisma.refreshToken.delete({ where: { tokenHash } });
  return row.userId;
}

async function revokeRefreshToken(token) {
  const prisma = getPrisma();
  const tokenHash = hashToken(token);
  await prisma.refreshToken.deleteMany({ where: { tokenHash } });
}

module.exports = { issueRefreshToken, consumeRefreshToken, revokeRefreshToken };
