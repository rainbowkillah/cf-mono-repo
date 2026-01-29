import { json, notFound, tooManyRequests } from "./responses";

type RateLimitRequest = {
  tenantId: string;
  key: string;
  limit: number;
  windowSeconds: number;
};

export class RateLimiterDurableObject {
  private state: DurableObjectState;
  private sql: SqlStorage;

  constructor(state: DurableObjectState) {
    this.state = state;
    this.sql = state.storage.sql;
    this.state.blockConcurrencyWhile(async () => {
      this.sql.exec(`
        CREATE TABLE IF NOT EXISTS rate_limits (
          tenant_id TEXT NOT NULL,
          rl_key TEXT NOT NULL,
          window_start INTEGER NOT NULL,
          count INTEGER NOT NULL,
          PRIMARY KEY (tenant_id, rl_key, window_start)
        )
      `);
    });
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname !== "/check") return notFound();
    if (request.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

    const body = (await request.json()) as RateLimitRequest;
    if (!body?.tenantId || !body?.key) return new Response("Bad Request", { status: 400 });

    const now = Date.now();
    const windowMs = body.windowSeconds * 1000;
    const windowStart = Math.floor(now / windowMs) * windowMs;

    this.cleanupOldWindows(windowStart, windowMs);

    const row = this.sql.exec<{ count: number }>(
      "SELECT count FROM rate_limits WHERE tenant_id = ? AND rl_key = ? AND window_start = ?",
      body.tenantId,
      body.key,
      windowStart
    );

    const currentCount = row[0]?.count ?? 0;
    const nextCount = currentCount + 1;

    if (nextCount > body.limit) {
      const resetSeconds = Math.ceil((windowStart + windowMs - now) / 1000);
      return tooManyRequests(resetSeconds);
    }

    this.sql.exec(
      "INSERT OR REPLACE INTO rate_limits(tenant_id, rl_key, window_start, count) VALUES(?, ?, ?, ?)",
      body.tenantId,
      body.key,
      windowStart,
      nextCount
    );

    const remaining = Math.max(0, body.limit - nextCount);
    return json({
      ok: true,
      remaining,
      limit: body.limit,
      resetSeconds: Math.ceil((windowStart + windowMs - now) / 1000)
    });
  }

  private cleanupOldWindows(windowStart: number, windowMs: number) {
    const cutoff = windowStart - windowMs * 5;
    this.sql.exec("DELETE FROM rate_limits WHERE window_start < ?", cutoff);
  }
}
