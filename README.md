# CareerHub

[![Next.js 16](https://img.shields.io/badge/Next.js-16.4.3-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS 4](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-7.10.1-2D3748?style=flat-square&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Neon Database](https://img.shields.io/badge/Neon-PostgreSQL-00E599?style=flat-square&logo=postgresql&logoColor=white)](https://neon.tech/)
[![Auth.js](https://img.shields.io/badge/Auth.js-v5_Beta-black?style=flat-square&logo=auth0&logoColor=white)](https://authjs.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-3178C6?style=flat-square)](LICENSE)

CareerHub is a full-stack career pipeline and job application tracker designed with a dark slate, precision engineering aesthetic. It automates job tracking through interactive web boards, direct link scraping, and Telegram chat bot webhooks powered by configurable LLM extraction.

---

## Architecture Overview

```mermaid
graph TD
    subgraph Clients ["Client Interfaces"]
        Web["Web Application (Next.js Dashboard)"]
        Telegram["Telegram Client (Chat / Group)"]
    end

    subgraph Gateway ["Next.js 16 Gateway"]
        Proxy["Proxy Route Guard (proxy.ts)"]
        Webhook["Telegram Webhook (/api/telegram/webhook)"]
    end

    subgraph CoreServices ["Core Services"]
        Auth["Auth.js v5 (OAuth & Credentials)"]
        Scraper["Metadata Scraper (Cheerio)"]
        LLM["Multi-Provider LLM Dispatcher"]
        Crypto["AES-256-GCM Cryptographic Service"]
        SWR["Client State & Real-Time Sync (SWR)"]
    end

    subgraph Storage ["Database Layer"]
        PrismaClient["Prisma 7 ORM"]
        Database[("Neon PostgreSQL")]
    end

    Web --> Proxy
    Telegram --> Webhook

    Proxy --> Auth
    Proxy --> Scraper
    Webhook --> Scraper

    Scraper --> LLM
    LLM --> Crypto
    Web -.-> SWR

    Auth --> PrismaClient
    Scraper --> PrismaClient
    PrismaClient --> Database
```

---

## Key Features

- **Pipeline Board & Table Views**: Track job statuses (`WISHLIST`, `APPLIED`, `SCREENING`, `INTERVIEW`, `OFFER`, `REJECTED`, `WITHDRAWN`) with fluid modal editing and dedicated link navigation.
- **Configurable LLM Extraction**: Users can connect their own AI provider (Google Gemini, OpenAI, Anthropic Claude, or Custom OpenAI-compatible endpoints such as Groq or Ollama) with in-app connection testing.
- **Encrypted Credential Storage**: User API keys are encrypted at rest using AES-256-GCM authenticated encryption derived from the application secret key.
- **Telegram Bot Automation**: Pair your personal or group Telegram chat via a one-time pairing code. Drop any job posting link into the chat to automatically parse and record the opportunity.
- **Real-Time Interface (SWR)**: Seamless cache revalidation on window focus and optimistic updates across kanban boards, tables, and navbar indicators.
- **Next.js 16 Proxy Architecture**: Server-side request routing and role-based access control (`USER` and `ADMIN`) implemented via `src/proxy.ts`.
- **Near-Sharp Design System**: Precision dark slate styling with TypeScript Blue accents (`#3178C6`), high contrast dividers, and 2px to 3px border radiuses.

---

## Ingestion Pipeline

```mermaid
sequenceDiagram
    autonumber
    actor User as User / Telegram Client
    participant API as Ingestion API
    participant Scraper as Scraper Engine
    participant AI as LLM Provider (User Configured)
    participant DB as Neon PostgreSQL

    User->>API: Send Job Posting URL
    API->>DB: Retrieve User Provider & Decrypted Key
    API->>Scraper: Fetch Webpage Content & Metadata
    alt User Has Active LLM Provider
        Scraper->>AI: Send Cleaned HTML Text
        AI-->>Scraper: Return Structured Data (Title, Company, Location, Workplace)
    else Heuristic Fallback
        Scraper->>Scraper: Extract OpenGraph and Meta Tags via RegEx
    end
    Scraper-->>API: Normalized Application Record
    API->>DB: Persist JobApplication
    API-->>User: Confirmation Notification & SWR Revalidation
```

---

## Authentication Flow

```mermaid
graph LR
    subgraph Providers ["Auth Providers"]
        Google["Google OAuth"]
        GitHub["GitHub OAuth"]
        Creds["Credentials (bcryptjs)"]
    end

    subgraph Session ["Session Strategy"]
        JWT["JWT Token with Role & Telegram Claims"]
    end

    subgraph Protection ["Route Access (proxy.ts)"]
        Public["Public: /, /login, /register"]
        Dashboard["Protected: /dashboard, /applications, /settings"]
        Admin["Admin Only: /admin/*, /api/admin/*"]
    end

    Google --> JWT
    GitHub --> JWT
    Creds --> JWT

    JWT --> Public
    JWT --> Dashboard
    JWT --> Admin
```

---

## Getting Started

### Prerequisites

- Node.js 20 or higher
- PostgreSQL database (e.g., Neon serverless Postgres)
- npm, pnpm, or yarn

### Environment Configuration

Create a `.env` file in the root directory and configure the following variables:

```bash
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://user:password@ep-sample-pooler.region.neon.tech/neondb?sslmode=require"

# NextAuth Authentication
AUTH_SECRET="your-generated-secret-key-32-bytes"
NEXTAUTH_URL="http://localhost:3000"

# OAuth Providers
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

# Telegram Bot Ingestion
TELEGRAM_BOT_TOKEN=""
TELEGRAM_BOT_USERNAME=""
TELEGRAM_WEBHOOK_SECRET=""
```

### Installation

1. Install dependencies:

   ```bash
   npm install
   ```

2. Generate Prisma client and push schema to database:

   ```bash
   npx prisma generate
   npx prisma db push
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open `http://localhost:3000` in your browser.

---

## Available Scripts

- `npm run dev`: Runs the local Next.js development server with Turbopack.
- `npm run build`: Generates the Prisma client and compiles the Next.js production bundle.
- `npm run start`: Launches the compiled production application.
- `npm run lint`: Executes ESLint code quality checks.

---

## Production Deployment

### Vercel & Neon

1. Connect your repository to Vercel.
2. In Project Settings > Environment Variables, add all values from your `.env` configuration.
3. Configure the build command as `prisma generate && next build`.
4. Deploy the project. Database migrations can be executed directly using `npx prisma db push` or `npx prisma migrate deploy`.
