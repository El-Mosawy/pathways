# Pathways 🧭

**A personalised rights and entitlements navigator for people needing to navigate the UK immigration system.**

Live at → [pathways-liard.vercel.app](https://pathways-liard.vercel.app)

---

## The Problem
In 2025 alone, over 100,000 people claimed asylum in the UK in the year ending December 2025 which is more than double the figure from 2019.  A further 48,700 cases are currently awaiting an initial decision.

When a refugee receives a positive decision, they must leave their Home Office accommodation within just 28 days. In the last 12 months alone, 13,190 households received homelessness assistance from a local authority after leaving asylum accommodation. This is not because help wasn't available, but because nobody told them what they were entitled to or what to do next.

The UK immigration system changed fundamentally on 2 March 2026. New rules, new timelines, new restrictions on work and family reunion. The information exists, but it is buried in legal language, scattered across government websites, and changes faster than any guide can keep up with.

A small mistake like missing a deadline, not knowing about NRPF or applying for the wrong benefit, can determine whether someone has a home, an income, or the right to work. The consequences are not administrative. They are human.

**Pathways does.**

---

## What Pathways Does

Pathways asks a user a short set of questions about their situation (visa status, time in the UK, family circumstances, employment, English level) and generates a **personalised, plain-language action plan** in their chosen language.

The plan covers:

- **Current status** — what their immigration status means right now in plain language
- **Immediate actions** — the most urgent things to do in the next 30 days, in priority order
- **Entitlements** — everything they can currently access: benefits, housing, healthcare, work rights, education
- **Deadlines** — time-sensitive situations flagged clearly, including move-on periods and application windows
- **Next steps** — what to work towards over the next 1–6 months, with a sense of direction and hope

---

## Why Pathways Is Different

| Feature | RefAid | Gov.uk | Pathways |
|---|---|---|---|
| Personalised to your situation | ✗ | ✗ | ✓ |
| Reflects March 2026 rule changes | ✗ | Partial | ✓ |
| Generates advice in your language | ✗ | ✗ | ✓ |
| Prioritised action plan | ✗ | ✗ | ✓ |
| Free to use | ✓ | ✓ | ✓ |

Existing tools are either directories (here is a list of services near you) or generic guides (here is how the asylum system works). Pathways is the first tool that combines the user's specific legal situation with current policy and produces a personalised, actionable, translated plan.

---

## Tech Stack

**Backend**
- Python 3.11
- FastAPI — REST API framework
- Pydantic — data validation and schema enforcement
- Google Gemini API — AI plan generation
- SlowAPI — rate limiting
- Uvicorn — ASGI server

**Frontend**
- React 18 (Vite)
- Axios — HTTP client
- Vanilla CSS with design tokens
- Nunito — typography

**Infrastructure**
- Render — backend hosting
- Vercel — frontend hosting
- GitHub — version control and CI/CD

---

## Architecture

The frontend and backend are independently deployed and communicate via a REST API. This architecture means the backend can serve a future mobile app, third-party integrations, or NGO-embedded widgets without any changes.

---

## Key Engineering Decisions

**Data-driven onboarding form**
Questions are defined as a data array rather than hardcoded JSX. Each question has a `showIf` function enabling conditional logic. Question 2 only appears for asylum seekers, accommodation questions only appear for relevant visa types. Adding a new question requires one object in the array.

**Pydantic schema with Enums**
The `UserSituation` model uses Python Enums for fields with fixed valid values. This gives automatic validation, self-documenting code, and eliminates data inconsistency bugs. Optional fields reflect real-world uncertainty (not every user knows if they have NRPF for example).

**Structured prompt engineering**
The AI prompt uses custom `[SECTION:NAME]` markers to structure output. The frontend parses these markers and renders each section as an independent card. This separates content from presentation and makes the AI output predictable regardless of which model is used. It also makes sure to include a lot of information that most users would probably not know about the asylum system, and even if they did know, they most likely wouldn't be able to word at a high level to draw important information out of the AI.

**Provider-agnostic AI service layer**
The AI service is abstracted behind a single function `generate_action_plan()`. The route layer has no knowledge of which AI provider is used. Swapping providers requires changing one file.

**Cold start resilience**
The frontend implements retry logic with exponential backoff, up to 5 attempts with configurable delay. Combined with a 30s timeout, the app handles Render free tier cold starts gracefully. Users see a calming loading screen throughout.

**Rate limiting**
SlowAPI enforces 5 requests per hour per IP address at the route level. This protects the Gemini API quota from abuse before requests reach the AI layer.

**Environment-based configuration**
API URLs are managed via Vite environment variables. `.env.local` points to localhost for development. `.env.production` points to the deployed backend. No manual swapping required.

---

## Policy Accuracy

Pathways reflects UK immigration law as of **April 2026**, including:

- The March 2 2026 introduction of 30-month Core Protection replacing 5-year refugee status
- RQF Level 6+ work restrictions for post-March 2026 claimants
- The September 2025 suspension of unconditional refugee family reunion
- The visa brake affecting Afghan, Cameroonian, Myanmar, and Sudanese nationals
- NRPF implications across all relevant visa categories
- Move-on period obligations for asylum accommodation residents

The data model captures `claim_date_before_march_2026` as a boolean field because this single date determines entirely different legal pathways. The AI prompt contains explicit policy rules grounded in current law rather than relying on training data.

---

## Scalability Roadmap

Pathways currently runs on free tier infrastructure suitable for early-stage usage and NGO pilots. The architecture is designed with the following scaling path:

**Current state**
- Gemini free tier: ~15 requests/minute, 1,500/day
- Render free tier: cold starts after 15 minutes inactivity (mitigated by retry logic)
- Suitable for: pilot programmes, NGO evaluation, low-volume public access

**Next stage**
- Render paid tier eliminates cold starts
- Gemini paid tier increases quota significantly
- Suitable for: active NGO deployment, moderate public traffic

**Scale stage**
- Job queue (Celery + Redis) for async AI generation
- Database layer (Supabase PostgreSQL) for usage analytics and session persistence
- CDN for frontend assets
- Suitable for: high-volume deployment, multiple NGO clients

---

## For Organisations

Pathways is free for vulnerable individuals and designed for adoption by organisations working in the immigration and asylum sector.

**NGOs and charities** can embed Pathways into their existing digital services via API integration. The backend is provider-agnostic and returns structured JSON ( straightforward to consume from any platform).

**Local councils and housing associations** can deploy Pathways to help residents navigate entitlements and deadlines, reducing the burden on caseworkers.

**Legal aid providers** can use Pathways as a triage tool, identifying the most urgent issues before a formal consultation.

If your organisation is interested in a pilot or integration, please open an issue on this repository.

---

## Running Locally

**Prerequisites**
- Python 3.11+
- Node.js 18+
- A Google Gemini API key (free at aistudio.google.com)

**Backend**

```bash
cd backend
python3 -m venv proj
source proj/bin/activate
pip install -r requirements.txt
```

Create `backend/.env`:
```
GEMINI_API_KEY=your_key_here
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
│   │   │       └── onboarding.py   # POST /api/onboarding/submit
│   │   ├── models/
│   │   │   └── onboarding.py       # UserSituation Pydantic model
│   │   ├── services/
│   │   │   └── ai_service.py       # Gemini integration
│   │   └── main.py                 # FastAPI app, CORS, rate limiting
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    └── src/
        ├── components/
        │   ├── WelcomeScreen.jsx    # Language selection
        │   ├── OnboardingForm.jsx   # Multi-step quiz
        │   ├── LoadingScreen.jsx    # AI generation with retry logic
        │   ├── ResultsPage.jsx      # Personalised action plan
        │   └── ErrorScreen.jsx      # Error handling with retry
        ├── App.jsx                  # State management and routing
        └── index.css                # Design tokens and global styles
```

---

## Licence

Copyright © 2026 El-Mosawy. All rights reserved.

This project is publicly visible for portfolio and demonstration purposes only.

You may **not** use, copy, modify, distribute, or deploy this code or any part of it for commercial purposes without explicit written permission from the author.

If you are an organisation interested in deploying or licensing Pathways, please get in touch directly via GitHub.
---

*Built to help people who need it most. If you work with refugees or asylum seekers and think Pathways could help your organisation, please get in touch.*
