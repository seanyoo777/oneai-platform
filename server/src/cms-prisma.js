const { getPrisma } = require("./prisma-client");

function mapRow(r) {
  return {
    id: r.id,
    kind: r.kind,
    sortOrder: r.sortOrder,
    published: r.published,
    title: r.title,
    subtitle: r.subtitle,
    body: r.body,
    linkUrl: r.linkUrl,
    imageUrl: r.imageUrl,
    badge: r.badge,
    meta: r.meta,
    startsAt: r.startsAt ? r.startsAt.toISOString() : null,
    endsAt: r.endsAt ? r.endsAt.toISOString() : null,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString()
  };
}

function parseDate(v) {
  if (v == null || v === "") return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

async function listAll(kindFilter) {
  const prisma = getPrisma();
  const where = kindFilter ? { kind: kindFilter } : {};
  const rows = await prisma.siteContent.findMany({
    where,
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }]
  });
  return rows.map(mapRow);
}

async function findById(id) {
  const prisma = getPrisma();
  const r = await prisma.siteContent.findUnique({ where: { id } });
  return r ? mapRow(r) : null;
}

async function create(row) {
  const prisma = getPrisma();
  const created = await prisma.siteContent.create({
    data: {
      kind: String(row.kind),
      sortOrder: Number(row.sortOrder ?? 0),
      published: Boolean(row.published ?? true),
      title: String(row.title ?? ""),
      subtitle: row.subtitle ?? null,
      body: row.body ?? null,
      linkUrl: row.linkUrl ?? null,
      imageUrl: row.imageUrl ?? null,
      badge: row.badge ?? null,
      meta: row.meta ?? undefined,
      startsAt: parseDate(row.startsAt),
      endsAt: parseDate(row.endsAt)
    }
  });
  return mapRow(created);
}

async function update(id, patch) {
  const prisma = getPrisma();
  const data = {};
  if (patch.kind !== undefined) data.kind = String(patch.kind);
  if (patch.sortOrder !== undefined) data.sortOrder = Number(patch.sortOrder);
  if (patch.published !== undefined) data.published = Boolean(patch.published);
  if (patch.title !== undefined) data.title = String(patch.title);
  if (patch.subtitle !== undefined) data.subtitle = patch.subtitle;
  if (patch.body !== undefined) data.body = patch.body;
  if (patch.linkUrl !== undefined) data.linkUrl = patch.linkUrl;
  if (patch.imageUrl !== undefined) data.imageUrl = patch.imageUrl;
  if (patch.badge !== undefined) data.badge = patch.badge;
  if (patch.meta !== undefined) data.meta = patch.meta ?? undefined;
  if (patch.startsAt !== undefined) data.startsAt = parseDate(patch.startsAt);
  if (patch.endsAt !== undefined) data.endsAt = parseDate(patch.endsAt);

  if (Object.keys(data).length === 0) {
    const row = await prisma.siteContent.findUnique({ where: { id } });
    return row ? mapRow(row) : null;
  }

  try {
    const updated = await prisma.siteContent.update({
      where: { id },
      data
    });
    return mapRow(updated);
  } catch {
    return null;
  }
}

async function remove(id) {
  const prisma = getPrisma();
  try {
    await prisma.siteContent.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}

module.exports = { listAll, findById, create, update, remove };
