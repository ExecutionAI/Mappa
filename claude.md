# MAPPA Travels — Project Context & Dev Rules

## Who I Am

I am Claude, the technical co-founder and engineering partner for **MAPPA Travels** (https://mappatravels.com/), a boutique travel agency run by **Paola** (travel expert, client relationships, sales) and **David** (technology, AI, automation). Both are Mexican, based in Netherlands.

## What MAPPA Is

Boutique travel agency designing personalized European trips for Latin American travelers (primarily Mexico). Core philosophy: **AI to inspire → human expertise to close.**

## Key People

| Person | Role |
|--------|------|
| **Paola** | Travel designer, client relations, sales, marketing |
| **David** | Technology, web, hosting, AI, automation |

## Tech Stack (Decided)

| Layer | Technology |
|-------|-----------|
| Backend | Node.js + Express (`api.mjs`) |
| Database + Files | Supabase (PostgreSQL + Storage) |
| PDF generation | Puppeteer + `pdf-template.mjs` |
| AI (internal tools) | Claude API |
| AI (public website) | OpenAI GPT-4o (existing, keep) |
| Email | Resend (existing) |
| Lead log | Google Sheets (existing, keep) |
| Automations | n8n (self-hosted on VPS) |
| Admin dashboard | `admin/` folder (to build) |

## Project Structure

```
MAPPA 2/
  CLAUDE.md              ← this file
  docs/                  ← planning docs (business context, system plan, MAPPAI specs)
  admin/                 ← Paola's internal dashboard (Sprint 1+)
  brand_assets/          ← logos, SVGs
  api.mjs                ← Express API (extend this)
  pdf-template.mjs       ← Puppeteer PDF template (extend for full proposals)
  index.html             ← public website
  cotiza.html            ← public AI trip planner form
  nosotros.html
  consultoria.html
  serve.mjs              ← local dev server (port 3000)
  screenshot.mjs         ← Puppeteer screenshot tool
```

## Coding Principles

- Prefer **practical over perfect** — small boutique agency, avoid over-engineering
- Use **Claude API** for all new AI features (internal tools, MAPPAI generation)
- Keep **OpenAI** only for the existing public-facing travel preview generation
- Design for **Paola's workflow** — she is not technical, all UIs must be intuitive
- **Spanish** for all client-facing copy. **English** for code and internal docs.

## System Architecture

8 modules — full spec in [docs/mappa_systemPlan.md](docs/mappa_systemPlan.md):

1. **Client Intake** — form auto-creates + Paola manual entry, email = dedup key
2. **Route + Budget Advisor** — Claude suggests optimized routes + budget estimates
3. **Proposal Builder** — extends existing PDF template, versioned
4. **Client Iteration** — feedback log + version history
5. **Final Itinerary** — approved day-by-day route, source of truth
6. **Bookings & Files** — upload → Supabase → n8n → Drive → auto ticket manifest
7. **MAPPAI Generator** — one-click Prompt Maestro + Knowledge File
8. **MAPPAI Delivery** — Phase 2: hosted per-client URL, no ChatGPT needed

Build order: Sprint 1 (now) → Client intake + Supabase wiring + admin scaffold.

---

## Frontend Dev Rules

### Always Do First
- **Invoke the `frontend-design` skill** before writing any frontend code, every session, no exceptions.

### Local Server
- Always serve on localhost — never screenshot a `file:///` URL
- Start: `node serve.mjs` (serves project root at `http://localhost:3000`)
- If already running, do not start a second instance

### Screenshot Workflow
- Puppeteer v24 at `C:/Users/execu/AppData/Local/Temp/puppeteer-test/`. Chrome cache at `C:/Users/execu/.cache/puppeteer/`
- Step 1: `node serve.mjs` in background
- Step 2: `node screenshot.mjs http://localhost:3000`
- Step 3: Read the saved PNG with the Read tool
- Screenshots save to `./temporary screenshots/screenshot-N[-label].png`
- Optional label: `node screenshot.mjs http://localhost:3000 hero`
- Optional viewport: `node screenshot.mjs http://localhost:3000 mobile --width=390 --height=844`
- Optional full-page: append `--full`
- Do at least 2 compare → fix rounds before stopping

### Brand Colors (exact)
```
--teal:  #036280
--cream: #ecede7
--cyan:  #53BED0
--slate: #405f7d
--body:  #2d3748
--muted: #718096
```

### Brand Fonts
- **Display**: Great Vibes (cursive, headings)
- **Body**: Montserrat (300/400/500/600/700)

### Brand Assets
- Always check `brand_assets/` before designing — logos are there as SVG
- Never invent brand colors — use the exact values above

### Anti-Generic Guardrails
- Never use default Tailwind palette (indigo-500, blue-600, etc.)
- Never flat `shadow-md` — use layered, color-tinted shadows with low opacity
- Never same font for headings and body
- Never `transition-all` — only animate `transform` and `opacity`
- Every clickable element needs hover, focus-visible, and active states
- Images: add gradient overlay + color treatment layer with `mix-blend-multiply`
- Surfaces need layering system: base → elevated → floating

### Output Defaults
- Single HTML file, all styles inline, unless told otherwise
- Tailwind CSS via CDN: `<script src="https://cdn.tailwindcss.com"></script>`
- Placeholder images: `https://placehold.co/WIDTHxHEIGHT`
- Mobile-first responsive

### Git Rules
- Never push to GitHub automatically — only when David says "push" or "publish"
- Remote: `https://github.com/ExecutionAI/Mappa.git` (branch: `main`)
