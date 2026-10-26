<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# CareerHub — System Architecture & Engineering Reference (AGENTS.md)

[![Architecture: Next.js 16 Proxy](https://img.shields.io/badge/Architecture-Next.js_16_Proxy-3178C6?style=flat-square)](src/proxy.ts)
[![Database: Prisma 7](https://img.shields.io/badge/Database-Prisma_7_|_Neon-2D3748?style=flat-square)](prisma/schema.prisma)
[![Security: AES--256--GCM](https://img.shields.io/badge/Security-AES--256--GCM-10B981?style=flat-square)](src/lib/encryption.ts)

This document is the permanent architectural reference, design specification, and engineering standard for CareerHub. All code modifications, API additions, and UI updates must adhere to the rules outlined here.

---

## 1. Core Engineering Rules & Constraints

1. **Max Lines per File**: No file must exceed **350 lines of code**. Large components or handlers must be modularized into domain hooks, utilities, or subcomponents.
2. **Clean Code**:
   - Zero unused imports or variables.
   - Strictly typed TypeScript without untyped escapes.
   - No commented-out dead code or speculative stubs.
   - No emojis anywhere: not in code, UI text, commit messages, or documentation. Use clean SVG vector icons (e.g., `lucide-react`).
3. **UI Edge Styling**:
   - Component edges must be **near-sharp**: maximum border-radius of **2px to 3px** (`rounded-xs`).
   - Heavy rounded corners (`rounded-lg`, `rounded-xl`, `rounded-full`) are strictly prohibited.
4. **Color Theme**:
   - Primary Accent: TypeScript Blue (`#3178C6`).
   - Primary Hover: `#235A97`.
   - Subtle Accent Tint: `rgba(49, 120, 198, 0.12)`.
   - Dark Slate Aesthetic: Background `#0A0D12`, Surface `#12171F`, Border `#202937`.

---

## 2. High-Level Architecture Overview

CareerHub is a full-stack Next.js application that centralizes, parses, and manages career opportunities through web interactions, direct URL scraping, and Telegram bot webhooks.

```mermaid
graph TD
    subgraph Client ["Client Layer"]
        Browser["Next.js Web Dashboard"]
        TGApp["Telegram Client"]
    end

    subgraph EdgeGateway ["Network Gateway & Proxy"]
        Proxy["Next.js 16 Proxy (proxy.ts)<br/>Route Guards & Session Check"]
        TGWebhook["POST /api/telegram/webhook<br/>Secret Token Validation"]
    end

    subgraph Services ["Application Services"]
        AuthSvc["Auth.js v5 (OAuth & Credentials)"]
        ScraperSvc["Scraper Engine (Cheerio)"]
        LLMSvc["LLM Provider Dispatcher<br/>(Gemini, OpenAI, Anthropic, Custom)"]
        CryptoSvc["AES-256-GCM Encryption"]
    end

    subgraph Data ["Data Layer"]
        Prisma["Prisma ORM (v7 Adapter)"]
        NeonDB[("Neon PostgreSQL Database")]
    end

    Browser -->|HTTP Requests| Proxy
    TGApp -->|Bot Updates| TGWebhook

    Proxy --> AuthSvc
    Proxy --> ScraperSvc
    TGWebhook --> ScraperSvc

    ScraperSvc --> LLMSvc
    LLMSvc --> CryptoSvc

    AuthSvc --> Prisma
    ScraperSvc --> Prisma
    Prisma --> NeonDB
```

---

## 3. Ingestion & Extraction Workflow

Job URLs ingested through manual input or Telegram messages undergo metadata parsing and LLM structured extraction before being committed to the user pipeline.

```mermaid
sequenceDiagram
    autonumber
    actor User as User / Telegram Member
    participant Ingest as Ingestion Endpoint (/api/scrape or Webhook)
    participant Scraper as Scraper Service
    participant LLM as LLM Provider
    participant DB as Neon PostgreSQL (via Prisma)

    User->>Ingest: Submit Job URL
    Ingest->>DB: Fetch User LLM Config (Decrypted Key)
    Ingest->>Scraper: Fetch HTML & Extract OpenGraph Tags
    alt LLM Key Available
        Scraper->>LLM: Send Cleaned Body Content & Prompt
        LLM-->>Scraper: Return Structured JSON (Title, Company, Location, Workplace)
    else Fallback Heuristics
        Scraper->>Scraper: Parse Regex & Meta Fallbacks
    end
    Scraper-->>Ingest: Normalized Job Application Data
    Ingest->>DB: Insert or Update JobApplication
    Ingest-->>User: Confirmation Status & UI Synchronization (SWR)
```

---

## 4. Authentication & Security Model

```mermaid
graph LR
    subgraph AuthMethods ["Authentication Methods"]
        OAuth["Google & GitHub OAuth"]
        Creds["Email & Password (bcryptjs)"]
    end

    subgraph TokenEngine ["Session Engine"]
        JWT["JWT Strategy"]
        Claims["Claims: ID, Role, Telegram Status"]
    end

    subgraph RouteGuards ["Proxy Guards (proxy.ts)"]
        Pub["Public Routes (/, /login, /register)"]
        UserArea["Protected Routes (/dashboard, /applications, /settings)"]
        AdminArea["Admin Routes (/admin/*, /api/admin/*)"]
    end

    OAuth --> JWT
    Creds --> JWT
    JWT --> Claims
    Claims --> RouteGuards

    RouteGuards -->|Valid Session| UserArea
    RouteGuards -->|role == ADMIN| AdminArea
    RouteGuards -->|Unauthenticated| Pub
```

### Session User Interface

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

---

## 5. Multi-Provider AI Architecture

Users can configure their own LLM providers for parsing job postings, reducing reliance on global quotas and improving domain accuracy.

```mermaid
flowchart TD
    Config["User LLM Config Form"] --> Validation{"Validate Provider & Key"}
    Validation -->|Test Request| TestEndpoint["POST /api/user/llm (test)"]
    TestEndpoint -->|Success| SaveConfig["Encrypt API Key (AES-256-GCM)"]
    SaveConfig --> StoreDB["Store in User Table"]

    subgraph ProviderAdapters ["Supported LLM Adapters"]
        P1["Google Gemini (gemini-2.5-flash / gemini-flash-lite)"]
        P2["OpenAI (gpt-4o / gpt-4o-mini)"]
        P3["Anthropic Claude (claude-3-5-sonnet / haiku)"]
        P4["Custom Endpoint (Groq / Ollama / DeepSeek compatible)"]
    end

    StoreDB --> ProviderAdapters
```

### Encryption Specification

- **Algorithm**: `aes-256-gcm` authenticated encryption.
- **Key Derivation**: SHA-256 digest derived from `AUTH_SECRET`.
- **Payload Format**: `enc:v1:<iv_hex>:<auth_tag_hex>:<ciphertext_hex>`.
- Plaintext API keys are never stored in the database or exposed via API responses. Responses return only masked hints (e.g., `sk-ant...a91c`).

---

## 6. Real-Time State Management (SWR)

- **Global SWR Cache**: Application records, Telegram status, and metrics use SWR for cache invalidation and window focus revalidation.
- **Telegram Hook (`useTelegramStatus`)**: Ensures navigation badges, dashboard action cards, and pairing modals update synchronously across browser tabs and webhook completions.
- **Optimistic Pipeline Actions**: Kanban column moves and table status toggles execute immediate UI mutations with automatic rollback on server error.

---

## 7. Database Specification & Schema Models

### Key Entities

1. **User**:
   - `id`: UUID (Primary Key).
   - `email`: String (Unique).
   - `passwordHash`: String (Optional, for credentials auth).
   - `role`: Role (`USER` | `ADMIN`, default `USER`).
   - `telegramChatId`: String (Unique, nullable).
   - `telegramPairToken`: String (Unique, nullable).
   - `llmProvider`: String (Default `"GEMINI"`).
   - `llmApiKeyHash`: Text (AES-256-GCM ciphertext).
   - `llmEndpoint`: String (Custom OpenAI-compatible base URL).
   - `llmModel`: String (Selected model identifier).
2. **JobApplication**:
   - `id`: UUID.
   - `userId`: Foreign Key -> `User.id`.
   - `companyName`: String.
   - `jobTitle`: String.
   - `location`: String (Nullable).
   - `locationType`: `REMOTE` | `HYBRID` | `ONSITE`.
   - `employmentType`: `FULL_TIME` | `PART_TIME` | `CONTRACT` | `INTERNSHIP`.
   - `salaryMin`, `salaryMax`, `currency`: Decimal compensation ranges.
   - `jobUrl`, `jobDescription`: Original posting details.
   - `source`: `MANUAL` | `TELEGRAM` | `LINK_SCRAPER` | `LINKEDIN` | `OTHER`.
   - `status`: `WISHLIST` | `APPLIED` | `SCREENING` | `INTERVIEW` | `OFFER` | `REJECTED` | `WITHDRAWN`.
   - `appliedDate`, `deadline`: Temporal tracking.
3. **ApplicationActivity**:
   - Audit trail capturing status transitions, note additions, and interaction timestamps.

---

## 8. Deployment & Operational Checklist

1. **Environment Variables**:
   - `DATABASE_URL`: Neon PostgreSQL pooled connection URL.
   - `AUTH_SECRET`: Secret key for session signing and API key encryption (`openssl rand -base64 32`).
   - `NEXTAUTH_URL`: Canonical production domain URL.
   - `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`.
   - `GITHUB_CLIENT_ID` & `GITHUB_CLIENT_SECRET`.
   - `TELEGRAM_BOT_TOKEN`: Bot token generated via BotFather.
   - `TELEGRAM_WEBHOOK_SECRET`: Token passed in `X-Telegram-Bot-Api-Secret-Token`.
2. **Build Configuration**:
   - Command: `prisma generate && next build`.
   - Proxy convention: `src/proxy.ts` (Next.js 16 standard).
3. **Database Migration**:
   - Schema synchronization: `npx prisma db push` or `npx prisma migrate deploy`.
