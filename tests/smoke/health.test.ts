import { describe, it, expect, vi } from "vitest";
import { createRouter } from "../../packages/core/src/router";
import type { Env } from "../../packages/core/src/types";

describe("Smoke: /health", () => {
  it("responds with tenant info", async () => {
    const env: Env = {
      TENANT_ID: "mrrainbowsmoke",
      AI: {} as Ai,
      CACHE: {} as KVNamespace,
      VECTORS: {} as VectorizeIndex,
      CHAT_SESSIONS: {
        get: vi.fn(),
        idFromName: vi.fn(),
        idFromString: vi.fn(),
        newUniqueId: vi.fn()
      } as unknown as DurableObjectNamespace
    };

    const request = new Request("https://example.com/health", {
      headers: { "x-tenant-id": "mrrainbowsmoke" }
    });
    const response = await createRouter().fetch(request, env);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ ok: true, tenantId: "mrrainbowsmoke" });
  });
});
