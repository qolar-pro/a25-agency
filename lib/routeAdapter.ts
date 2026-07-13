// Adapter that lets the shared lib/*.ts handlers — written against an
// Express/Vercel-style (req, res) pair — run unchanged inside Next.js App
// Router Route Handlers (which receive a Web `Request` and must return a Web
// `Response`). This is the "different entry point" referred to in the build
// plan: lib/*.ts stays the single source of truth, this just bridges the
// calling convention.

type SharedHandler = (req: any, res: any) => unknown | Promise<unknown>;

export async function runSharedHandler(request: Request, handler: SharedHandler): Promise<Response> {
  const method = request.method.toUpperCase();

  // Query params (used by e.g. GET /api/chat-messages).
  const url = new URL(request.url);
  const query: Record<string, string> = {};
  url.searchParams.forEach((value, key) => {
    query[key] = value;
  });

  // JSON body for methods that carry one. The lib handlers all expect an
  // already-parsed object on req.body (just like Vercel/Express give them).
  let body: unknown;
  if (method !== 'GET' && method !== 'HEAD') {
    try {
      const raw = await request.text();
      body = raw ? JSON.parse(raw) : undefined;
    } catch {
      body = undefined;
    }
  }

  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });

  const req = { method, url: request.url, query, body, headers };

  // Minimal res shim capturing status + payload. The lib handlers finish by
  // calling res.json(...) (sometimes after res.status(...)), so after the
  // handler resolves we build the real Response from what it captured.
  let statusCode = 200;
  let payload: unknown;
  let hasPayload = false;

  const res = {
    status(code: number) {
      statusCode = code;
      return this;
    },
    json(obj: unknown) {
      payload = obj;
      hasPayload = true;
      return this;
    },
    send(obj: unknown) {
      payload = obj;
      hasPayload = true;
      return this;
    },
    end() {
      return this;
    },
    setHeader() {
      return this;
    },
  };

  await handler(req, res);

  if (!hasPayload) {
    return new Response(null, { status: statusCode });
  }
  return Response.json(payload, { status: statusCode });
}
