# Distribuia

Convert YouTube videos, articles, and text into native Spanish social media posts.

**Website:** [distribuia.es](https://distribuia.es)
**Company:** Paragonum S.L.U., Valencia, Spain

## What It Does

Distribuia takes content in Spanish (or English) and generates ready-to-publish posts for:

- **X (Twitter) threads** — 5-10 tweet threads with hooks and CTAs
- **LinkedIn posts** — Optimized for the LinkedIn algorithm
- **LinkedIn articles** — Long-form structured content

### Input Sources
- YouTube video URLs (transcript extraction)
- Article/blog URLs (content parsing)
- Raw text (paste anything)

### Tone Options
- **Profesional** — Formal, data-driven, authoritative
- **Cercano** — Warm, conversational, approachable
- **Tecnico** — Industry jargon, detailed, expert
- **Inspirador** — Motivational, story-driven, emotional

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router, TypeScript) |
| Database | Supabase (PostgreSQL + Auth + RLS) |
| Payments | Stripe (subscriptions) |
| AI | Groq (Llama 3.1 70B) |
| Email | Resend |
| Hosting | Vercel |
| Styling | Tailwind CSS |
| Error Tracking | Sentry |
| Rate Limiting | Upstash Redis |

## Pricing

| Plan | Price | Monthly Conversions |
|------|-------|---------------------|
| Free | €0 | 2 (watermarked) |
| Starter | €19/mo | 10 |
| Pro | €49/mo | 30 |

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Type check
npx tsc --noEmit

# Lint
npm run lint

# Build
npm run build
```

## Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_STARTER_PRICE_ID=
STRIPE_PRO_PRICE_ID=

# Groq AI
GROQ_API_KEY=

# Email
RESEND_API_KEY=

# App
NEXT_PUBLIC_APP_URL=
CRON_SECRET=

# Optional
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
NEXT_PUBLIC_SENTRY_DSN=
SITE_ACCESS_TOKEN=
```

## Project Structure

```
app/
├── (app)/           # Authenticated pages (dashboard, history, billing, settings)
├── (auth)/          # Auth pages (login, register, signup)
├── (marketing)/     # Legal pages (aviso-legal, privacidad, terminos)
├── api/             # API routes (convert, stripe, cron, account)
└── page.tsx         # Landing page

lib/
├── config/          # Plan limits, feature flags
├── email/           # Email templates and sending
├── groq/            # AI prompts and client
├── supabase/        # Supabase client (server/client/admin)
├── validations.ts   # Zod schemas
├── errors.ts        # Custom error classes
├── ratelimit.ts     # Upstash rate limiting
└── logger.ts        # Structured logging

components/
├── ui/              # Shared UI components
└── cookie-consent   # GDPR cookie banner
```

## Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npx jest path/to/test.ts
```

**Current:** 36 test suites, 716 tests — all passing.

## Legal Compliance

- LSSI (Ley 34/2002) — Aviso Legal with full company identification
- GDPR — Privacy policy, data export, account deletion, email unsubscribe
- Art. 103.m RDL 1/2007 — Withdrawal waiver for digital services
- Cookie consent — Essential cookies only
