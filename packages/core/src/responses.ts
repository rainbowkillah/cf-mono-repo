export function json(data: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...(init?.headers ?? {}),
    },
  });
}

export function notFound(): Response {
  return new Response("Not Found", { status: 404 });
}

export function unauthorized(): Response {
  return new Response("Unauthorized", { status: 401 });
}