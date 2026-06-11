# MediaConnect UAE

UAE marketplace connecting advertisers with verified media owners.

## Repository structure

```
media-connect-uae/
├── advertisers/      # Advertiser marketplace (browse, quotes, dashboard)
├── media-owner/      # Media owner portal (listings, RFQs, onboarding)
├── super-admin/      # Platform super admin panel
├── server/           # Express + MongoDB REST API
├── shared/           # Shared types, services, hooks, and styles
└── public/           # Static assets (hero videos, icons)
```

## Development

### Prerequisites

- Node.js 20+
- MongoDB (local via Docker, or a cluster URI)

### Setup

```bash
npm install
cp .env.example .env
```

**Local MongoDB (recommended):**

```bash
docker compose up -d
```

If `MONGODB_URI` is unset, the API falls back to in-memory MongoDB for zero-install dev.

**Seed super admin + platform config:**

```bash
npm run seed
```

### Run all services

```bash
npm run dev:all
```

| Service | Folder | URL |
|---------|--------|-----|
| Advertisers | `advertisers/` | http://localhost:5173 |
| Media owners | `media-owner/` | http://localhost:5175 |
| Super admin | `super-admin/` | http://localhost:5174 |
| REST API | `server/` | http://localhost:4000 |

All frontends proxy `/api` to the API on port 4000.

### Three separate login portals

| Portal | URL | Notes |
|--------|-----|-------|
| **Advertiser** | http://localhost:5173/login | Sign up to browse and request quotes |
| **Media owner** | http://localhost:5175/login | Sign up, complete onboarding, then create listings |
| **Super admin** | http://localhost:5174/login | `admin@mediaconnect.ae` / `admin123` (created by `npm run seed`) |

The marketplace starts with an empty catalog. Media owners sign up, complete onboarding, and submit listings for admin approval.

### Environment variables

```env
MONGODB_URI=mongodb://localhost:27017/mediaconnect
JWT_SECRET=your-dev-secret
API_PORT=4000
```

Optional portal URLs (defaults work for local dev):

```env
VITE_ADVERTISER_URL=http://localhost:5173
VITE_MEDIA_OWNER_URL=http://localhost:5175
VITE_ADMIN_URL=http://localhost:5174
```

### Deploy API to Render (free tier)

1. Create a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster and copy the connection string.
2. Open [Deploy to Render](https://render.com/deploy?repo=https://github.com/michaelshekinth/media-connect-uae) (uses `render.yaml` in this repo).
3. Set **`MONGODB_URI`** when prompted (`JWT_SECRET` is auto-generated).
4. After deploy, your API URL will be **`https://media-connect-uae.onrender.com`** (health: `/api/health`).

> Render free services sleep after ~15 min idle; the first request after sleep may take 30–60s.

### Deploy frontends to Vercel

Create **three Vercel projects** from the same GitHub repo (repo root as project root). Each project uses its own `vercel.json`:

| Vercel project | Config file | Production URL |
|----------------|-------------|----------------|
| `media-connect-uae` | `vercel.json` (root) | https://media-connect-uae.vercel.app |
| `media-owner` | `media-owner/vercel.json` | https://media-owner.vercel.app |
| `super-admin` | `super-admin/vercel.json` | https://super-admin-seven-beta.vercel.app |

Deploy owner/admin with API URL baked in:

```bash
VITE_API_URL=https://media-connect-uae.onrender.com npx vercel build --prod --local-config media-owner/vercel.json
npx vercel deploy --prebuilt --prod --local-config media-owner/vercel.json
```

**All three frontends** need this env var on Vercel (Production):

```env
VITE_API_URL=https://media-connect-uae.onrender.com
```

(No trailing slash — points to the Render API.)

### Test accounts (E2E)

Seed repeatable demo users (does not run on server boot):

```bash
npm run seed:demo              # approved owner, ready for listings
npm run seed:demo -- --reset-flow   # owner back to submitted, clears test data
```

| Role | Email | Password |
|------|-------|----------|
| Super admin | `admin@mediaconnect.ae` | `admin123` |
| Advertiser | `test.advertiser@media.ae` | `TestMedia2026!` |
| Media owner | `test.owner@media.ae` | `TestMedia2026!` |

**Production warning:** `seed:demo` is for local/E2E only. Never run it against a production database — it creates known passwords.

After deploying taxonomy changes:

```bash
npm run migrate:categories
npm run migrate:lead-status
```

### E2E tests (Playwright)

```bash
npm install
npx playwright install chromium
npm run dev:all          # for local full flow
npm run test:e2e:smoke   # production smoke (Vercel + Render)
npm run test:e2e:local   # full marketplace flow on localhost
npm run test:e2e         # both
```

### Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Advertiser app on :5173 |
| `npm run dev:owner` | Media owner app on :5175 |
| `npm run dev:admin` | Super admin on :5174 |
| `npm run dev:api` | Express API on :4000 |
| `npm run dev:all` | All four services concurrently |
| `npm run seed` | Seed admin user + platform config |
| `npm run seed:demo` | Seed E2E test advertiser + media owner (local only) |
| `npm run migrate:categories` | Migrate listings to 5-category taxonomy + seed subcategories |
| `npm run migrate:lead-status` | Normalize legacy quote/lead status values |
| `npm run test:e2e` | Playwright smoke + local full flow |
| `npm run build` | Build all three frontends |
| `npm run build:owner` | Build media owner app only |
| `npm run build:admin` | Build super admin app only |
| `npm run build:api` | Compile server TypeScript |
