import { z } from "zod";
import { runWithTools } from "@cloudflare/ai-utils";
import type { Env } from "./types";
import { json, notFound, unauthorized } from "./responses";

type Role = "system" | "user" | "assistant";

type StoredMessage = {
  role: Role;
  content: string;
  createdAt: number;
};

const MAX_MESSAGES = 100;

const chatBodySchema = z.object({
  sessionId: z.string().min(1),
  message: z.string().min(1)
});

const ingestBodySchema = z.object({
  documents: z.array(
    z.object({
      id: z.string().min(1),
      text: z.string().min(1),
      metadata: z.record(z.string(), z.unknown()).optional()
    })
  )
});

const searchBodySchema = z.object({
  query: z.string().min(1),
  topK: z.number().int().min(1).max(20).default(5)
});

export class ChatSessionDurableObject {
  private state: DurableObjectState;
  private env: Env;
  private sql: SqlStorage;

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;
    this.sql = state.storage.sql;
    this.state.blockConcurrencyWhile(async () => {
      this.sql.exec(`
        CREATE TABLE IF NOT EXISTS messages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          role TEXT NOT NULL,
          content TEXT NOT NULL,
          created_at INTEGER NOT NULL
        )
      `);
    });
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const tenantId = getTenantId(request, this.env);
    if (!tenantId) return unauthorized();

    if (url.pathname === "/ingest") return this.handleIngest(request, tenantId);
    if (url.pathname === "/search") return this.handleSearch(request, tenantId);
    if (url.pathname === "/chat") return this.handleChat(request, tenantId);
    if (url.pathname === "/history") return this.handleHistory();

    return notFound();
  }

  private async handleHistory(): Promise<Response> {
    const rows = this.sql.exec<{
      role: Role;
      content: string;
      created_at: number;
    }>("SELECT role, content, created_at FROM messages ORDER BY id ASC LIMIT 50");

    const messages: StoredMessage[] = rows.map((r) => ({
      role: r.role,
      content: r.content,
      createdAt: r.created_at
    }));
    return json({ messages });
  }

  private async handleIngest(request: Request, tenantId: string): Promise<Response> {
    if (request.method !== "POST") return new Response("Method Not Allowed", { status: 405 });
    const body = ingestBodySchema.parse(await request.json());

    const embeddings = await this.env.AI.run("@cf/baai/bge-base-en-v1.5", {
      text: body.documents.map((d) => d.text)
    });

    const vectors = body.documents.map((doc, i) => ({
      id: doc.id,
      values: embeddings.data[i],
      metadata: { tenantId, text: doc.text, ...(doc.metadata ?? {}) }
    }));

    await this.env.VECTORS.upsert(vectors);
    return json({ ok: true, count: vectors.length });
  }

  private async handleSearch(request: Request, tenantId: string): Promise<Response> {
    if (request.method !== "POST") return new Response("Method Not Allowed", { status: 405 });
    const body = searchBodySchema.parse(await request.json());

    const cacheKey = `rag:${tenantId}:${hashString(body.query)}`;
    const cached = await this.env.CACHE.get(cacheKey, "json");
    if (cached) return json({ cached: true, ...cached });

    const embeddings = await this.env.AI.run("@cf/baai/bge-base-en-v1.5", { text: [body.query] });
    const result = await this.env.VECTORS.query(embeddings.data[0], {
      topK: body.topK,
      returnValues: false,
      returnMetadata: "all",
      filter: { tenantId }
    });

    const payload = { cached: false, matches: result.matches ?? [] };
    await this.env.CACHE.put(cacheKey, JSON.stringify(payload), { expirationTtl: 60 });
    return json(payload);
  }

  private async handleChat(request: Request, tenantId: string): Promise<Response> {
    if (request.method !== "POST") return new Response("Method Not Allowed", { status: 405 });
    const body = chatBodySchema.parse(await request.json());

    this.appendMessage({ role: "user", content: body.message, createdAt: Date.now() });

    const history = this.getRecentHistory(20);
    const ragContext = await this.getRagContext(body.message, tenantId);

    const tools = {
      vector_search: {
        description: "Search tenant knowledge base for relevant snippets.",
        parameters: z.object({
          query: z.string().min(1),
          topK: z.number().int().min(1).max(10).default(5)
        }),
        handler: async ({ query, topK }: { query: string; topK: number }) => {
          const embeddings = await this.env.AI.run("@cf/baai/bge-base-en-v1.5", { text: [query] });
          const result = await this.env.VECTORS.query(embeddings.data[0], {
            topK,
            returnValues: false,
            returnMetadata: "all",
            filter: { tenantId }
          });
          return { matches: result.matches ?? [] };
        }
      },
      kv_get: {
        description: "Read a cached value by key.",
        parameters: z.object({ key: z.string().min(1) }),
        handler: async ({ key }: { key: string }) => {
          const val = await this.env.CACHE.get(`${tenantId}:${key}`);
          return { value: val };
        }
      }
    };

    const system = `You are a helpful assistant for tenant "${tenantId}". Use tools when needed.\n\nContext:\n${ragContext}`;

    const messages = [
      { role: "system", content: system },
      ...history.map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content: body.message }
    ] as const;

    const result = await runWithTools(this.env.AI, "@cf/meta/llama-3.1-8b-instruct", {
      messages,
      tools,
      streamFinalResponse: true
    });

    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();

    const encoder = new TextEncoder();
    const writeEvent = async (event: string, data: unknown) => {
      await writer.write(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
    };

    (async () => {
      try {
        for await (const chunk of result) {
          if (chunk.type === "tool_call") {
            await writeEvent("tool_call", chunk);
            continue;
          }
          if (chunk.type === "tool_result") {
            await writeEvent("tool_result", chunk);
            continue;
          }
          if (chunk.type === "final_response") {
            await writeEvent("message", { content: chunk.response });
            this.appendMessage({ role: "assistant", content: chunk.response, createdAt: Date.now() });
          }
        }
        await writeEvent("done", { ok: true });
      } catch (err) {
        await writeEvent("error", { message: err instanceof Error ? err.message : String(err) });
      } finally {
        await writer.close();
      }
    })();

    return new Response(readable, {
      headers: {
        "content-type": "text/event-stream",
        "cache-control": "no-cache",
        connection: "keep-alive"
      }
    });
  }

  private appendMessage(message: StoredMessage) {
    this.sql.exec(
      "INSERT INTO messages(role, content, created_at) VALUES (?, ?, ?)",
      message.role,
      message.content,
      message.createdAt
    );
    this.sql.exec(
      "DELETE FROM messages WHERE id NOT IN (SELECT id FROM messages ORDER BY id DESC LIMIT ?)",
      MAX_MESSAGES
    );
  }

  private getRecentHistory(limit: number): StoredMessage[] {
    const rows = this.sql.exec<{
      role: Role;
      content: string;
      created_at: number;
    }>(
      "SELECT role, content, created_at FROM messages ORDER BY id DESC LIMIT ?",
      limit
    );

    return rows
      .map((r) => ({ role: r.role, content: r.content, createdAt: r.created_at }))
      .reverse();
  }

  private async getRagContext(query: string, tenantId: string): Promise<string> {
    const embeddings = await this.env.AI.run("@cf/baai/bge-base-en-v1.5", { text: [query] });
    const result = await this.env.VECTORS.query(embeddings.data[0], {
      topK: 3,
      returnValues: false,
      returnMetadata: "all",
      filter: { tenantId }
    });

    const snippets = (result.matches ?? [])
      .map((m) => (m.metadata && typeof m.metadata.text === "string" ? m.metadata.text : null))
      .filter((v): v is string => Boolean(v))
      .slice(0, 3);

    return snippets.join("\n---\n");
  }
}

function getTenantId(request: Request, env: Env): string | null {
  const headerTenant = request.headers.get("x-tenant-id")?.trim();
  if (headerTenant) return headerTenant;
  if (env.TENANT_ID) return env.TENANT_ID;
  return null;
}

function hashString(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) | 0;
  }
  return Math.abs(hash).toString(36);
}
