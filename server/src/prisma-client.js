const { PrismaClient } = require("@prisma/client");

const globalForPrisma = globalThis;

function getPrisma() {
  if (!globalForPrisma.prismaOneAI) {
    globalForPrisma.prismaOneAI = new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"]
    });
  }
  return globalForPrisma.prismaOneAI;
}

module.exports = { getPrisma };
