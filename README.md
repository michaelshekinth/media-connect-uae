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
4. After deploy, your API URL will be **`https://media-connect-api.onrender.com`** (health: `/api/health`).

> Render free services sleep after ~15 min idle; the first request after sleep may take 30–60s.

### Deploy frontends to Vercel

Create **three Vercel projects** from the same GitHub repo:

| Vercel project | Root directory | Build |
|----------------|----------------|-------|
| `media-connect-uae` | `advertisers` | `vite build --config advertisers/vite.config.ts` |
| `media-owner` | `media-owner` | `vite build --config media-owner/vite.config.ts` |
| `super-admin` | `super-admin` | `vite build --config super-admin/vite.config.ts` |

**All three frontends** need this env var:

```env
VITE_API_URL=https://media-connect-api.onrender.com
```

(No trailing slash — points to the Render API.)

### Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Advertiser app on :5173 |
| `npm run dev:owner` | Media owner app on :5175 |
| `npm run dev:admin` | Super admin on :5174 |
| `npm run dev:api` | Express API on :4000 |
| `npm run dev:all` | All four services concurrently |
| `npm run seed` | Seed admin user + platform config |
| `npm run build` | Build all three frontends |
| `npm run build:api` | Compile server TypeScript |
