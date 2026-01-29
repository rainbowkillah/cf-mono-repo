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
      newUniqueId: vi.fn(),
    } as unknown as DurableObjectNamespace,
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
});
