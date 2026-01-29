import { describe, it, expect, vi } from "vitest";
import worker from "./index";
import type { Env } from "@packages/core/types";

const baseEnv: Env = {
  TENANT_ID: "mrrainbowsmoke",
  AI: {} as Ai,
  CACHE: {} as KVNamespace,
  VECTORS: {} as VectorizeIndex,
  CHAT_SESSIONS: {
    get: vi.fn(),
    idFromName: vi.fn(),
    idFromString: vi.fn(),
    newUniqueId: vi.fn()
  } as unknown as DurableObjectNamespace,
  RATE_LIMITER: {
    idFromName: vi.fn().mockReturnValue("global"),
    get: vi.fn().mockReturnValue({ fetch: vi.fn().mockResolvedValue(new Response("ok")) })
  } as unknown as DurableObjectNamespace
};

describe("worker-api with router", () => {
  it("should return a 200 OK with tenant info for /health", async () => {
    const request = new Request("http://localhost/health", {
      headers: { "x-tenant-id": "mrrainbowsmoke" }
    });
    const response = await worker.fetch(request, baseEnv, {} as ExecutionContext);
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual({
      ok: true,
      tenantId: "mrrainbowsmoke"
    });
  });

  it("should return 404 for an unknown route", async () => {
    const request = new Request("http://localhost/unknown", {
      headers: { "x-tenant-id": "mrrainbowsmoke" }
    });
    const response = await worker.fetch(request, baseEnv, {} as ExecutionContext);
    expect(response.status).toBe(404);
    const body = await response.text();
    expect(body).toBe("Not Found");
  });

  it("should return 401 if tenant is missing", async () => {
    const env: Env = {
      ...baseEnv,
      TENANT_ID: undefined
    };
    const request = new Request("http://localhost/health");
    const response = await worker.fetch(request, env, {} as ExecutionContext);
    expect(response.status).toBe(401);
  });
});
