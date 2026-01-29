import { describe, it, expect, vi } from "vitest";
import { createRouter } from "../src/router";
import type { Env } from "../src/types";

describe("Router", () => {
  const mockEnv: Env = {
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

  describe("Tenant Authorization", () => {
    it("should reject requests without tenant header", async () => {
      const router = createRouter();
      const request = new Request("https://example.com/health");
      const envWithoutTenant: Env = {
        ...mockEnv,
        TENANT_ID: undefined as any,
      };

      const response = await router.fetch(request, envWithoutTenant);

      expect(response.status).toBe(401);
      expect(await response.text()).toBe("Unauthorized");
    });

    it("should reject requests with mismatched tenant", async () => {
      const router = createRouter();
      const request = new Request("https://example.com/health", {
        headers: { "x-tenant-id": "rainbowsmokeofficial" },
      });

      const response = await router.fetch(request, mockEnv);

      expect(response.status).toBe(401);
    });

    it("should accept requests with matching tenant", async () => {
      const router = createRouter();
      const request = new Request("https://example.com/health", {
        headers: { "x-tenant-id": "mrrainbowsmoke" },
      });

      const response = await router.fetch(request, mockEnv);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual({ ok: true, tenantId: "mrrainbowsmoke" });
    });
  });

  describe("Health Endpoint", () => {
    it("should return health status with tenant info", async () => {
      const router = createRouter();
      const request = new Request("https://example.com/health", {
        headers: { "x-tenant-id": "mrrainbowsmoke" },
      });

      const response = await router.fetch(request, mockEnv);

      expect(response.status).toBe(200);
      expect(response.headers.get("content-type")).toContain("application/json");

      const data = await response.json();
      expect(data).toHaveProperty("ok", true);
      expect(data).toHaveProperty("tenantId", "mrrainbowsmoke");
    });
  });

  describe("Not Found", () => {
    it("should return 404 for unknown routes", async () => {
      const router = createRouter();
      const request = new Request("https://example.com/unknown", {
        headers: { "x-tenant-id": "mrrainbowsmoke" },
      });

      const response = await router.fetch(request, mockEnv);

      expect(response.status).toBe(404);
      expect(await response.text()).toBe("Not Found");
    });
  });

  describe("Method Validation", () => {
    it("should reject non-POST for /api/ingest", async () => {
      const router = createRouter();
      const request = new Request("https://example.com/api/ingest", {
        method: "GET",
        headers: { "x-tenant-id": "mrrainbowsmoke" },
      });

      const response = await router.fetch(request, mockEnv);

      expect(response.status).toBe(405);
      expect(await response.text()).toBe("Method Not Allowed");
    });

    it("should reject non-POST for /api/search", async () => {
      const router = createRouter();
      const request = new Request("https://example.com/api/search", {
        method: "GET",
        headers: { "x-tenant-id": "mrrainbowsmoke" },
      });

      const response = await router.fetch(request, mockEnv);

      expect(response.status).toBe(405);
    });

    it("should reject non-POST for /api/chat", async () => {
      const router = createRouter();
      const request = new Request("https://example.com/api/chat", {
        method: "GET",
        headers: { "x-tenant-id": "mrrainbowsmoke" },
      });

      const response = await router.fetch(request, mockEnv);

      expect(response.status).toBe(405);
    });
  });

  describe("Session Isolation", () => {
    it("should include tenant in DO id for chat sessions", async () => {
      const router = createRouter();
      const idFromName = vi.fn().mockReturnValue("id");
      const stubFetch = vi.fn().mockResolvedValue(new Response("ok"));

      const env: Env = {
        ...mockEnv,
        CHAT_SESSIONS: {
          idFromName,
          get: () => ({ fetch: stubFetch })
        } as unknown as DurableObjectNamespace
      };

      const request = new Request("https://example.com/api/chat", {
        method: "POST",
        headers: { "x-tenant-id": "mrrainbowsmoke" },
        body: JSON.stringify({ sessionId: "s1", message: "hi" })
      });

      await router.fetch(request, env);
      expect(idFromName).toHaveBeenCalledWith("mrrainbowsmoke:s1");
    });

    it("should isolate chat sessions across tenants", async () => {
      const router = createRouter();
      const idFromName = vi.fn().mockReturnValue("id");
      const stubFetch = vi.fn().mockResolvedValue(new Response("ok"));

      const env: Env = {
        ...mockEnv,
        TENANT_ID: undefined,
        CHAT_SESSIONS: {
          idFromName,
          get: () => ({ fetch: stubFetch })
        } as unknown as DurableObjectNamespace
      };

      const request = new Request("https://example.com/api/chat", {
        method: "POST",
        headers: { "x-tenant-id": "rainbowsmokeofficial" },
        body: JSON.stringify({ sessionId: "s1", message: "hi" })
      });

      await router.fetch(request, env);
      expect(idFromName).toHaveBeenCalledWith("rainbowsmokeofficial:s1");
    });
  });

  describe("Rate Limiting", () => {
    it("should return 429 when rate limiter rejects", async () => {
      const router = createRouter();
      const limiterFetch = vi.fn().mockResolvedValue(new Response("Too Many Requests", { status: 429 }));

      const env: Env = {
        ...mockEnv,
        RATE_LIMITER: {
          idFromName: vi.fn().mockReturnValue("global"),
          get: vi.fn().mockReturnValue({ fetch: limiterFetch })
        } as unknown as DurableObjectNamespace
      };

      const request = new Request("https://example.com/api/chat", {
        method: "POST",
        headers: { "x-tenant-id": "mrrainbowsmoke" },
        body: JSON.stringify({ sessionId: "s1", message: "hi" })
      });

      const response = await router.fetch(request, env);
      expect(response.status).toBe(429);
    });
  });

  describe("Streaming Pass-through", () => {
    it("should pass through SSE response from DO", async () => {
      const router = createRouter();
      const streamResponse = new Response("event: message\ndata: {}\n\n", {
        headers: { "content-type": "text/event-stream" }
      });

      const env: Env = {
        ...mockEnv,
        RATE_LIMITER: {
          idFromName: vi.fn().mockReturnValue("global"),
          get: vi.fn().mockReturnValue({ fetch: vi.fn().mockResolvedValue(new Response("ok")) })
        } as unknown as DurableObjectNamespace,
        CHAT_SESSIONS: {
          idFromName: vi.fn().mockReturnValue("id"),
          get: vi.fn().mockReturnValue({ fetch: vi.fn().mockResolvedValue(streamResponse) })
        } as unknown as DurableObjectNamespace
      };

      const request = new Request("https://example.com/api/chat", {
        method: "POST",
        headers: { "x-tenant-id": "mrrainbowsmoke" },
        body: JSON.stringify({ sessionId: "s1", message: "hi" })
      });

      const response = await router.fetch(request, env);
      expect(response.headers.get("content-type")).toBe("text/event-stream");
    });
  });
});
