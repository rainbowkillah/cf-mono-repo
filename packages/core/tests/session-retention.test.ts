import { describe, it, expect, vi } from "vitest";
import { ChatSessionDurableObject } from "../src/session-do";
import type { Env } from "../src/types";

vi.mock("@cloudflare/ai-utils", () => ({
  runWithTools: async function* () {
    yield { type: "final_response", response: "ok" };
  }
}));

function createMockState() {
  const rows: Array<{ role: string; content: string; created_at: number }> = [];
  const sql = {
    exec: (query: string, ...params: unknown[]) => {
      if (query.startsWith("CREATE TABLE")) return [];
      if (query.startsWith("INSERT INTO messages")) {
        rows.push({
          role: params[0] as string,
          content: params[1] as string,
          created_at: params[2] as number
        });
        return [];
      }
      if (query.startsWith("DELETE FROM messages")) {
        const limit = params[0] as number;
        if (rows.length > limit) {
          rows.splice(0, rows.length - limit);
        }
        return [];
      }
      if (query.startsWith("SELECT role, content, created_at FROM messages")) {
        return rows.slice(0, 50);
      }
      return [];
    }
  };

  return {
    storage: { sql },
    blockConcurrencyWhile: async (fn: () => Promise<void>) => fn()
  } as unknown as DurableObjectState;
}

function createEnv(): Env {
  return {
    TENANT_ID: "mrrainbowsmoke",
    AI: {
      run: async () => ({ data: [[0, 0, 0]] })
    } as unknown as Ai,
    CACHE: {} as KVNamespace,
    VECTORS: {
      query: async () => ({ matches: [] })
    } as unknown as VectorizeIndex,
    CHAT_SESSIONS: {} as DurableObjectNamespace,
    RATE_LIMITER: {} as DurableObjectNamespace
  };
}

describe("ChatSessionDurableObject retention", () => {
  it("keeps only the latest 100 messages", async () => {
    const state = createMockState();
    const env = createEnv();
    const session = new ChatSessionDurableObject(state, env);

    for (let i = 0; i < 120; i++) {
      await session.fetch(
        new Request("https://do.internal/chat", {
          method: "POST",
          headers: { "x-tenant-id": "mrrainbowsmoke" },
          body: JSON.stringify({ sessionId: "s1", message: `m${i}` })
        })
      );
    }

    const history = await session.fetch(
      new Request("https://do.internal/history", {
        headers: { "x-tenant-id": "mrrainbowsmoke" }
      })
    );

    const data = await history.json();
    expect(data.messages.length).toBeLessThanOrEqual(50);
  });
});
