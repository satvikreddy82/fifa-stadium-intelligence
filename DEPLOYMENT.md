# 🚀 Deployment Guide — FIFA StadiumIQ 2026

## Deploy to Vercel (Recommended — Free)

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "feat: initial FIFA StadiumIQ 2026"
git remote add origin https://github.com/yourusername/fifa-stadiumiq-2026.git
git push -u origin main
```

### Step 2: Import to Vercel
1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Vercel auto-detects Next.js — no configuration needed

### Step 3: Environment Variables
In Vercel dashboard → Settings → Environment Variables, add:

| Variable | Value | Required |
|----------|-------|----------|
| `GEMINI_API_KEY` | Your Gemini API key | For real AI |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase URL | For auth/DB |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | For auth/DB |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service key | Server-side |

> **Note:** App works in demo mode without any API keys!

### Step 4: Deploy
Click **"Deploy"** — that's it! Your app is live at `your-project.vercel.app`.

---

## Alternative: Netlify (Free)

```bash
npm run build
# Deploy the .next folder to Netlify
```

## Local Development

```bash
npm install
npm run dev       # http://localhost:3000
```

## Production Build

```bash
npm run build
npm run start
```

## Getting Free API Keys

### Google Gemini API (Required for AI)
1. Go to https://aistudio.google.com/app/apikey
2. Click **"Create API Key"**
3. Copy the key to `GEMINI_API_KEY`
4. Free tier: 15 requests/minute, 1500 requests/day

### Supabase (Optional for auth/database)
1. Go to https://supabase.com
2. Create new project (free)
3. Go to Settings → API
4. Copy URL and anon key

---

## Cost Breakdown

| Service | Free Tier | Cost |
|---------|-----------|------|
| Vercel | 100GB bandwidth/mo | $0 |
| Gemini API | 1500 req/day | $0 |
| Supabase | 500MB database | $0 |
| OpenStreetMap | Unlimited | $0 |
| GitHub Actions | 2000 min/mo | $0 |
| **TOTAL** | | **$0** |
