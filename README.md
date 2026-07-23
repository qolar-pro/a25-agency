# A25 — Bilateral Workforce Sourcing

Marketing site for **a25.mk** — a bilateral worker-sourcing agency placing seasonal and permanent labor across 7 industries between North Macedonia and EU/Balkan markets.

**Stack:** Next.js 15 App Router · React 19 · TypeScript · Tailwind v4 · Upstash Redis · Resend · Telegram Bot API

## Local dev

```bash
cp .env.example .env   # fill in your keys
npm install
npm run dev            # http://localhost:3000
```

## Environment variables

See `.env.example` for the full list. Required for full functionality: `RESEND_API_KEY`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`.

## Languages

8 supported: EN · MK · AL · DE · ES · EL · PL · SV. Translation files: `src/translations/`.
