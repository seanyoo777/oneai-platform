const { PrismaClient } = require("@prisma/client");
const { hashPassword, verifyPassword, makeReferralCode } = require("./password-crypto");

const globalForPrisma = globalThis;

function getPrisma() {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({ log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"] });
  }
  return globalForPrisma.prisma;
}

function mapUser(u) {
  if (!u) return null;
  return {
    id: u.id,
    email: u.email,
    nickname: u.nickname,
    referralCode: u.referralCode,
    referredBy: u.referredBy,
    referralCount: u.referralCount,
    role: u.role,
    membershipType: u.membershipType,
    membershipExpiresAt: u.membershipExpiresAt ? u.membershipExpiresAt.toISOString().slice(0, 10) : null,
    walletAddress: u.walletAddress,
    walletNetwork: u.walletNetwork,
    lastMembershipPayment: u.lastMembershipPayment,
    createdAt: u.createdAt.toISOString()
  };
}

async function registerUser({ email, password, nickname, referredBy }) {
  const prisma = getPrisma();
  const normalizedEmail = email.trim().toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    throw new Error("이미 가입된 이메일입니다.");
  }

  const referralCode = makeReferralCode(nickname);

  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: {
        email: normalizedEmail,
        passwordHash: hashPassword(password),
        nickname,
        referralCode,
        referredBy: referredBy || null,
        referralCount: 0,
        role: "free_member",
        membershipType: "free",
        membershipExpiresAt: null
      }
    });

    if (referredBy) {
      await tx.user.updateMany({
        where: { referralCode: referredBy },
        data: { referralCount: { increment: 1 } }
      });
    }

    return created;
  });

  return mapUser(user);
}

async function authenticateUser(email, password) {
  const prisma = getPrisma();
  const normalizedEmail = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (!user) return null;
  if (!verifyPassword(password, user.passwordHash)) return null;

  if (!String(user.passwordHash).startsWith("pbkdf2$")) {
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: hashPassword(password) }
    });
  }

  return mapUser(await prisma.user.findUnique({ where: { id: user.id } }));
}

async function getUserById(id) {
  const prisma = getPrisma();
  const user = await prisma.user.findUnique({ where: { id } });
  return mapUser(user);
}

async function getUsers() {
  const prisma = getPrisma();
  const rows = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });
  return rows.map(mapUser);
}

async function updateUserRoleMembership({ userId, role, membershipType, membershipExpiresAt }) {
  const prisma = getPrisma();
  const data = {};
  if (role) data.role = role;
  if (membershipType) data.membershipType = membershipType;
  if (membershipExpiresAt !== undefined) {
    if (!membershipExpiresAt) {
      data.membershipExpiresAt = null;
    } else {
      data.membershipExpiresAt = new Date(`${membershipExpiresAt}T00:00:00.000Z`);
    }
  }
  try {
    const updated = await prisma.user.update({
      where: { id: userId },
      data
    });
    return mapUser(updated);
  } catch {
    throw new Error("사용자를 찾을 수 없습니다.");
  }
}

async function linkWalletAddress({ userId, walletAddress, walletNetwork }) {
  const prisma = getPrisma();
  try {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        walletAddress,
        walletNetwork: walletNetwork || "evm"
      }
    });
    return mapUser(updated);
  } catch {
    throw new Error("사용자를 찾을 수 없습니다.");
  }
}

async function extendMembershipByDays({ userId, days, paymentMeta }) {
  const prisma = getPrisma();
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("사용자를 찾을 수 없습니다.");

  const currentExpMs = user.membershipExpiresAt ? user.membershipExpiresAt.getTime() : 0;
  const baseMs = Math.max(Date.now(), currentExpMs || 0);
  const nextMs = baseMs + days * 24 * 60 * 60 * 1000;
  const nextDate = new Date(nextMs);

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      membershipType: "vip",
      role: user.role === "admin" ? "admin" : "vip_member",
      membershipExpiresAt: nextDate,
      lastMembershipPayment: paymentMeta
    }
  });

  return mapUser(updated);
}

module.exports = {
  registerUser,
  authenticateUser,
  getUserById,
  getUsers,
  updateUserRoleMembership,
  linkWalletAddress,
  extendMembershipByDays
};
