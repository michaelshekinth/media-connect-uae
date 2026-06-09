# Deploy API without Render GitHub connection

If Render shows **"No repo found"**, your Render account is not linked to GitHub `michaelshekinth`, or the Render GitHub App has no access to the repo.

## Option A — Public Git URL (no GitHub connect)

1. Go to [dashboard.render.com](https://dashboard.render.com)
2. Click **New +** → **Web Service**
3. Choose **Public Git repository** (not "Git Provider")
4. Paste exactly:
   ```
   https://github.com/michaelshekinth/media-connect-uae
   ```
5. Settings:
   - **Name:** `media-connect-api`
   - **Branch:** `main`
   - **Root Directory:** *(leave empty)*
   - **Runtime:** Node
   - **Build Command:** `npm install && npm run build:api`
   - **Start Command:** `npm run start:api`
   - **Plan:** Free
6. Add environment variable:
   - `MONGODB_URI` = your MongoDB Atlas connection string
7. Click **Create Web Service**

Health check: `https://YOUR-SERVICE.onrender.com/api/health`

## Option B — Fix GitHub on Render

1. Render Dashboard → **Account Settings** → **GitHub**
2. Connect GitHub as user **`michaelshekinth`** (same as repo owner)
3. Click **Configure** on the Render GitHub App → grant access to **`media-connect-uae`**
4. New → Blueprint → select repo

## Repo details

| | |
|---|---|
| URL | https://github.com/michaelshekinth/media-connect-uae |
| Owner | `michaelshekinth` |
| Branch | `main` |
| Visibility | Public |
