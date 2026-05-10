const fs = require("fs");
const path = require("path");
const { extendMembershipByDays } = require("./user-store");
const { useDatabase } = require("./db-env");
const { getPrisma } = require("./prisma-client");

const MEMBERSHIP_DEPOSIT_ADDRESS =
  process.env.ONEAI_MEMBERSHIP_DEPOSIT_ADDRESS || "0xONEAI_DEPOSIT_ADDRESS_REPLACE_ME";
const MEMBERSHIP_WEBHOOK_SECRET = process.env.ONEAI_MEMBERSHIP_WEBHOOK_SECRET || "oneai-membership-webhook-secret";

const dataDir = path.join(__dirname, "..", "data");
const paymentsPath = path.join(dataDir, "membership-payments.json");

function ensureStore() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(paymentsPath)) fs.writeFileSync(paymentsPath, JSON.stringify([], null, 2), "utf8");
}

function readPayments() {
  ensureStore();
  try {
    const parsed = JSON.parse(fs.readFileSync(paymentsPath, "utf8"));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writePayments(rows) {
  ensureStore();
  fs.writeFileSync(paymentsPath, JSON.stringify(rows, null, 2), "utf8");
}

async function isTxAlreadyProcessed(txHash) {
  if (!useDatabase()) {
    return readPayments().some((p) => p.txHash === txHash);
  }
  const prisma = getPrisma();
  const row = await prisma.membershipPayment.findUnique({ where: { txHash } });
  return Boolean(row);
}

async function recordMembershipPayment({ txHash, userId, amountUsdt, planCode, network }) {
  if (!useDatabase()) {
    const payments = readPayments();
    payments.unshift({
      txHash,
      userId,
      amountUsdt: Number(amountUsdt),
      planCode,
      network: network || "evm",
      processedAt: new Date().toISOString()
    });
    writePayments(payments.slice(0, 5000));
    return;
  }
  const prisma = getPrisma();
  try {
    await prisma.membershipPayment.create({
      data: {
        txHash,
        userId,
        amountUsdt: Number(amountUsdt),
        planCode,
        network: network || "evm"
      }
    });
  } catch (err) {
    if (err && err.code === "P2002") {
      return;
    }
    throw err;
  }
}

const MEMBERSHIP_PLAN_CATALOG = {
  vip_30d: { days: 30, amountUsdt: 100 },
  vip_90d: { days: 90, amountUsdt: 270 },
  vip_365d: { days: 365, amountUsdt: 960 }
};

/** 입금 주소 없이 공개 가능한 플랜 목록 (금액 단일 진실: 서버) */
function listMembershipPlans() {
  return Object.entries(MEMBERSHIP_PLAN_CATALOG).map(([planCode, v]) => ({
    planCode,
    days: v.days,
    amountUsdt: v.amountUsdt
  }));
}

function quoteMembershipPlan(planCode) {
  const catalog = MEMBERSHIP_PLAN_CATALOG;
  const selected = catalog[planCode] || catalog.vip_30d;
  return {
    planCode: planCode in catalog ? planCode : "vip_30d",
    ...selected,
    depositAddress: MEMBERSHIP_DEPOSIT_ADDRESS,
    note: "입금 확인 후 멤버십이 자동 연장됩니다. 투자 결과 보장은 제공하지 않습니다."
  };
}

async function processOnchainPayment(payload) {
  const {
    webhookSecret,
    userId,
    txHash,
    fromAddress,
    toAddress,
    amountUsdt,
    confirmations,
    planCode,
    network
  } = payload;

  if (webhookSecret !== MEMBERSHIP_WEBHOOK_SECRET) {
    throw new Error("웹훅 인증 실패");
  }
  if (!userId || !txHash || !toAddress) {
    throw new Error("필수 결제 데이터가 누락되었습니다.");
  }
  if (String(toAddress).toLowerCase() !== String(MEMBERSHIP_DEPOSIT_ADDRESS).toLowerCase()) {
    throw new Error("멤버십 전용 입금 주소와 일치하지 않습니다.");
  }

  const quote = quoteMembershipPlan(planCode);
  if (Number(amountUsdt) < Number(quote.amountUsdt)) {
    throw new Error("입금 금액이 결제 요건보다 적습니다.");
  }
  if (Number(confirmations) < 3) {
    throw new Error("컨펌 수 부족");
  }

  if (await isTxAlreadyProcessed(txHash)) {
    return { ok: true, duplicated: true, message: "이미 처리된 트랜잭션입니다." };
  }

  const updatedUser = await extendMembershipByDays({
    userId,
    days: quote.days,
    paymentMeta: {
      txHash,
      amountUsdt: Number(amountUsdt),
      fromAddress,
      toAddress,
      planCode: quote.planCode,
      network: network || "evm",
      confirmedAt: new Date().toISOString()
    }
  });

  await recordMembershipPayment({
    txHash,
    userId,
    amountUsdt,
    planCode: quote.planCode,
    network: network || "evm"
  });

  return {
    ok: true,
    duplicated: false,
    user: updatedUser,
    membership: {
      planCode: quote.planCode,
      extendedDays: quote.days,
      expiresAt: updatedUser.membershipExpiresAt
    }
  };
}

module.exports = {
  quoteMembershipPlan,
  listMembershipPlans,
  processOnchainPayment,
  MEMBERSHIP_DEPOSIT_ADDRESS
};
