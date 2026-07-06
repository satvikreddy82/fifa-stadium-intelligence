# ⚽ FIFA StadiumIQ 2026

> **Generative AI-Powered Stadium Operations Platform for FIFA World Cup 2026**

[![CI](https://github.com/yourusername/fifa-stadiumiq-2026/actions/workflows/ci.yml/badge.svg)](https://github.com/yourusername/fifa-stadiumiq-2026/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](https://typescriptlang.org)

---

## 🏆 Hackathon Submission — FIFA World Cup 2026 GenAI Challenge

FIFA StadiumIQ 2026 is a **production-ready, 100% free-to-deploy** Generative AI platform that transforms the FIFA World Cup 2026 stadium experience for fans, organizers, volunteers, security teams, and accessibility users.

**Total Cost: $0 / ₹0** — Deployed entirely on free tiers.

---

## ✨ Features

| Module | AI Feature | Technology |
|--------|-----------|------------|
| 🤖 AI Stadium Assistant | Conversational chat (10 languages) | Gemini 1.5 Flash |
| 🗺️ Indoor Navigation | A* pathfinding + wheelchair routes | SVG + Custom A* |
| 👥 Crowd Intelligence | Live heatmaps + congestion prediction | Simulated real-time data |
| 🚌 Transportation Hub | AI route recommendation | Gemini + OpenAPI |
| 🚨 Emergency Response | SOS + AI evacuation instructions | Gemini |
| 🌿 Sustainability | Carbon/energy/waste monitoring + eco AI | Gemini + Recharts |
| 📊 Organizer Dashboard | KPIs + AI operational insights | Recharts + Gemini |
| 🙋 Volunteer Copilot | Task management + AI FAQ + gamification | Gemini |
| 🌍 Multilingual AI | 10 languages via Gemini translation | Gemini |
| ♿ Accessibility | WCAG AA, voice, high contrast, color blind | Web APIs |

---

## 🛠️ Tech Stack (100% Free)

```
Frontend:    Next.js 14 · TypeScript · Tailwind CSS · Framer Motion · Shadcn UI
AI:          Google Gemini 1.5 Flash (free tier)
Database:    Supabase (free tier)
Maps:        OpenStreetMap (free, no API key)
Charts:      Recharts
State:       Zustand + React Query
Deploy:      Vercel (free)
Tests:       Vitest + Playwright
CI/CD:       GitHub Actions
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Free [Gemini API key](https://aistudio.google.com/app/apikey)
- Free [Supabase account](https://supabase.com) (optional for full auth)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/fifa-stadiumiq-2026.git
cd fifa-stadiumiq-2026

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Gemini API key

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

> **Note:** Works in demo mode without any API keys — all AI features fall back to intelligent pre-written responses.

---

## 🔑 Environment Variables

```bash
# Required for real AI (optional — demo mode works without it)
GEMINI_API_KEY=your_gemini_api_key_from_aistudio

# Optional — for full auth/database
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

Get a free Gemini API key at: https://aistudio.google.com/app/apikey

---

## 📂 Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Landing page
│   ├── stadium/            # Indoor navigation
│   ├── crowd/              # Crowd intelligence
│   ├── transport/          # Transportation hub
│   ├── emergency/          # Emergency response
│   ├── sustainability/     # Eco dashboard
│   ├── dashboard/          # Organizer dashboard
│   ├── volunteer/          # Volunteer copilot
│   └── api/ai/             # AI API routes
├── components/
│   ├── ai/                 # Floating assistant, chat
│   ├── map/                # SVG stadium map
│   ├── accessibility/      # A11y toolbar, filters
│   ├── layout/             # Navbar
│   └── providers/          # Theme, Query
├── lib/
│   ├── gemini.ts           # AI client
│   ├── pathfinding.ts      # A* algorithm
│   ├── stadium-data.ts     # FIFA 2026 data
│   ├── crowd-simulation.ts # Live data simulation
│   └── utils.ts            # Utilities
├── store/                  # Zustand stores
├── types/                  # TypeScript interfaces
└── __tests__/              # Vitest + Playwright tests
```

---

## 🧪 Testing

```bash
npm run test              # Run unit tests
npm run test:coverage     # With coverage report
npm run test:e2e          # Playwright E2E tests
npm run lint              # ESLint
npm run type-check        # TypeScript check
```

---

## 🌐 Deployment (Free — Vercel)

```bash
# 1. Push to GitHub
git push origin main

# 2. Import project at vercel.com
# 3. Add environment variables in Vercel dashboard
# 4. Deploy — automatic on every push!
```

---

## 🔐 Security

- ✅ OWASP Top 10 mitigations
- ✅ Input sanitization (XSS prevention)
- ✅ Rate limiting on all AI endpoints
- ✅ CORS headers
- ✅ Content Security Policy
- ✅ X-Frame-Options: DENY
- ✅ Secure environment variables
- ✅ No secrets exposed to client

See [SECURITY.md](./SECURITY.md) for full security documentation.

---

## ♿ Accessibility

- ✅ WCAG AA compliant
- ✅ Screen reader support (ARIA labels)
- ✅ Keyboard navigation
- ✅ High contrast mode
- ✅ Large text mode
- ✅ Color blind simulation (Protanopia, Deuteranopia, Tritanopia)
- ✅ Voice input/output
- ✅ Reduced motion mode
- ✅ Semantic HTML5

---

## 🌿 Sustainability

This platform itself is sustainable:
- Deployed on Vercel Edge Network (renewable energy)
- No always-on servers
- Serverless API routes (pay-per-request model)
- AI calls use Gemini Flash (most efficient model)

---

## 📄 License

MIT License — See [LICENSE](./LICENSE)

---

## 🏅 Built For

**FIFA World Cup 2026 GenAI Hackathon**
*Enhancing Stadium Operations with Generative AI*

Built by a team committed to accessibility, sustainability, and innovation. Powered by Google Gemini.
