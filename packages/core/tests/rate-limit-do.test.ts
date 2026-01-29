import { describe, it, expect, vi, beforeEach } from "vitest";
import { RateLimiterDurableObject } from "../src/rate-limit-do";

type Row = { count: number };

function createMockState() {
  const store = new Map<string, number>();

  const sql = {
    exec: <T = Row>(query: string, ...params: Array<string | number>) => {
      if (query.startsWith("CREATE TABLE")) return [];
      if (query.startsWith("DELETE FROM rate_limits")) {
        const cutoff = params[0] as number;
        for (const key of store.keys()) {
          const parts = key.split("|");
          const windowStart = Number(parts[2]);
          if (windowStart < cutoff) store.delete(key);
        }
        return [];
      }
      if (query.startsWith("SELECT count FROM rate_limits")) {
        const [tenantId, rlKey, windowStart] = params as [string, string, number];
        const count = store.get(`${tenantId}|${rlKey}|${windowStart}`);
        return count === undefined ? [] : ([{ count }] as T[]);
      }
      if (query.startsWith("INSERT OR REPLACE INTO rate_limits")) {
        const [tenantId, rlKey, windowStart, count] = params as [
          string,
          string,
          number,
          number
        ];
        store.set(`${tenantId}|${rlKey}|${windowStart}`, count);
        return [];
      }
      return [];
    }
  };

  return {
    storage: { sql },
    blockConcurrencyWhile: async (fn: () => Promise<void>) => fn()
  } as unknown as DurableObjectState;
}

describe("RateLimiterDurableObject", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("allows requests under the limit and rejects over-limit", async () => {
    const state = createMockState();
    const limiter = new RateLimiterDurableObject(state);

    const base = {
      tenantId: "t1",
      key: "t1:user:abc",
      limit: 2,
      windowSeconds: 60
    };

    const r1 = await limiter.fetch(
      new Request("https://do.internal/check", {
        method: "POST",
        body: JSON.stringify(base)
      })
    );
    expect(r1.status).toBe(200);

    const r2 = await limiter.fetch(
      new Request("https://do.internal/check", {
        method: "POST",
        body: JSON.stringify(base)
      })
    );
    expect(r2.status).toBe(200);

    const r3 = await limiter.fetch(
      new Request("https://do.internal/check", {
        method: "POST",
        body: JSON.stringify(base)
      })
    );
    expect(r3.status).toBe(429);
    expect(r3.headers.get("retry-after")).toBeTruthy();
  });

  it("isolates counts per tenant", async () => {
    const state = createMockState();
    const limiter = new RateLimiterDurableObject(state);

    const base = {
      key: "user:abc",
      limit: 1,
      windowSeconds: 60
    };

    const r1 = await limiter.fetch(
      new Request("https://do.internal/check", {
        method: "POST",
        body: JSON.stringify({ ...base, tenantId: "t1" })
      })
    );
    expect(r1.status).toBe(200);

    const r2 = await limiter.fetch(
      new Request("https://do.internal/check", {
        method: "POST",
        body: JSON.stringify({ ...base, tenantId: "t2" })
      })
    );
    expect(r2.status).toBe(200);
  });
});
