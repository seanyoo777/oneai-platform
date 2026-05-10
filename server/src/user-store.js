const fileStore = require("./user-store-file");
const { useDatabase } = require("./db-env");

function db() {
  return require("./user-store-prisma");
}

async function registerUser(opts) {
  if (useDatabase()) return db().registerUser(opts);
  return fileStore.registerUser(opts);
}

async function authenticateUser(email, password) {
  if (useDatabase()) return db().authenticateUser(email, password);
  return fileStore.authenticateUser(email, password);
}

async function getUserById(id) {
  if (useDatabase()) return db().getUserById(id);
  return fileStore.getUserById(id);
}

async function getUsers() {
  if (useDatabase()) return db().getUsers();
  return fileStore.getUsers();
}

async function updateUserRoleMembership(opts) {
  if (useDatabase()) return db().updateUserRoleMembership(opts);
  return fileStore.updateUserRoleMembership(opts);
}

async function linkWalletAddress(opts) {
  if (useDatabase()) return db().linkWalletAddress(opts);
  return fileStore.linkWalletAddress(opts);
}

async function extendMembershipByDays(opts) {
  if (useDatabase()) return db().extendMembershipByDays(opts);
  return fileStore.extendMembershipByDays(opts);
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
