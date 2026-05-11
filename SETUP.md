# MYHUTAN — Developer Setup Guide

## What's been built

```
web/
  src/
    app/
      page.tsx                     Main map page (live events + filter bar)
      layout.tsx                   Root layout with SEO metadata
      api/events/route.ts          Events API endpoint (Supabase query)
    components/
      Map/
        MapView.tsx                Leaflet map (client-only, dynamic import)
        EventPanel.tsx             Right-side event detail panel
      Company/
        CompanyTag.tsx             Company tag with verification badge
        SourceCitation.tsx         Mandatory source citation component
      UI/
        VerificationBadge.tsx      Status badge (verified / disputed / community)
    lib/
      types.ts                     All TypeScript types + display configs
      supabase/client.ts           Browser Supabase client (singleton)
      supabase/server.ts           Server Supabase client (API routes)
      gfw/api.ts                   GFW Data API integration + tile URLs
  supabase/
    migrations/
      001_initial_schema.sql       Full schema with PostGIS, constraints, views
      002_rls_policies.sql         Row Level Security (public read, auth write)
      003_seed_companies.sql       5 seed companies + 5 sample events with sources
  .env.local.example               Environment variable template
```

---

## Step 1 — Set up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project.
   - Choose a region closest to Malaysia (Singapore `ap-southeast-1`).
   - Save your database password somewhere safe.

2. Enable PostGIS in your project:
   - Go to **Database → Extensions**
   - Enable `postgis`

3. Run the migrations in order:
   - Go to **SQL Editor** in the Supabase dashboard
   - Paste and run `001_initial_schema.sql`
   - Paste and run `002_rls_policies.sql`
   - Paste and run `003_seed_companies.sql` (adds 5 companies + 5 sample events)

4. Get your API keys:
   - Go to **Settings → API**
   - Copy **Project URL** and **anon public key**

---

## Step 2 — Configure environment variables

Copy `.env.local.example` to `.env.local` and fill in:

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

The GFW API token is optional for local dev — the map will work with the seed data in Supabase.

---

## Step 3 — Run locally

```bash
cd web
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

You should see:
- The Malaysia map with 5 sample deforestation event markers
- A filter bar (state, date range, company search)
- Clicking a marker opens the event detail panel
- The Sabah event shows a community-tagged company (FGV Holdings)

---

## Step 4 — Connect live GFW data (optional for v1)

Apply for a GFW Data API token at:
https://www.globalforestwatch.org/help/developers/

Once you have it, add to `.env.local`:
```env
GFW_API_TOKEN=your-token-here
```

Then create an ingestion script (suggested: a Supabase Edge Function or a nightly cron job) that:
1. Calls `fetchMalaysiaAlerts()` from `src/lib/gfw/api.ts`
2. Upserts results into the `forest_events` table using `gfw_alert_id` as the unique key
3. Runs on a schedule (weekly is sufficient for GLAD-L alerts)

---

## Step 5 — Deploy to Vercel

```bash
npx vercel deploy
```

Set the same environment variables in Vercel:
- **Vercel Dashboard → Settings → Environment Variables**
- Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## Key safeguards built into the codebase

| Safeguard | Where it lives | What it enforces |
|---|---|---|
| Mandatory source citation | `001_initial_schema.sql` | `source_id UUID NOT NULL` on every tag and concession record — no tag can be inserted without citing a source |
| Verification status | All tag tables | Every tag has `admin_verified / ngo_verified / community_unverified / disputed / retracted` |
| Source reliability tier | `sources` table | 1 = government filing, 2 = NGO/academic, 3 = news, 4 = community |
| No hard deletes | `event_company_tags` | Tags are never deleted — retraction sets `is_visible = false` and logs the reason |
| Dispute logging | `tag_disputes` table | Every dispute requires a reason (min 20 chars) and optionally a counter-source |
| Public RLS | `002_rls_policies.sql` | Anonymous users can read but not write; writes require authentication |
| Disputed tag warning | `CompanyTag.tsx` | UI shows a red warning banner for any disputed tag |
| Community tag labelling | `VerificationBadge.tsx` | Community tags are always visually distinguished from verified ones |

---

## Next features to build

1. **Company profile pages** (`/companies/[id]`) — deforestation timeline chart, all linked events, concession map
2. **Community tag submission form** — authenticated form with source URL validation
3. **Education section** (`/learn`) — 8 explainer articles targeting secondary school reading level
4. **Email alerts** — weekly digest for a specific state or company (Supabase + Resend)
5. **GFW data ingestion pipeline** — Supabase Edge Function running weekly to pull fresh GLAD alerts
6. **Social sharing cards** — OG image generation for each event (Vercel OG)

---

## Legal checklist before naming companies publicly

- [ ] Legal review of Malaysian defamation law (Defamation Act 1957) completed
- [ ] Methodology for company attribution documented and published
- [ ] All company tags sourced from official filings (Bursa Malaysia, RSPO, government records)
- [ ] "Community-submitted, unverified" label clearly visible on all non-admin tags
- [ ] Moderation workflow in place before enabling public tag submission
- [ ] Contact email published for companies to request corrections

---

## Data sources and references

| Source | Used for | License |
|---|---|---|
| [Global Forest Watch](https://www.globalforestwatch.org) | Forest loss alerts (GLAD/RADD) | CC BY 4.0 |
| [Bursa Malaysia](https://www.bursamalaysia.com) | Company filings, stock listings | Public record |
| [RSPO Member Database](https://rspo.org/members) | Palm oil certification status | Public record |
| [MPOB](https://www.mpob.gov.my) | Malaysian palm oil industry data | Public record |
| [OpenStreetMap](https://www.openstreetmap.org) | Base map tiles | ODbL |
| [Hutanwatch](https://hutanwatch.sains.com.my) | Malaysia forest boundary reference | NGO data |
