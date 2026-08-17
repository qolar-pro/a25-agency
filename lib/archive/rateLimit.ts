// Brute-force protection for the /admin sign-in.
//
// Without this the login is one password away from 37 people's names, phone
// numbers and passport status, guarded only by a 600ms delay on failure — which
// still permits tens of thousands of guesses a day, and far more in parallel.
//
// TWO COUNTERS, deliberately:
//   • per-IP — stops one host hammering the form.
//   • global — a per-IP limit alone is defeated by spreading guesses across
//     many addresses, which is cheap to do. The global cap is set high enough
//     that Boris signing in normally can never trip it, but low enough that a
//     distributed attempt runs out long before the password space does.
//
// Only FAILED attempts count. A successful sign-in clears the IP's counter, so
// normal use never accumulates toward a lockout.
//
// Backed by the same Upstash Redis the rest of the app uses — no new service.
// Falls back to an in-process Map when Upstash isn't configured, which is fine
// for local dev and, as with the other stores, cannot work across serverless
// invocations in production. If Upstash is somehow unreachable in production the
// limiter FAILS CLOSED (denies the attempt) rather than silently disabling
// itself — the opposite of the fail-open rule used for visitor-facing writes,
// because here the downside of failing open is an unthrottled login.

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const useUpstash = !!(UPSTASH_URL && UPSTASH_TOKEN);

export const MAX_ATTEMPTS_PER_IP = 5;
export const WINDOW_SECONDS = 15 * 60;
export const MAX_ATTEMPTS_GLOBAL = 50;

const memory = ((globalThis as any).__a25AdminRateLimit ??= new Map<
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

const ipKey = (ip: string) => `admin:rl:ip:${ip}`;
const globalKey = () => `admin:rl:global`;

// Whether the Upstash path has proven itself unusable this process. Set the
// first time a write is rejected — which is exactly what a READ-ONLY token
// does (NOPERM on incr/del), and that is not a hypothetical: the token used
// during development was read-only, and the limiter silently counted nothing
// while still reporting "allowed". A limiter that cannot record failures is
// not a limiter, so once writes are known-broken every operation moves to the
// in-process counter, which at least throttles per instance.
let upstashWritable = useUpstash;

function memoryRead(key: string): number {
  const entry = memory.get(key);
  if (!entry || entry.expires < Date.now()) return 0;
  return entry.count;
}

function memoryBump(key: string): void {
  const now = Date.now();
  const entry = memory.get(key);
  if (!entry || entry.expires < now) {
    memory.set(key, { count: 1, expires: now + WINDOW_SECONDS * 1000 });
  } else {
    entry.count += 1;
  }
}

async function readCount(key: string): Promise<number> {
  if (upstashWritable) {
    const redis = await getRedis();
    // Take whichever is higher: a process that fell back mid-window still has
    // local counts that must not be discarded.
    return Math.max(Number((await redis.get(key)) ?? 0), memoryRead(key));
  }
  return memoryRead(key);
}

async function bump(key: string): Promise<void> {
  if (upstashWritable) {
    try {
      const redis = await getRedis();
      const n = await redis.incr(key);
      // Set the window only on the first failure, so the window is a fixed 15
      // minutes from the first bad attempt rather than being extended by each
      // subsequent one (which would let a slow trickle lock someone out forever).
      if (n === 1) await redis.expire(key, WINDOW_SECONDS);
      return;
    } catch (err) {
      upstashWritable = false;
      console.error(
        "[A25 Admin] Upstash cannot record login failures (read-only token or " +
          "outage). Falling back to per-instance rate limiting — protection is " +
          "weaker across serverless instances. Fix the token.",
        err
      );
    }
  }
  memoryBump(key);
}

// Best-effort client IP. Vercel sets x-forwarded-for; the leftmost entry is the
// original client. Falls back to a constant so a request with no usable address
// is still counted rather than escaping the limiter entirely.
export function clientIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

export interface RateLimitVerdict {
  allowed: boolean;
  /** How many attempts remain for this IP before lockout. */
  remaining: number;
  /** True when the GLOBAL cap tripped rather than this IP's own. */
  global?: boolean;
}

export async function checkRateLimit(ip: string): Promise<RateLimitVerdict> {
  try {
    const [ipCount, globalCount] = await Promise.all([
      readCount(ipKey(ip)),
      readCount(globalKey())
    ]);
    if (globalCount >= MAX_ATTEMPTS_GLOBAL) {
      return { allowed: false, remaining: 0, global: true };
    }
    if (ipCount >= MAX_ATTEMPTS_PER_IP) {
      return { allowed: false, remaining: 0 };
    }
    return { allowed: true, remaining: MAX_ATTEMPTS_PER_IP - ipCount };
  } catch (err) {
    // Fail closed — see the header note.
    console.error("[A25 Admin] Rate-limit check failed; denying attempt:", err);
    return { allowed: false, remaining: 0 };
  }
}

export async function registerFailure(ip: string): Promise<void> {
  try {
    await Promise.all([bump(ipKey(ip)), bump(globalKey())]);
  } catch (err) {
    console.error("[A25 Admin] Could not record failed attempt:", err);
  }
}

export async function clearFailures(ip: string): Promise<void> {
  try {
    memory.delete(ipKey(ip));
    if (upstashWritable) {
      const redis = await getRedis();
      await redis.del(ipKey(ip));
    }
  } catch (err) {
    console.error("[A25 Admin] Could not clear attempt counter:", err);
  }
}
