# PA Automation Engine

An AI-powered Prior Authorization management platform for Medicare and Medicaid. Built to streamline PA intake, clinical review, and appeals using Claude as the clinical reasoning engine.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| AI | Anthropic Claude (`claude-sonnet-4-6`) |
| Database | SQLite via Prisma (schema-ready for PostgreSQL) |
| Auth | NextAuth.js (credentials provider) |
| Charts | Recharts |
| PDF | pdf-parse |

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env.local` and fill in the required values:

```env
ANTHROPIC_API_KEY=sk-ant-...        # Required for AI analysis
NEXTAUTH_SECRET=...                  # Random string, min 32 chars
NEXTAUTH_URL=http://localhost:3000
DATABASE_URL="file:./dev.db"
```

Generate a secret with:

```bash
openssl rand -base64 32
```

### 3. Initialize the database

```bash
npx prisma migrate dev --name init
```

### 4. Seed with demo data

Seeds the database with 20 realistic PA requests and two demo user accounts.

```bash
npx prisma db seed
```

### 5. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| Provider | provider@demo.com | demo |
| Admin | admin@demo.com | demo |

## Features

### PA Intake Form — `/pa/new`
- Patient demographics with ICD-10/CPT code autocomplete
- Payer (Medicare/Medicaid) and urgency selection
- Clinical notes and optional PDF upload
- AI analysis is triggered automatically on submission

### AI Clinical Reviewer
Claude analyzes each request against CMS LCD/NCD guidelines and returns:

- **Verdict** — `LIKELY_APPROVED`, `LIKELY_DENIED`, or `NEEDS_MORE_INFO`
- **Confidence score** — 0–100%
- **Clinical rationale** — guideline-cited reasoning bullets
- **Documentation gaps** — specific action items to close gaps
- **Suggested ICD-10 codes** — to strengthen the authorization case
- **Turnaround estimate** — based on payer and procedure type
- **Appeal strength** assessment

### Dashboard — `/dashboard`
- Metric cards: Total, Approved, Denied, Pending, Approval Rate, Avg Confidence
- Filterable and sortable PA table by status, payer, urgency, date range, and text
- Click-through to full detail view

### PA Detail View — `/pa/[id]`
- Full patient and request information
- AI Analysis panel with confidence meter and verdict badge
- Audit timeline of all status changes
- Provider notes thread
- Actions: Analyze, Mark Approved/Denied, Submit to Payer, Appeal

### Appeal Assistant
- Triggered from any denied PA
- Select or enter the denial reason
- Claude generates a CMS-formatted appeal letter
- Copy to clipboard or download as `.txt`

### Analytics — `/analytics`
- PA volume by week (bar chart)
- Status breakdown (pie chart)
- Top denied procedures (horizontal bar chart)
- AI confidence trend over time (line chart)

## Database

```bash
npx prisma studio          # Browse the database in a GUI
npx prisma migrate reset   # Reset and re-seed (destructive)
npx prisma db push         # Push schema changes without a migration
```

### Switching to PostgreSQL

Update `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Set `DATABASE_URL` in `.env.local` to your PostgreSQL connection string, then run:

```bash
npx prisma migrate dev
```

## Project Structure

```
app/
  dashboard/          PA table with metrics and filters
  pa/new/             PA intake form
  pa/[id]/            PA detail view
  analytics/          Charts and aggregate metrics
  api/
    pa/               CRUD routes for PA requests
    pa/[id]/analyze   AI analysis trigger
    pa/[id]/appeal    Appeal letter generation
    pa/[id]/notes     Provider notes
    analytics/        Analytics aggregation
    auth/             NextAuth handler

components/
  layout/             Sidebar, AppLayout
  pa/                 PAForm, PATable, AIPanel, AppealModal
  ui/                 StatusBadge, ConfidenceMeter
  charts/             Recharts wrappers

lib/
  anthropic.ts        Claude API client and prompts
  prisma.ts           Prisma singleton
  auth.ts             NextAuth config
  icd10.ts            Static ICD-10/CPT code lookup

prisma/
  schema.prisma       Database schema
  seed.ts             Demo PA requests and users
```
