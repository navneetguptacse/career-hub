<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# CareerHub — System Architecture & Engineering Reference (AGENTS.md)

This document serves as the permanent system architecture reference, UI design specification, engineering guidelines, and roadmap for CareerHub. All subsequent code modifications and additions must strictly adhere to the standards outlined herein.

---

## 1. Core Engineering Rules & Constraints

1. **Max Lines per File**: No file must exceed **350 lines of code**. If logic grows, modularize into subcomponents, domain hooks, or isolated utility functions.
2. **Clean Code**:
   - Zero unused imports or variables.
   - Strictly typed TypeScript (no `any` without explicit justification).
   - No unnecessary comments or commented-out dead code.
   - No emojis in UI text, code, or commit messages. Use clean SVG vector icons (e.g., `lucide-react`).
3. **UI Edge Styling**:
   - Component edges must be **near-sharp**: maximum border-radius of **2px to 3px** (`rounded-xs`).
   - Do NOT use heavy rounded corners (`rounded-lg`, `rounded-xl`, `rounded-2xl`, `rounded-full`).
4. **Color Theme**:
   - Primary Accent: **TypeScript Blue** (`#3178C6`).
   - Primary Hover: `#235A97`.
   - Subtle Accent Tint: `rgba(49, 120, 198, 0.12)`.
   - Dark Slate / Precision Engineering Aesthetic.

---

## 2. High-Level Architecture Overview

CareerHub is a full-stack Next.js application designed to track, organize, and automate job applications ingested through:

1. **Interactive Web Dashboard** (Kanban Board, List/Table, Metrics, Manual Entry).
2. **Telegram Group/Chat Bot Webhook** (Paste job link -> Auto-parse metadata -> Add to user's pipeline).
3. **Direct URL Scraper API** (Fetch OpenGraph metadata from job postings).

```
                      +-----------------------------+
                      |       User Touchpoints      |
                      +--------------+--------------+
                                     |
               +---------------------+---------------------+
               |                                           |
               v                                           v
      [ Next.js Web App ]                        [ Telegram Bot Client ]
  (App Router, Dashboard, Auth)                  (Group / Direct Message)
               |                                           |
               |                                           v
               |                             [ POST /api/telegram/webhook ]
               |                                 (Validate Secret Token)
               +---------------------+---------------------+
                                     |
                                     v
                       +---------------------------+
                       |   Next.js API & Services  |
                       |  - Auth.js (OAuth / Cred) |
                       |  - RBAC Middleware        |
                       |  - Metadata Scraper       |
                       |  - Telegram Parser Engine |
                       +-------------+-------------+
                                     |
                                     v
                       +---------------------------+
                       |      Prisma ORM Client    |
                       +-------------+-------------+
                                     |
                                     v
                       +---------------------------+
                       | Neon PostgreSQL (Pooler)  |
                       +---------------------------+
```

---

## 3. Authentication & RBAC Design

### 3.1 Authentication Providers

- **OAuth Providers**:
  - Google OAuth (`GoogleProvider`)
  - GitHub OAuth (`GitHubProvider`)
- **Credentials Provider**:
  - Email + Password registration and login.
  - Password hashed using `bcryptjs` (salt rounds: 12).
  - Validation using `zod`.

### 3.2 Session & Token Flow

- **Strategy**: JSON Web Token (JWT) session strategy.
- **JWT Payload**:
  ```typescript
  interface SessionUser {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
    role: "USER" | "ADMIN";
    telegramConnected: boolean;
  }
  ```
- **Callbacks**:
  - `jwt`: Injects user ID and database `role` into token.
  - `session`: Attaches token claims directly to `session.user`.

### 3.3 Role-Based Access Control (RBAC)

- Roles: `USER`, `ADMIN`.
- Protected routes handled via `middleware.ts`:
  - `/dashboard/*`: Requires authenticated session (`USER` or `ADMIN`).
  - `/admin/*`: Requires `role === "ADMIN"`.
  - `/api/admin/*`: Requires `role === "ADMIN"`.
  - Public routes: `/`, `/login`, `/register`, `/api/auth/*`, `/api/telegram/webhook`.

---

## 4. UI Design System & Style Tokens

### 4.1 Color Palette

| Token                 | Hex Value             | Usage                                                        |
| :-------------------- | :-------------------- | :----------------------------------------------------------- |
| `primary`             | `#3178C6`             | TypeScript Blue: primary buttons, active tabs, brand accents |
| `primary-hover`       | `#235A97`             | Button hover states, focus outlines                          |
| `primary-subtle`      | `#EBF2FC` / `#16263D` | Active background badge / selected card highlight            |
| `bg-dark`             | `#0A0D12`             | Main page background (Dark mode)                             |
| `surface-dark`        | `#12171F`             | Dashboard cards, navigation bars, modal backgrounds          |
| `border-dark`         | `#202937`             | 1px clean crisp boundaries                                   |
| `text-primary-dark`   | `#F1F5F9`             | Headings, primary text                                       |
| `text-secondary-dark` | `#94A3B8`             | Subtitles, labels, timestamps                                |
| `status-wishlist`     | `#64748B`             | Saved / Wishlist status                                      |
| `status-applied`      | `#3178C6`             | Applied status                                               |
| `status-interview`    | `#EAB308`             | Interviewing / Assessment status                             |
| `status-offer`        | `#10B981`             | Offer received                                               |
| `status-rejected`     | `#EF4444`             | Rejected                                                     |

### 4.2 Geometry & Typography

- **Border Radius**: Near-sharp everywhere.
  - Tailwind config: `borderRadius: { DEFAULT: "2px", sm: "2px", md: "3px", lg: "4px" }`.
- **Typography**: Inter / Outfit for UI, JetBrains Mono for metrics and links.
- **Borders**: 1px solid crisp lines with high contrast separators.

---

## 5. Database Schema Specifications (Prisma)

### Key Models

1. **User**:
   - `id`: UUID (Primary Key)
   - `name`: String?
   - `email`: String (Unique)
   - `emailVerified`: DateTime?
   - `image`: String?
   - `passwordHash`: String?
   - `role`: Role (`USER` | `ADMIN`, default `USER`)
   - `telegramChatId`: String? (Unique)
   - `telegramPairToken`: String? (Unique)
   - `createdAt`, `updatedAt`
2. **Account** & **Session**: NextAuth standard tables for OAuth linkage.
3. **JobApplication**:
   - `id`: UUID
   - `userId`: Foreign Key -> `User.id`
   - `companyName`: String
   - `jobTitle`: String
   - `location`: String?
   - `locationType`: `REMOTE` | `HYBRID` | `ONSITE`
   - `employmentType`: `FULL_TIME` | `PART_TIME` | `CONTRACT` | `INTERNSHIP`
   - `salaryMin`: Decimal?
   - `salaryMax`: Decimal?
   - `currency`: String (default `"USD"`)
   - `jobUrl`: String?
   - `jobDescription`: String? (Text)
   - `source`: `MANUAL` | `TELEGRAM` | `LINK_SCRAPER` | `LINKEDIN` | `OTHER`
   - `status`: `WISHLIST` | `APPLIED` | `SCREENING` | `INTERVIEW` | `OFFER` | `REJECTED` | `WITHDRAWN`
   - `appliedDate`: DateTime?
   - `deadline`: DateTime?
   - `notes`: String?
   - `createdAt`, `updatedAt`
4. **ApplicationActivity**:
   - Audit trail tracking status updates, note additions, and interview logs.

---

## 6. Telegram Ingestion Pipeline

1. **User Account Pairing**:
   - User generates a secure 6-digit or UUID pairing token in `/settings/telegram`.
   - User sends `/start <pairing_token>` or `/link <pairing_token>` to the Telegram Bot.
   - Webhook validates pairing token, stores `telegramChatId` in `User`.
2. **Message Processing**:
   - Webhook receives update (`POST /api/telegram/webhook`).
   - Verifies Telegram Webhook Secret (`X-Telegram-Bot-Api-Secret-Token`).
   - Regex matches URL in the incoming message.
   - Fetches HTML metadata (`og:title`, `og:site_name`, `<title>`, description).
   - Heuristically extracts company and role.
   - Inserts `JobApplication` with source `TELEGRAM` and status `WISHLIST` or `APPLIED`.
   - Replies to user in Telegram with confirmation card link.

---

## 7. Project Structure

```
career-hub/
├── AGENTS.md                      # Single source of truth reference
├── prisma.config.ts               # Prisma 7 configuration (schema, migrations, datasource URL)
├── prisma/
│   └── schema.prisma              # Database schema with Prisma 7 (datasource without url)
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── applications/page.tsx
│   │   │   ├── analytics/page.tsx
│   │   │   └── settings/page.tsx
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   ├── auth/register/route.ts
│   │   │   ├── applications/route.ts
│   │   │   ├── applications/[id]/route.ts
│   │   │   ├── scrape/route.ts
│   │   │   └── telegram/
│   │   │       ├── webhook/route.ts
│   │   │       └── pair/route.ts
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/                    # Reusable primitives (Buttons, Inputs, Dialogs)
│   │   ├── layout/                # Sidebar, Header, Navbar
│   │   ├── applications/          # KanbanBoard, ApplicationList, AddJobModal
│   │   └── telegram/              # TelegramPairModal, TelegramInstructions
│   ├── lib/
│   │   ├── auth.ts                # NextAuth options & handlers
│   │   ├── prisma.ts              # Global Prisma client singleton
│   │   ├── scraper.ts             # Metadata extraction utility
│   │   ├── telegram.ts            # Telegram Bot API helper
│   │   └── validations.ts         # Zod schemas
│   ├── types/
│   │   └── next-auth.d.ts         # Augmented session types
│   └── middleware.ts              # RBAC & route protection
├── .env.example
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

---

## 8. Deployment Checklist (Vercel & Neon)

1. **Environment Variables**:
   - `DATABASE_URL`: Neon PostgreSQL pooled connection string.
   - `AUTH_SECRET`: Generated secret key (`openssl rand -base64 32`).
   - `NEXTAUTH_URL`: Canonical production URL (`https://your-domain.vercel.app`).
   - `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`.
   - `GITHUB_CLIENT_ID` & `GITHUB_CLIENT_SECRET`.
   - `TELEGRAM_BOT_TOKEN`: From Telegram `@BotFather`.
   - `TELEGRAM_WEBHOOK_SECRET`: Secure webhook verification token.
2. **Vercel Build Command**:
   - `prisma generate && next build`
3. **Database Migration**:
   - `npx prisma db push` or `npx prisma migrate deploy`
