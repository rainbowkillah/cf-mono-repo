import { z } from "zod";
import { json, notFound, unauthorized } from "./responses";
import { resolveTenantId } from "./tenant";
import type { Env } from "./types";

const DEFAULT_RATE_LIMIT = {
  limit: 60,
  windowSeconds: 60
};

export function createRouter() {
  return {
    async fetch(request: Request, env: Env): Promise<Response> {
      const url = new URL(request.url);
      const tenantId = resolveTenantId(request, env);
      if (!tenantId) return unauthorized();
      if (env.TENANT_ID && tenantId !== env.TENANT_ID) return unauthorized();

      if (url.pathname === "/health") return json({ ok: true, tenantId });
      if (url.pathname === "/api/ingest") return handleIngest(request, env, tenantId);
      if (url.pathname === "/api/search") return handleSearch(request, env, tenantId);
      if (url.pathname === "/api/chat") return handleChat(request, env, tenantId);

      return notFound();
    }
  };
}

const ingestBodySchema = z.object({
  documents: z.array(
    z.object({
      id: z.string().min(1),
      text: z.string().min(1),
      metadata: z.record(z.string(), z.unknown()).optional()
    })
  )
});

async function handleIngest(request: Request, env: Env, tenantId: string): Promise<Response> {
  if (request.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

  const token = request.headers.get("authorization")?.replace(/^Bearer\\s+/i, "");
  if (env.INGEST_TOKEN && token !== env.INGEST_TOKEN) return unauthorized();

  const body = ingestBodySchema.parse(await request.json());
  const stub = env.CHAT_SESSIONS.get(env.CHAT_SESSIONS.idFromName(`${tenantId}:admin`));
  return stub.fetch("https://do.internal/ingest", {
    method: "POST",
    headers: { "x-tenant-id": tenantId },
    body: JSON.stringify(body)
  });
}

const searchBodySchema = z.object({
  query: z.string().min(1),
  topK: z.number().int().min(1).max(20).default(5)
});

async function handleSearch(request: Request, env: Env, tenantId: string): Promise<Response> {
  if (request.method !== "POST") return new Response("Method Not Allowed", { status: 405 });
  const body = searchBodySchema.parse(await request.json());

  const stub = env.CHAT_SESSIONS.get(env.CHAT_SESSIONS.idFromName(`${tenantId}:admin`));
  return stub.fetch("https://do.internal/search", {
    method: "POST",
    headers: { "x-tenant-id": tenantId },
    body: JSON.stringify(body)
  });
}

const chatBodySchema = z.object({
  sessionId: z.string().min(1),
  message: z.string().min(1)
});

async function handleChat(request: Request, env: Env, tenantId: string): Promise<Response> {
  if (request.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

  const limited = await checkRateLimit(request, env, tenantId);
  if (limited) return limited;

  const body = chatBodySchema.parse(await request.json());
  const doId = env.CHAT_SESSIONS.idFromName(`${tenantId}:${body.sessionId}`);
  const stub = env.CHAT_SESSIONS.get(doId);
  return stub.fetch("https://do.internal/chat", {
    method: "POST",
    headers: { "x-tenant-id": tenantId },
    body: JSON.stringify(body)
  });
}

async function checkRateLimit(
  request: Request,
  env: Env,
  tenantId: string
): Promise<Response | null> {
  if (!env.RATE_LIMITER) return null;

  const limiterId = env.RATE_LIMITER.idFromName("global");
  const stub = env.RATE_LIMITER.get(limiterId);
  const key = buildRateLimitKey(request, tenantId);

  const response = await stub.fetch("https://do.internal/check", {
    method: "POST",
    body: JSON.stringify({
      tenantId,
      key,
      limit: DEFAULT_RATE_LIMIT.limit,
      windowSeconds: DEFAULT_RATE_LIMIT.windowSeconds
    })
  });

  if (response.status === 429) return response;
  return null;
}

function buildRateLimitKey(request: Request, tenantId: string): string {
  const userId = request.headers.get("x-user-id")?.trim();
  if (userId) return `${tenantId}:user:${userId}`;

  const ipHeader =
    request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for");
  const ip = ipHeader?.split(",")[0]?.trim() || "unknown";
  return `${tenantId}:ip:${ip}`;
}
