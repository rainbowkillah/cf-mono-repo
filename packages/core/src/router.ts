import { z } from "zod";
import { json, notFound, unauthorized } from "./responses";
import { resolveTenantId } from "./tenant";
import type { Env } from "./types";

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

  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
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

  const body = chatBodySchema.parse(await request.json());
  const doId = env.CHAT_SESSIONS.idFromName(`${tenantId}:${body.sessionId}`);
  const stub = env.CHAT_SESSIONS.get(doId);
  return stub.fetch("https://do.internal/chat", {
    method: "POST",
    headers: { "x-tenant-id": tenantId },
    body: JSON.stringify(body)
  });
}
