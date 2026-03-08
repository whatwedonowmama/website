# whatwedonowmama — Setup Guide
## Go from zero to live in 4 steps

---

## Step 1 — Create your accounts (do these first)

### Supabase (database + auth)
1. Go to **supabase.com** → Sign Up (free)
2. New Project → name it `whatwedonowmama` → set a strong DB password (save it)
3. Wait ~2 min for the project to provision
4. Go to **Settings → API** → copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)
5. Go to **SQL Editor → New Query** → paste the contents of `supabase/schema.sql` → Run

### Stripe (payments)
1. Go to **stripe.com** → Create account
2. Dashboard is in **Test Mode** by default — stay in test mode until you're ready to launch
3. **Developers → API Keys** → copy:
   - Publishable key → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - Secret key → `STRIPE_SECRET_KEY`
4. **Products → Add Product**:
   - Name: `whatwedonowmama Plus`
   - Price: `$7.00` / month, recurring
   - Add a free trial: `7 days`
   - Copy the **Price ID** → `STRIPE_PLUS_PRICE_ID`
5. After deploying, set up the webhook (see Step 3)

### Vercel (hosting)
1. Go to **vercel.com** → Sign Up with GitHub
2. Push this project to a GitHub repo first (see below)
3. New Project → Import your GitHub repo → Framework: **Next.js** → Deploy
4. Add all environment variables in Vercel → Settings → Environment Variables

### Resend (transactional email)
1. Go to **resend.com** → Sign Up (free — 3,000 emails/month)
2. Add your domain `whatwedonowmama.com` and verify DNS records
3. API Keys → Create API Key → `RESEND_API_KEY`

---

## Step 2 — Local development

```bash
# Clone your repo
git clone https://github.com/YOUR_USERNAME/whatwedonowmama.git
cd whatwedonowmama/website

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local and fill in all values from Step 1

# Run locally
npm run dev
# Open http://localhost:3000
```

---

## Step 3 — Set up Stripe webhook

Stripe needs to notify your site when payments happen (trial→active, cancellations, etc.)

**Local testing:**
```bash
# Install Stripe CLI: https://stripe.com/docs/stripe-cli
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
# Copy the webhook signing secret → STRIPE_WEBHOOK_SECRET in .env.local
```

**Production:**
1. Stripe Dashboard → **Developers → Webhooks → Add Endpoint**
2. URL: `https://whatwedonowmama.com/api/webhooks/stripe`
3. Events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
4. Copy the **Signing Secret** → `STRIPE_WEBHOOK_SECRET` in Vercel env vars

---

## Step 4 — Connect your domain

1. **Vercel → your project → Settings → Domains → Add**
2. Type: `whatwedonowmama.com` → Add
3. Vercel gives you 2 DNS records to add at your registrar (Namecheap, GoDaddy, etc.)
4. Add both records → wait up to 48 hours for DNS propagation
5. Vercel auto-provisions SSL — no action needed

---

## Step 5 — Set yourself as admin

After creating your first account on the live site:

1. Go to **Supabase → Table Editor → users**
2. Find your row by email
3. Set `role` to `admin`
4. Now you can access `/admin`

---

## Step 6 — Add events data

The events pages read from `oc_events_latest.json` in the parent directory.
Make sure the events scraper is running and the output file exists.

```bash
# From the whatwedonowmama root (not /website)
python3 events_scraper.py

# This creates oc_events_latest.json which the Next.js site reads
```

For production on Vercel, the events JSON needs to be accessible at build time OR served as an API.
**Recommended approach**: Store events in the Supabase `events` table instead of JSON files for production.
The admin panel's Events Manager (Phase 2) handles this.

---

## Post-launch checklist

- [ ] Replace placeholder Privacy Policy at `/privacy` with a real one (use Termly or iubenda)
- [ ] Replace placeholder Terms of Service at `/terms`
- [ ] Add permanent Discord invite URL to `DISCORD_INVITE_URL` env var
- [ ] Set up Google Search Console → verify domain → submit `/sitemap.xml`
- [ ] Switch Stripe from Test Mode to Live Mode
- [ ] Publish at least 8–10 resources before going public
- [ ] Set yourself as admin in Supabase
- [ ] Test the full signup → checkout → webhook → tier upgrade flow end-to-end
- [ ] Test on a real phone (mobile-first!)

---

## File structure reference

```
website/
├── app/
│   ├── page.tsx                    ← Home (mobile-first)
│   ├── events/page.tsx             ← This Week in OC
│   ├── resources/page.tsx          ← Resource hub
│   ├── resources/[slug]/page.tsx   ← Individual article
│   ├── about/page.tsx              ← Our Story
│   ├── privacy/page.tsx            ← Privacy Policy
│   ├── terms/page.tsx              ← Terms of Service
│   ├── login/page.tsx              ← Login
│   ├── signup/page.tsx             ← Signup (Free or Plus)
│   ├── dashboard/page.tsx          ← Member dashboard
│   ├── members/
│   │   ├── resources/page.tsx      ← Full resource library
│   │   ├── events/history/page.tsx ← Past events archive
│   │   └── community/page.tsx      ← Discord gateway
│   ├── account/page.tsx            ← Account settings
│   ├── admin/page.tsx              ← Admin dashboard
│   └── api/
│       ├── auth/callback/route.ts  ← Supabase magic link handler
│       ├── checkout/route.ts       ← Create Stripe checkout session
│       ├── billing-portal/route.ts ← Open Stripe Customer Portal
│       └── webhooks/stripe/route.ts ← Stripe event handler
├── components/
│   ├── Nav.tsx         ← Site navigation (mobile hamburger included)
│   ├── Footer.tsx      ← Site footer
│   ├── EventCard.tsx   ← Event display card
│   ├── ResourceCard.tsx ← Resource card (locked state included)
│   └── UpgradeCTA.tsx  ← Upgrade prompt (card/banner/inline variants)
├── lib/
│   ├── supabase/client.ts  ← Browser Supabase client
│   ├── supabase/server.ts  ← Server Supabase client + getUser()
│   ├── stripe.ts           ← Stripe client + checkout helpers
│   ├── types.ts            ← TypeScript types
│   └── utils.ts            ← Helpers (cn, formatDate, getWeekRange)
├── supabase/schema.sql     ← Run this in Supabase SQL Editor
├── middleware.ts           ← Auth route protection
├── .env.local.example      ← Copy to .env.local and fill in values
└── SETUP.md                ← This file
```
