# PA Automation Engine

AI-powered Prior Authorization management platform for Medicare and Medicaid.

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **AI**: Anthropic Claude API (claude-sonnet-4-6) for clinical reasoning
- **Database**: SQLite via Prisma (schema-ready for PostgreSQL)
- **Auth**: NextAuth.js (credentials provider)
- **Charts**: Recharts
- **PDF**: pdf-parse

---

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env.local` and fill in:

```
ANTHROPIC_API_KEY=sk-ant-...      # Required for AI analysis
NEXTAUTH_SECRET=...               # Any random string (min 32 chars)
NEXTAUTH_URL=http://localhost:3000
DATABASE_URL="file:./dev.db"
```

Generate a secret:
```bash
openssl rand -base64 32
```

### 3. Initialize and migrate the database

```bash
npx prisma migrate dev --name init
```

### 4. Seed with 20 realistic PA requests

```bash
npx prisma db seed
```

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Login Credentials

| Role     | Email                 | Password |
|----------|-----------------------|----------|
| Provider | provider@demo.com     | demo     |
| Admin    | admin@demo.com        | demo     |

---

## Features

### PA Intake Form (`/pa/new`)
- Patient demographics, ICD-10/CPT code search with autocomplete
- Payer (Medicare/Medicaid) and urgency selection
- Clinical notes + optional PDF upload
- Auto-triggers AI analysis on submission

### AI Clinical Reviewer
Claude analyzes each PA request against CMS LCD/NCD guidelines and returns:
- **Verdict**: LIKELY_APPROVED / LIKELY_DENIED / NEEDS_MORE_INFO
- **Confidence score** (0–100%)
- **Clinical rationale** bullets citing guideline logic
- **Documentation gaps** with specific action items
- **Suggested ICD-10 codes** to strengthen the case
- **Turnaround estimate** for this payer/procedure type
- **Appeal strength** assessment

### Dashboard (`/dashboard`)
- Filterable table: status, payer, urgency, date range, text search
- Metric cards: Total, Approved, Denied, Pending, Approval Rate, Avg Confidence
- Sortable columns, click-through to detail view

### PA Detail View (`/pa/[id]`)
- Full patient and request info
- AI Analysis panel with confidence meter and verdict badge
- Audit timeline of all status changes
- Provider notes thread
- Action buttons: Analyze, Mark Approved/Denied, Submit to Payer, Appeal

### Appeal Assistant
- Triggered from denied PA detail view
- Select or enter denial reason
- Claude generates a CMS-formatted appeal letter
- Copy to clipboard or download as .txt

### Analytics (`/analytics`)
- PA volume by week (bar chart)
- Status breakdown pie chart
- Top denied procedures (horizontal bar)
- AI confidence trend over time (line chart)

---

## Database Commands

```bash
npx prisma studio          # GUI to browse database
npx prisma migrate reset   # Reset and re-seed (loses all data)
npx prisma db push         # Push schema without migrations
```

## Swap to PostgreSQL

Change `schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Update `DATABASE_URL` in `.env.local` to your PostgreSQL connection string, then run `npx prisma migrate dev`.

---

## Project Structure

```
app/
  dashboard/          Dashboard with PA table + metrics
  pa/new/             PA intake form
  pa/[id]/            PA detail view
  analytics/          Charts and metrics page
  api/
    pa/               CRUD routes
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
  anthropic.ts        Claude API client + prompts
  prisma.ts           Prisma singleton
  auth.ts             NextAuth config
  icd10.ts            Static ICD-10/CPT code lookup
prisma/
  schema.prisma       Database schema
  seed.ts             20 realistic seed PA requests
```
