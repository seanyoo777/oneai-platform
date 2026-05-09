const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { hashPassword, verifyPassword, makeReferralCode } = require("./password-crypto");

const dataDir = path.join(__dirname, "..", "data");
const usersFilePath = path.join(dataDir, "users.json");

function ensureUsersStore() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(usersFilePath)) fs.writeFileSync(usersFilePath, JSON.stringify([], null, 2), "utf8");
}

function readUsers() {
  ensureUsersStore();
  try {
    const raw = fs.readFileSync(usersFilePath, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeUsers(users) {
  ensureUsersStore();
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), "utf8");
}

function sanitizeUser(user) {
  const { passwordHash, ...rest } = user;
  return rest;
}

function registerUser({ email, password, nickname, referredBy }) {
  const normalizedEmail = email.trim().toLowerCase();
  const users = readUsers();
  if (users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
    throw new Error("이미 가입된 이메일입니다.");
  }

  const now = new Date().toISOString();
  const newUser = {
    id: crypto.randomUUID(),
    email: normalizedEmail,
    passwordHash: hashPassword(password),
    nickname,
    referralCode: makeReferralCode(nickname),
    referredBy: referredBy || null,
    referralCount: 0,
    role: "free_member",
    membershipType: "free",
    membershipExpiresAt: null,
    createdAt: now
  };

  users.push(newUser);

  if (referredBy) {
    const referrer = users.find((u) => u.referralCode === referredBy);
    if (referrer) referrer.referralCount = (referrer.referralCount || 0) + 1;
  }

  writeUsers(users);
  return sanitizeUser(newUser);
}

function authenticateUser(email, password) {
  const users = readUsers();
  const idx = users.findIndex((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (idx < 0) return null;
  const user = users[idx];
  if (!verifyPassword(password, user.passwordHash)) return null;

  if (!String(user.passwordHash).startsWith("pbkdf2$")) {
    users[idx].passwordHash = hashPassword(password);
    writeUsers(users);
  }

  return sanitizeUser(user);
}

function getUserById(id) {
  const users = readUsers();
  const user = users.find((u) => u.id === id);
  return user ? sanitizeUser(user) : null;
}

function getUsers() {
  return readUsers().map(sanitizeUser);
}

function updateUserRoleMembership({ userId, role, membershipType, membershipExpiresAt }) {
  const users = readUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx < 0) throw new Error("사용자를 찾을 수 없습니다.");
  if (role) users[idx].role = role;
  if (membershipType) users[idx].membershipType = membershipType;
  if (membershipExpiresAt !== undefined) users[idx].membershipExpiresAt = membershipExpiresAt || null;
  writeUsers(users);
  return sanitizeUser(users[idx]);
}

function linkWalletAddress({ userId, walletAddress, walletNetwork }) {
  const users = readUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx < 0) throw new Error("사용자를 찾을 수 없습니다.");
  users[idx].walletAddress = walletAddress;
  users[idx].walletNetwork = walletNetwork || "evm";
  writeUsers(users);
  return sanitizeUser(users[idx]);
}

function extendMembershipByDays({ userId, days, paymentMeta }) {
  const users = readUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx < 0) throw new Error("사용자를 찾을 수 없습니다.");

  const currentExpMs = users[idx].membershipExpiresAt ? new Date(users[idx].membershipExpiresAt).getTime() : 0;
  const baseMs = Math.max(Date.now(), currentExpMs || 0);
  const nextMs = baseMs + days * 24 * 60 * 60 * 1000;

  users[idx].membershipType = "vip";
  users[idx].role = users[idx].role === "admin" ? "admin" : "vip_member";
  users[idx].membershipExpiresAt = new Date(nextMs).toISOString().slice(0, 10);
  users[idx].lastMembershipPayment = paymentMeta || null;

  writeUsers(users);
  return sanitizeUser(users[idx]);
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
