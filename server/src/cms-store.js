const { useDatabase } = require("./db-env");

const ALLOWED_KINDS = new Set(["banner", "curated_article", "featured_pick", "event"]);

function db() {
  return require("./cms-prisma");
}

const fileStore = require("./cms-file");

function normalizeKind(kind) {
  const k = String(kind ?? "")
    .trim()
    .toLowerCase();
  if (!ALLOWED_KINDS.has(k)) {
    throw new Error(`kind은 다음 중 하나여야 합니다: ${[...ALLOWED_KINDS].join(", ")}`);
  }
  return k;
}

function isActiveNow(row) {
  if (!row.published) return false;
  const t = Date.now();
  if (row.startsAt) {
    const s = new Date(row.startsAt).getTime();
    if (!Number.isNaN(s) && t < s) return false;
  }
  if (row.endsAt) {
    const e = new Date(row.endsAt).getTime();
    if (!Number.isNaN(e) && t > e) return false;
  }
  return true;
}

async function listAll(kindFilter) {
  const k = kindFilter ? normalizeKind(kindFilter) : undefined;
  if (useDatabase()) return db().listAll(k);
  return fileStore.listAll(k);
}

async function findById(id) {
  if (useDatabase()) return db().findById(id);
  return fileStore.findById(id);
}

async function createItem(payload) {
  const kind = normalizeKind(payload.kind);
  const row = {
    kind,
    sortOrder: payload.sortOrder ?? 0,
    published: payload.published !== false,
    title: String(payload.title ?? "").slice(0, 300),
    subtitle: payload.subtitle != null ? String(payload.subtitle).slice(0, 500) : null,
    body: payload.body != null ? String(payload.body).slice(0, 20000) : null,
    linkUrl: payload.linkUrl != null ? String(payload.linkUrl).slice(0, 2000) : null,
    imageUrl: payload.imageUrl != null ? String(payload.imageUrl).slice(0, 2000) : null,
    badge: payload.badge != null ? String(payload.badge).slice(0, 80) : null,
    meta: payload.meta != null && typeof payload.meta === "object" ? payload.meta : null,
    startsAt: payload.startsAt ?? null,
    endsAt: payload.endsAt ?? null
  };
  if (useDatabase()) return db().create(row);
  return fileStore.create(row);
}

async function updateItem(id, patch) {
  if (patch.kind != null) normalizeKind(patch.kind);
  const safe = { ...patch };
  if (safe.title != null) safe.title = String(safe.title).slice(0, 300);
  if (safe.subtitle != null) safe.subtitle = String(safe.subtitle).slice(0, 500);
  if (safe.body != null) safe.body = String(safe.body).slice(0, 20000);
  if (safe.linkUrl != null) safe.linkUrl = String(safe.linkUrl).slice(0, 2000);
  if (safe.imageUrl != null) safe.imageUrl = String(safe.imageUrl).slice(0, 2000);
  if (safe.badge != null) safe.badge = String(safe.badge).slice(0, 80);
  if (useDatabase()) return db().update(id, safe);
  return fileStore.update(id, safe);
}

async function removeItem(id) {
  if (useDatabase()) return db().remove(id);
  return fileStore.remove(id);
}

async function listPublicGrouped() {
  const all = await listAll();
  const active = all.filter(isActiveNow);
  const buckets = {
    banners: active.filter((r) => r.kind === "banner"),
    articles: active.filter((r) => r.kind === "curated_article"),
    featuredPicks: active.filter((r) => r.kind === "featured_pick"),
    events: active.filter((r) => r.kind === "event")
  };
  return buckets;
}

module.exports = {
  listAll,
  findById,
  createItem,
  updateItem,
  removeItem,
  listPublicGrouped,
  normalizeKind,
  ALLOWED_KINDS: [...ALLOWED_KINDS]
};
