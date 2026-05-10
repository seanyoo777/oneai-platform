/**
 * 공개 조회 API 부하 완화용 인메모리 TTL 캐시.
 * 프로세스 재시작 시 비워지며, 멀티 인스턴스 배포 시 Redis 등으로 교체 가능.
 */
const store = new Map();

function nowMs() {
  return Date.now();
}

async function cached(key, ttlMs, factory) {
  const hit = store.get(key);
  const t = nowMs();
  if (hit && hit.expiresAt > t) {
    return hit.value;
  }
  const value = await factory();
  store.set(key, { value, expiresAt: t + ttlMs });
  return value;
}

function invalidateByPrefix(prefix) {
  for (const k of store.keys()) {
    if (k.startsWith(prefix)) store.delete(k);
  }
}

module.exports = { cached, invalidateByPrefix };
