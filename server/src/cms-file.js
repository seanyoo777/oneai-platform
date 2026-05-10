const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const dataDir = path.join(__dirname, "..", "data");
const filePath = path.join(dataDir, "cms-content.json");

function ensureStore() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
}

function readRaw() {
  ensureStore();
  if (!fs.existsSync(filePath)) return [];
  try {
    const parsed = JSON.parse(fs.readFileSync(filePath, "utf8"));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeRaw(rows) {
  ensureStore();
  fs.writeFileSync(filePath, JSON.stringify(rows, null, 2), "utf8");
}

function seedRows() {
  const iso = () => new Date().toISOString();
  return [
    {
      id: "seed-banner-main",
      kind: "banner",
      sortOrder: 0,
      published: true,
      title: "OneAI 통합 투자정보 플랫폼",
      subtitle: "시세 · 시그널 · 연구 · 리스크관리",
      body: null,
      linkUrl: "/research",
      imageUrl: null,
      badge: "MVP",
      meta: null,
      startsAt: null,
      endsAt: null,
      createdAt: iso(),
      updatedAt: iso()
    },
    {
      id: "seed-article-1",
      kind: "curated_article",
      sortOrder: 0,
      published: true,
      title: "변동성 장세에서의 포지션 크기",
      subtitle: "참고용 리스크 관리 요약",
      body: "손절 폭과 노출 한도를 사전에 정해 두는 것이 중요합니다. 본 내용은 투자 권유가 아닙니다.",
      linkUrl: null,
      imageUrl: null,
      badge: "리스크",
      meta: null,
      startsAt: null,
      endsAt: null,
      createdAt: iso(),
      updatedAt: iso()
    },
    {
      id: "seed-pick-1",
      kind: "featured_pick",
      sortOrder: 0,
      published: true,
      title: "BTCUSDT",
      subtitle: "추세 스윙 (참고용)",
      body: null,
      linkUrl: "/signal",
      imageUrl: null,
      badge: "crypto",
      meta: { symbol: "BTCUSDT", market: "crypto" },
      startsAt: null,
      endsAt: null,
      createdAt: iso(),
      updatedAt: iso()
    },
    {
      id: "seed-event-1",
      kind: "event",
      sortOrder: 0,
      published: true,
      title: "플랫폼 기능 순차 오픈 안내",
      subtitle: "추후 거래소 연동·멤버십 확장 예정",
      body: null,
      linkUrl: "/membership",
      imageUrl: null,
      badge: "공지",
      meta: null,
      startsAt: null,
      endsAt: null,
      createdAt: iso(),
      updatedAt: iso()
    }
  ];
}

/** 최초 1회: 파일이 없을 때만 시드(운영자가 전부 삭제한 빈 배열과 구분) */
function readRowsOrSeed() {
  ensureStore();
  if (!fs.existsSync(filePath)) {
    const seeded = seedRows();
    writeRaw(seeded);
    return seeded;
  }
  return readRaw();
}

function listAll(kindFilter) {
  let rows = readRowsOrSeed();
  if (kindFilter) {
    rows = rows.filter((r) => r.kind === kindFilter);
  }
  return rows.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || String(a.id).localeCompare(b.id));
}

function findById(id) {
  return readRowsOrSeed().find((r) => r.id === id) ?? null;
}

function create(row) {
  const rows = readRaw();
  const id = row.id || crypto.randomUUID();
  if (rows.some((r) => r.id === id)) {
    throw new Error("이미 존재하는 id입니다.");
  }
  const iso = new Date().toISOString();
  const next = {
    id,
    kind: row.kind,
    sortOrder: Number(row.sortOrder ?? 0),
    published: Boolean(row.published ?? true),
    title: String(row.title ?? ""),
    subtitle: row.subtitle ?? null,
    body: row.body ?? null,
    linkUrl: row.linkUrl ?? null,
    imageUrl: row.imageUrl ?? null,
    badge: row.badge ?? null,
    meta: row.meta ?? null,
    startsAt: row.startsAt ?? null,
    endsAt: row.endsAt ?? null,
    createdAt: iso,
    updatedAt: iso
  };
  rows.push(next);
  writeRaw(rows);
  return next;
}

function update(id, patch) {
  const rows = readRaw();
  const idx = rows.findIndex((r) => r.id === id);
  if (idx < 0) return null;
  const cur = rows[idx];
  const iso = new Date().toISOString();
  const merged = {
    ...cur,
    ...patch,
    id: cur.id,
    kind: patch.kind != null ? String(patch.kind) : cur.kind,
    sortOrder: patch.sortOrder != null ? Number(patch.sortOrder) : cur.sortOrder,
    published: patch.published != null ? Boolean(patch.published) : cur.published,
    title: patch.title != null ? String(patch.title) : cur.title,
    subtitle: patch.subtitle !== undefined ? patch.subtitle : cur.subtitle,
    body: patch.body !== undefined ? patch.body : cur.body,
    linkUrl: patch.linkUrl !== undefined ? patch.linkUrl : cur.linkUrl,
    imageUrl: patch.imageUrl !== undefined ? patch.imageUrl : cur.imageUrl,
    badge: patch.badge !== undefined ? patch.badge : cur.badge,
    meta: patch.meta !== undefined ? patch.meta : cur.meta,
    startsAt: patch.startsAt !== undefined ? patch.startsAt : cur.startsAt,
    endsAt: patch.endsAt !== undefined ? patch.endsAt : cur.endsAt,
    createdAt: cur.createdAt,
    updatedAt: iso
  };
  rows[idx] = merged;
  writeRaw(rows);
  return merged;
}

function remove(id) {
  const rows = readRaw();
  const next = rows.filter((r) => r.id !== id);
  if (next.length === rows.length) return false;
  writeRaw(next);
  return true;
}

module.exports = { listAll, findById, create, update, remove };
