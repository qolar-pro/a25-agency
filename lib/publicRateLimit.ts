// Abuse throttling for the public endpoints: the contact form, the chat widget
// and the Priority Line flow.
//
// These were completely unthrottled. Anyone could flood them to fill the lead
// archive with junk, burn the Resend sending quota, spam the owners' Telegram
// and run up Neon usage. That got worse once submissions started persisting —
// junk now lands in the permanent record, not just an inbox.
//
// FAILS OPEN, which is the opposite of lib/archive/rateLimit.ts. That asymmetry
// is deliberate:
//   • /admin guards other people's personal data, so if the limiter can't do its
//     job the safe answer is to deny.
//   • These endpoints ARE the business. If Redis is unreachable, rejecting a
//     real candidate's application is worse than letting an abuser through, so
//     the safe answer is to allow.
//
// Per-IP only, with no global cap — a global cap here would let one abuser lock
// out every genuine visitor, which is a denial-of-service handed to the
// attacker rather than taken from them.
//
// Vercel overwrites x-forwarded-for with the real client IP and does not
// forward externally-supplied values, so the key can't be spoofed.

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

// Limits are set well above real human behaviour — a candidate submits once,
// maybe twice after a typo; a live chat runs to a dozen or so messages. Anyone
// hitting these is not filling in a form by hand.
export const LIMITS = {
  submit: { max: 5, windowSeconds: 60 * 60 },
  chat: { max: 30, windowSeconds: 60 * 60 },
  // Covers both Priority Line steps from one budget. Set to 10 rather than 5
  // because a single honest run spends several: submit, request a fresh code,
  // mistype it once, then verify.
  priority: { max: 10, windowSeconds: 60 * 60 }
} as const;

export type PublicLimitKind = keyof typeof LIMITS;

const memory = ((globalThis as any).__a25PublicRateLimit ??= new Map<
  string,
  { count: number; expires: number }
>()) as Map<string, { count: number; expires: number }>;

let redisClient: any = null;
async function getRedis() {
  if (!redisClient) {
    const { Redis } = await import("@upstash/redis");
    redisClient = new Redis({ url: UPSTASH_URL!, token: UPSTASH_TOKEN! });
  }
  return redisClient;
}

// Whether Upstash has proven able to record hits. A read-only token returns
// NOPERM on incr — see the same guard in lib/archive/rateLimit.ts, which was
// found silently counting nothing while still reporting "allowed".
let upstashWritable = !!(UPSTASH_URL && UPSTASH_TOKEN);

export function clientIp(headers: Record<string, string | undefined>): string {
  const fwd = headers["x-forwarded-for"];
  if (fwd) return fwd.split(",")[0].trim();
  return headers["x-real-ip"]?.trim() || "unknown";
}

export interface PublicLimitVerdict {
  allowed: boolean;
  retryAfterSeconds: number;
}

// Records the hit and reports whether it should be served. One call per request.
export async function consume(
  kind: PublicLimitKind,
  ip: string
): Promise<PublicLimitVerdict> {
  const { max, windowSeconds } = LIMITS[kind];
  const key = `public:rl:${kind}:${ip}`;

  if (upstashWritable) {
    try {
      const redis = await getRedis();
      const count = await redis.incr(key);
      // Window starts at the first hit and is not extended by later ones.
      if (count === 1) await redis.expire(key, windowSeconds);
      if (count > max) {
        const ttl = await redis.ttl(key);
        return { allowed: false, retryAfterSeconds: ttl > 0 ? ttl : windowSeconds };
      }
      return { allowed: true, retryAfterSeconds: 0 };
    } catch (err) {
      upstashWritable = false;
      console.error(
        `[A25 RateLimit] Upstash unavailable for ${kind}; falling back to ` +
          `per-instance counting. Visitors are NOT blocked by this.`,
        err
      );
    }
  }

  const now = Date.now();
  const entry = memory.get(key);
  if (!entry || entry.expires < now) {
    memory.set(key, { count: 1, expires: now + windowSeconds * 1000 });
    return { allowed: true, retryAfterSeconds: 0 };
  }
  entry.count += 1;
  if (entry.count > max) {
    return { allowed: false, retryAfterSeconds: Math.ceil((entry.expires - now) / 1000) };
  }
  return { allowed: true, retryAfterSeconds: 0 };
}

// One-line guard for a Route Handler. Returns a 429 Response to return
// immediately, or null to carry on.
export async function guard(
  request: Request,
  kind: PublicLimitKind
): Promise<Response | null> {
  const headers: Record<string, string> = {};
  request.headers.forEach((v, k) => {
    headers[k] = v;
  });
  const verdict = await consume(kind, clientIp(headers));
  return verdict.allowed ? null : tooManyRequests(verdict.retryAfterSeconds);
}

// The 429 sent to a throttled caller. Deliberately vague and non-alarming: a
// real person who somehow trips this should read it as "try again shortly",
// not as an accusation.
export function tooManyRequests(retryAfterSeconds: number): Response {
  return Response.json(
    {
      success: false,
      message: "Too many requests. Please wait a moment and try again."
    },
    { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } }
  );
}
