# Open AI UGC

> Open-source alternative to **[Arcads](https://www.arcads.ai)** and **[MakeUGC](https://www.makeugc.com)** for generating AI UGC video ads.

Open AI UGC is a self-hostable, production-ready studio for creating scroll-stopping AI UGC (user-generated content) video ads. Plug in a script, pick a model, and ship realistic AI-actor videos for TikTok, Reels, and Shorts — without paying per-seat SaaS pricing or being locked into a single vendor's actor library.

Built with Next.js 16, React 19, Prisma, NextAuth, and Stripe. Video generation is powered by [MUAPI](https://muapi.ai), giving you instant access to the best image-to-video and text-to-video models on the market: **Veo 3.1**, **Seedance 2**, **Grok Video**, and **Happy Horse 1**.

---

## Why Open AI UGC?

| | Arcads / MakeUGC | **Open AI UGC** |
|---|---|---|
| Pricing | $110–$500+/mo per seat | Pay only for API generations |
| Actor library | Locked to vendor's roster | Bring your own — upload any face/product image |
| Model choice | Single in-house model | Veo 3.1, Seedance 2, Grok Video, Happy Horse 1 (swap per render) |
| Hosting | SaaS only | Self-host on Vercel / your own infra |
| Source code | Closed | MIT-friendly, fully customizable |
| Branding | Vendor watermark / templates | 100% your brand, your domain |

If you've ever wanted Arcads-style AI UGC ads but with model choice, lower costs, and full ownership of the stack — this is for you.

---

## Features

- **AI UGC video ads in minutes** — paste a script, upload a reference image, generate a 9:16 vertical ad
- **Multi-model support** — switch between Veo 3.1, Seedance 2, Grok Video, and Happy Horse 1 from a single UI
- **Image-to-video & text-to-video** — upload up to 7 reference images (faces, products, scenes) and reference them inline with `@image1`, `@image2`, etc.
- **Per-model parameter control** — aspect ratio, duration, resolution, mode (fun / normal / spicy for Grok)
- **Credits & billing built in** — Stripe checkout, webhooks, and a 3-tier pricing page out of the box
- **Google sign-in** — NextAuth with Prisma adapter, ready to go
- **Async job pipeline** — MUAPI webhook delivers finished renders; the dashboard polls and updates live
- **Creations dashboard** — history of every generation per user

---

## Tech Stack

- **Framework:** Next.js 16 (App Router) + React 19
- **Styling:** Tailwind CSS v4 + Framer Motion
- **Auth:** NextAuth.js (Google provider) + Prisma adapter
- **Database:** PostgreSQL via Prisma 7
- **Payments:** Stripe Checkout + webhooks
- **AI video:** [MUAPI](https://muapi.ai) (Veo 3.1, Seedance 2, Grok Video, Happy Horse 1)

---

## Quick Start

### 1. Clone & install

```bash
git clone https://github.com/<your-username>/open-ai-ugc.git
cd open-ai-ugc
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and fill in:

```env
# Database (Postgres — Supabase, Neon, Railway, etc.)
DATABASE_URL="postgresql://user:password@host:port/dbname"
DIRECT_URL="postgresql://user:password@host:port/dbname"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="run: openssl rand -base64 32"

# Google OAuth (https://console.cloud.google.com/apis/credentials)
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# MUAPI — get a key at https://muapi.ai
UGC_API_KEY="your_muapi_key"
WEBHOOK_URL="https://your-deployment-url.com"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

### 3. Push the schema & run

```bash
npx prisma db push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in with Google. Every new user starts with 10 credits.

---

## How It Works

1. **User writes a script** and uploads up to 7 reference images (e.g., an actor photo + a product shot).
2. **Frontend** (`src/app/page.js`) sends the prompt, settings, and image URLs to `/api/generate`.
3. **`/api/generate`** validates credits, calls the selected MUAPI model endpoint, stores a `Creation` row with `status: "processing"`, and decrements 1 credit.
4. **MUAPI** runs the render asynchronously and calls `/api/webhook/muapi` when done.
5. **Webhook handler** updates the `Creation` row with the finished video URL and status.
6. **Frontend polls** `/api/creations/[id]` every 3s until status changes, then plays the video inline.

---

## Project Structure

```
src/
├── app/
│   ├── page.js                 # Main generator UI
│   ├── dashboard/page.js       # User's creation history
│   ├── pricing/page.js         # Stripe-powered pricing
│   └── api/
│       ├── generate/           # Kick off a generation
│       ├── upload/             # Image uploads
│       ├── creations/          # List & fetch creations
│       ├── webhook/muapi/      # Async render callback
│       ├── webhook/stripe/     # Credit top-up on payment
│       └── checkout/stripe/    # Stripe Checkout session
├── components/
│   ├── saas/Navbar.jsx
│   └── ...
└── lib/
    ├── auth.js                 # NextAuth config
    └── prisma.js
prisma/
└── schema.prisma               # User, Creation, Account, Session
```

---

## Supported Models

| Model | Use case | Aspect ratios | Max duration |
|---|---|---|---|
| **Veo 3.1** | High-fidelity, realistic motion (best for premium ads) | 16:9, 9:16 | 8s |
| **Seedance 2** | Character-reference video, multi-shot | 21:9, 16:9, 4:3, 1:1, 3:4, 9:16 | 15s |
| **Grok Video** | Fast, expressive, "spicy" mode for hooks | 9:16, 16:9, 2:3, 3:2, 1:1 | 30s |
| **Happy Horse 1** | Lifelike animation, fast iteration | 16:9, 9:16, 1:1, 4:3, 3:4 | 15s |

Adding a new MUAPI model takes ~10 lines in `src/app/page.js` (add to the `MODELS` array) and one line in `src/app/api/generate/route.js` (add to `MODEL_ENDPOINTS`).

---

## Deploy

The easiest path is **Vercel + Neon/Supabase + Stripe**:

1. Push the repo to GitHub.
2. Import into Vercel and add all env vars from `.env.example`.
3. Set `WEBHOOK_URL` to your Vercel deployment URL.
4. In the Stripe dashboard, point a webhook at `https://<your-domain>/api/webhook/stripe` and copy the signing secret into `STRIPE_WEBHOOK_SECRET`.
5. In MUAPI, set the webhook URL to `https://<your-domain>/api/webhook/muapi`.

---

## Roadmap Ideas

- AI script generator (GPT/Claude-powered hook writer)
- Voiceover + lip-sync stage (ElevenLabs / Sync.so)
- Multi-variant batch generation (A/B test 20 hooks at once)
- Built-in actor library (preset reference faces)
- TikTok / Meta Ads direct publish
- Team workspaces & seat management

PRs welcome.

---

## Suggested GitHub Topics

When publishing the repo, add these topics so it surfaces for the right audience:

```
ai-ugc  ugc-ads  ai-actors  ai-video-ads  arcads-alternative  makeugc-alternative
ai-video-generator  text-to-video  image-to-video  veo-3  seedance  grok-video
muapi  nextjs  saas-template  stripe  ai-marketing  user-generated-content
```

---

## License

MIT — fork it, rebrand it, ship it.
