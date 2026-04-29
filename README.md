# Pathways

**A personalised rights and entitlements navigator for people needing to navigate the UK immigration system.**

Live at → [pathways-liard.vercel.app](https://pathways-liard.vercel.app)

---

## The Problem
In the year ending December 2025, over 100,000 people claimed asylum in the UK which is more than double the figure from 2019.  A further 48,700 cases are currently awaiting an initial decision.

When a refugee receives a positive decision, they must leave their Home Office accommodation within just 28 days. In the last 12 months alone, 13,190 households received homelessness assistance from a local authority after leaving asylum accommodation. This isn't because help wasn't available, but because nobody told them what they were entitled to or what to do next.

The UK immigration system changed fundamentally on 2 March 2026. New rules, new timelines, new restrictions on work and family reunion. The information exists, but it is buried in legal language, scattered across government websites, and changes faster than any guide can keep up with.

A small mistake like missing a deadline, not knowing about NRPF or applying for the wrong benefit, can determine whether someone has a home, an income, or the right to work. The consequences are not administrative. They are human.

**Pathways closes that gap**

---

## What Pathways Does

Pathways asks a user a short set of questions about their situation (visa status, time in the UK, family circumstances, employment, English level) and generates a **personalised, plain-language action plan** in their chosen language.

The plan covers:

- **Current status** — what their immigration status means right now in plain language
- **Entitlements** — the good news first: every benefit, service, healthcare right, and entitlement they can currently access, with direct GOV.UK links
- **Action Plan** — numbered, prioritised actions with specific instructions on where to go and how to apply
- **Next steps** — what to work towards over the next 1–6 months, with a sense of direction and hope

After the four sections, a **visual deadline timeline** shows every time-sensitive milestone, colour-coded by urgency, with a pulsing animation for items requiring immediate action.

---

## Why Pathways Is Different

| Feature | RefAid | Gov.uk | Pathways |
|---|---|---|---|
| Personalised to your situation | ✗ | ✗ | ✓ |
| Reflects March 2026 rule changes | ✗ | Partial | ✓ |
| Generates advice in your language | ✗ | ✗ | ✓ |
| Prioritised action plan with GOV.UK links | ✗ | ✗ | ✓ |
| Visual deadline timeline | ✗ | ✗ | ✓ |
| Shareable plan link | ✗ | ✗ | ✓ |
| Downloadable as PDF | ✗ | ✗ | ✓ |
| Installable as a mobile app (PWA) | ✗ | ✗ | ✓ |
| Free to use | ✓ | ✓ | ✓ |

Existing tools are either directories (here is a list of services near you) or generic guides (here is how the asylum system works). Pathways is the first tool that combines the user's specific legal situation with current policy and produces a personalised, actionable, translated plan, with direct links to where they need to go.

---

## Tech Stack

**Backend**
- Python 3.11
- FastAPI — REST API framework
- Pydantic — data validation and schema enforcement
- Google Gemini API — AI plan generation with multi-model fallback
- SlowAPI — IP-based rate limiting
- Supabase (PostgreSQL) — persistent plan storage for shareable links
- Uvicorn — ASGI server

**Frontend**
- React 18 (Vite)
- Axios — HTTP client with retry logic and timeout handling
- Vanilla CSS with design tokens
- Nunito — typography (warm, readable, RTL-compatible)
  
**Infrastructure**
- Render — backend hosting (Python)
- Vercel — frontend hosting with SPA routing
- Supabase — managed PostgreSQL database
- GitHub — version control and CI/CD (auto-deploy on push)

---

## Architecture

The frontend and backend are independently deployed and communicate via a REST API. This architecture means the backend can serve a future mobile app (already a PWA - Progressive Web App), third-party integrations, or NGO-embedded widgets without any changes.

---

## Key Engineering Decisions

**Data-driven onboarding form**
Questions are defined as a data array rather than hardcoded JSX. Each question has a `showIf` function enabling conditional logic. Question 2 only appears for asylum seekers, accommodation questions only appear for relevant visa types. Adding a new question requires one object in the array. The form tracks answers in accumulated state, enables back navigation, and handles optional questions with a skip option.

**Pydantic schema with Enums**
The `UserSituation` model uses Python Enums for fields with fixed valid values. This gives automatic validation, self-documenting code, and eliminates data inconsistency bugs. Optional fields reflect real-world uncertainty (not every user knows if they have NRPF for example), which are handled gracefully.

**Structured prompt engineering**
The AI prompt uses custom `[SECTION:NAME]` markers to structure output into four prose sections plus a structured `[SECTION:TIMELINE]` block containing machine-parseable deadline lines in the format `DEADLINE:timeframe|description|urgency`. The frontend parses these markers and renders each section independently — separating content from presentation and making AI output predictable regardless of which model is used.

**Multi-model fallback chain**
The AI service attempts `gemini-2.5-flash` first, automatically falling back to `gemini-2.0-flash` if the primary model is unavailable or rate-limited. This makes the app resilient to individual model outages without any user-facing impact.

**Provider-agnostic AI service layer**
The AI service is abstracted behind a single function `generate_action_plan()`. The route layer has no knowledge of which AI provider is used. Swapping providers requires changing one file.

**Cold start resilience**
The frontend implements retry logic with exponential backoff, up to 5 attempts with configurable delay. Combined with a 30s timeout, the app handles Render free tier cold starts gracefully. Users see a calming loading screen throughout.

**Rate limiting**
SlowAPI enforces a request limit per IP address at the route level, protecting the Gemini API quota from abuse before requests reach the AI layer. The frontend detects 429 responses and shows a specific "Please wait" screen distinct from generic error screens.

**Shareable plan links**
Completed plans can be saved to Supabase and accessed via a unique URL (`/plan/{id}`). The frontend detects plan IDs in the URL on load and fetches the plan directly, bypassing the onboarding flow. Vercel SPA routing is configured to serve `index.html` for all paths, with React handling routing client-side.
 
**PDF export**
The results page uses the browser's native print API with print-specific CSS to generate clean, well-formatted PDFs. The background pattern, header, and navigation buttons are hidden in print mode. All section cards and the deadline timeline are included. This approach handles RTL languages (Arabic, Kurdish, Dari) correctly — something JavaScript PDF libraries struggle with.
 
**Progressive Web App (PWA)**
A `manifest.json` and service worker enable installation on any device directly from the browser. No App Store or Play Store required. The app caches static assets for faster subsequent loads and limited offline resilience.
 
**Environment-based configuration**
API URLs are managed via Vite environment variables. `.env.local` points to `localhost:8000` for development. `.env.production` points to the deployed Render backend. No manual code changes required when switching environments.

---

## Policy Accuracy

Pathways reflects UK immigration law as of **April 2026**, including:

- The March 2 2026 introduction of 30-month Core Protection replacing 5-year refugee status
- RQF Level 6+ work restrictions for post-March 2026 claimants
- The September 2025 suspension of unconditional refugee family reunion
- The visa brake affecting Afghan, Cameroonian, Myanmar, and Sudanese nationals
- NRPF implications across all relevant visa categories
- Move-on period obligations for asylum accommodation residents

The data model captures `claim_date_before_march_2026` as a boolean field because this single date determines entirely different legal pathways. The AI prompt contains explicit policy rules grounded in current law rather than relying on training data, whcih could be outdated.

---

## Scalability Roadmap

Pathways currently runs on free tier infrastructure suitable for early-stage usage and NGO pilots. The architecture is designed with the following scaling path:

**Current state**
- Gemini free tier with multi-model fallback
- Render free tier: cold starts after 15 minutes inactivity (mitigated by retry logic)
- Supabase free tier: 500MB storage — sufficient for approximately 100,000 saved plans
- Suitable for: pilot programmes, NGO evaluation, low-volume public access

**Next stage (£25–30/month)**
- Render paid tier eliminates cold starts entirely
- Gemini paid tier significantly increases quota
- Suitable for: active NGO deployment, moderate public traffic

**Scale stage**
- Job queue (Celery + Redis) for async AI generation under high load
- CDN for frontend asset delivery
- Scheduled Supabase cleanup for GDPR-compliant plan expiry
- Suitable for: high-volume deployment, multiple NGO clients

---
 
## For Organisations
 
Pathways is free for individuals and designed for adoption by organisations working in the immigration and asylum sector.
 
**NGOs and charities** can embed Pathways into their existing digital services via API integration. The backend is provider-agnostic and returns structured JSON — straightforward to consume from any platform.
 
**Local councils and housing associations** can deploy Pathways to help residents navigate entitlements and deadlines, reducing the burden on caseworkers.
 
**Legal aid providers** can use Pathways as a triage tool — identifying the most urgent issues and generating a shareable plan link before a formal consultation begins.
 
If your organisation is interested in a pilot or integration, please open an issue on this repository.
 
---

## Running Locally
 
**Prerequisites**
- Python 3.11+
- Node.js 18+
- A Google Gemini API key (free at aistudio.google.com)
- A Supabase project (free at supabase.com) with a `plans` table
**Backend**
 
```bash
cd backend
python3 -m venv proj
source proj/bin/activate
pip install -r requirements.txt
```
 
Create `backend/.env` using `.env.example` as a template:
```
GEMINI_API_KEY=your_key_here
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_secret_key
```
 
```bash
uvicorn app.main:app --reload
```
 
API runs at `http://localhost:8000`
Interactive docs at `http://localhost:8000/docs`
 
**Frontend**
 
```bash
cd frontend
npm install
```
 
Create `frontend/.env.local`:
```
VITE_API_URL=http://localhost:8000
```
 
```bash
npm run dev
```
 
Frontend runs at `http://localhost:5173`

---

## Project Structure

```
pathways/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── routes/
│   │   │       ├── onboarding.py   # POST /api/onboarding/submit
│   │   │       └── plans.py        # POST /api/plans/save, GET /api/plans/{id}
│   │   ├── models/
│   │   │   └── onboarding.py       # UserSituation Pydantic model with Enums
│   │   ├── services/
│   │   │   └── ai_service.py       # Gemini integration with fallback chain
│   │   └── main.py                 # FastAPI app, CORS, rate limiting
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── public/
    │   ├── manifest.json           # PWA configuration
    │   ├── sw.js                   # Service worker for caching
    │   ├── icon-192.png            # PWA icon
    │   └── icon-512.png            # PWA splash icon
    └── src/
        ├── components/
        │   ├── WelcomeScreen.jsx       # Language selection
        │   ├── OnboardingForm.jsx      # Multi-step conditional quiz
        │   ├── LoadingScreen.jsx       # AI generation with retry logic
        │   ├── ResultsPage.jsx         # Personalised action plan with PDF export
        │   ├── DeadlineTimeline.jsx    # Visual urgency-coded deadline timeline
        │   ├── SharedPlanLoader.jsx    # Loading state for shared plan URLs
        │   └── ErrorScreen.jsx         # Error handling with context-specific messages
        ├── App.jsx                     # State management, routing, URL detection
        └── index.css                   # Design tokens, global styles, animations
```

---

## Licence

Copyright © 2026 El-Mosawy. All rights reserved.

This project is publicly visible for portfolio and demonstration purposes only.

You may **not** use, copy, modify, distribute, or deploy this code or any part of it for commercial purposes without explicit written permission from the author.

If you are an organisation interested in deploying or licensing Pathways, please get in touch directly via GitHub.
---

*Built to help people who need it most. If you work with refugees or asylum seekers and think Pathways could help your organisation, please get in touch.*
