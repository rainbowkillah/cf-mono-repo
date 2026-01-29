// apps/worker-api/src/index.test.ts
import { describe, it, expect } from 'vitest';
import worker from './index';
import type Env from '@packages/core/env';

const mockTenantConfig = {
  tenantId: "test-tenant",
  aiGatewayRoute: "https://example.com/ai",
  modelPolicy: { chat: "chat-model", embeddings: "embed-model" },
  vectorizeIndex: "test-vector-index",
  kvNamespace: "test-kv-namespace",
  doSessionName: "TestSessionDO",
  rateLimit: { perMinute: 60, burst: 10 },
};

// Mock KV_TENANT_CONFIG.get
const mockKVTenantConfig = {
  get: async (key: string) => {
    if (key.endsWith(`:${mockTenantConfig.tenantId}`)) {
      return JSON.stringify(mockTenantConfig);
    }
    return null;
  },
} as any; // Cast to any for simplicity in mocking

// Mock DurableObjectNamespace
const mockSessionDO = {} as DurableObjectNamespace;

// A minimal Env object for testing
const mockEnv: Env = {
  KV_TENANT_CONFIG: mockKVTenantConfig,
  SESSION_DO: mockSessionDO,
};

describe('worker-api with router', () => {
  it('should return a 200 OK with tenant info for /health', async () => {
    const request = new Request('http://localhost/health', {
      headers: { 'x-tenant-id': mockTenantConfig.tenantId },
    });
    const response = await worker.fetch(request, mockEnv, {} as ExecutionContext);
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual({
      success: true,
      data: {
        ok: true,
        tenantId: mockTenantConfig.tenantId,
      },
    });
  });

  it('should return 404 for an unknown route', async () => {
    const request = new Request('http://localhost/unknown', {
      headers: { 'x-tenant-id': mockTenantConfig.tenantId },
    });
    const response = await worker.fetch(request, mockEnv, {} as ExecutionContext);
    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body.error.message).toBe('Not Found');
  });

  it('should still return 401 if tenant is missing', async () => {
    const request = new Request('http://localhost/health');
    const response = await worker.fetch(request, mockEnv, {} as ExecutionContext);
    expect(response.status).toBe(401);
  });
});
