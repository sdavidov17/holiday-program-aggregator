# Agent System Architecture

> **Related**: [Agent Journey Map](./agent-journey-map.md) | [PRD Epic 5](/docs/reference/prd.md#epic-5-agentic-provider-discovery-p0)

## Overview

An autonomous agent system that discovers, researches, and onboards holiday program providers with human-in-the-loop approval at key decision points.

**Key Design Decisions:**
- **Human-in-the-loop**: Agent researches and drafts; human approves before adding providers or sending emails
- **Transparent outreach**: Emails from platform founder - honest about who we are
- **Claude API (Sonnet)**: Powers research analysis and email generation
- **Trigger.dev**: Background job processing (free tier: 10K runs/month)
- **Feature Toggle**: Entire system behind `AGENT_ENABLED` flag

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    ADMIN DASHBOARD                               │
│  Research Queue → Lead Review → Outreach Approval → Verification │
└─────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────┴───────────────────────────────────┐
│                    AGENT SERVICES                                │
│  ResearchAgent │ OutreachAgent │ VerificationService │ ClaudeAPI │
└─────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────┴───────────────────────────────────┐
│              BACKGROUND JOB INFRASTRUCTURE                       │
│         Trigger.dev Tasks + PostgreSQL Job Queue                 │
└─────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────┴───────────────────────────────────┐
│                    EXTERNAL INTEGRATIONS                         │
│  Google Places API │ ABN Lookup │ Web Scraping │ Resend          │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Models

### ResearchTask
Tracks provider research requests by region.

```prisma
model ResearchTask {
  id            String   @id @default(cuid())
  region        String   // NSW, VIC, QLD, etc.
  dataSource    DataSource
  status        TaskStatus
  llmTokensUsed Int      @default(0)
  createdAt     DateTime @default(now())
  completedAt   DateTime?

  leads         ProviderLead[]
}

enum DataSource {
  WEB_SEARCH
  GOOGLE_PLACES
  MANUAL_SEED
  COMBINED
}

enum TaskStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  FAILED
}
```

### ProviderLead
Discovered providers awaiting human approval.

```prisma
model ProviderLead {
  id               String   @id @default(cuid())

  // Business info
  businessName     String
  email            String?
  phone            String?
  address          String?
  website          String?

  // Discovery source
  sourceType       String
  sourceUrl        String?
  researchSummary  String   @db.Text
  confidenceScore  Float    // 0-1

  // Google Reviews
  googleRating       Float?
  googleReviewCount  Int?
  googlePlaceId      String?
  googleMapsUrl      String?
  googleReviewsSynced DateTime?

  // Verification
  abn              String?
  abnVerified      Boolean  @default(false)

  // Workflow
  status           LeadStatus
  researchTaskId   String?

  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}

enum LeadStatus {
  PENDING_REVIEW
  APPROVED
  REJECTED
  DUPLICATE
  CONVERTED
}
```

### OutreachLog
Tracks all email communications.

```prisma
model OutreachLog {
  id            String   @id @default(cuid())
  providerLeadId String

  type          OutreachType
  status        OutreachStatus

  // Email content
  subject       String
  originalBody  String   @db.Text  // AI-generated
  bodyHtml      String   @db.Text  // Final (may be edited)

  // Tracking
  sentAt        DateTime?
  deliveredAt   DateTime?
  openedAt      DateTime?
  repliedAt     DateTime?

  createdAt     DateTime @default(now())
}

enum OutreachType {
  INITIAL_OUTREACH
  FOLLOW_UP_1
  FOLLOW_UP_2
  TERM_CONFIRMATION
}

enum OutreachStatus {
  DRAFT
  PENDING_APPROVAL
  APPROVED
  SENT
  DELIVERED
  OPENED
  REPLIED
  BOUNCED
}
```

### TermConfirmation
Tracks provider re-confirmation each school term.

```prisma
model TermConfirmation {
  id                String   @id @default(cuid())
  providerId        String

  year              Int
  term              Int      // 1-4
  state             String   // NSW, VIC, etc.

  confirmationToken String   @unique
  status            ConfirmationStatus
  remindersSent     Int      @default(0)

  confirmedAt       DateTime?
  createdAt         DateTime @default(now())
}

enum ConfirmationStatus {
  PENDING
  REMINDER_SENT
  CONFIRMED
  NOT_RESPONDING
}
```

---

## Key Services

### ClaudeClientService
`/apps/web/src/services/agent/claude-client.service.ts`

```typescript
class ClaudeClientService {
  // Extract provider info from website
  async extractProviderInfo(url: string, html: string): Promise<ProviderInfo>;

  // Generate outreach email
  async generateEmail(template: EmailTemplate, context: EmailContext): Promise<GeneratedEmail>;

  // Analyze provider reply
  async analyzeReply(original: string, reply: string): Promise<ReplyAnalysis>;

  // Assess data quality
  async assessDataQuality(lead: ProviderLead): Promise<number>; // 0-1 score
}
```

### ResearchAgentService
`/apps/web/src/services/agent/research-agent.service.ts`

```typescript
class ResearchAgentService {
  // Start discovery
  async createResearchTask(region: string, sources: DataSource[]): Promise<ResearchTask>;

  // Run research pipeline
  async processResearchTask(taskId: string): Promise<void>;

  // Admin actions
  async reviewLead(leadId: string, decision: 'approve' | 'reject' | 'duplicate'): Promise<void>;

  // Convert to provider
  async convertLeadToProvider(leadId: string): Promise<Provider>;
}
```

### OutreachAgentService
`/apps/web/src/services/agent/outreach-agent.service.ts`

```typescript
class OutreachAgentService {
  // Generate email draft
  async generateOutreachEmail(leadId: string, type: OutreachType): Promise<OutreachLog>;

  // Admin approval
  async approveEmail(outreachId: string, edits?: Partial<OutreachLog>): Promise<void>;

  // Send via Resend
  async sendEmail(outreachId: string): Promise<void>;

  // Handle replies
  async processReply(outreachId: string, content: string): Promise<void>;
}
```

---

## External Integrations

| Service | Purpose | Rate Limit | Cost |
|---------|---------|------------|------|
| **Claude API** | Research analysis, email generation | 50 req/min | ~$15/mo |
| **Google Places** | Business discovery + reviews | 1000 req/day | ~$25/mo |
| **ABN Lookup** | Business verification | 500 req/day | Free |
| **Resend** | Email sending + webhooks | 100 emails/day | $20/mo |
| **Trigger.dev** | Background jobs | 10K runs/mo | Free |

### Google Reviews Integration

Capture during discovery:
- `googleRating` - Star rating (e.g., 4.3)
- `googleReviewCount` - Number of reviews
- `googlePlaceId` - For linking to Google Maps
- `googleMapsUrl` - Direct link

Display on provider pages:
```
★★★★☆ 4.3 on Google (127 reviews) [View on Google Maps ↗]
```

---

## Background Jobs (Trigger.dev)

| Task | Trigger | Purpose |
|------|---------|---------|
| `research.process` | On demand | Process research task |
| `outreach.generate` | On lead approval | Generate email draft |
| `outreach.send` | On email approval | Send via Resend |
| `verification.abn` | On lead creation | Verify ABN |
| `term.reminder` | Daily schedule | Send term reminders |

---

## Admin Dashboard Pages

| Page | Purpose |
|------|---------|
| `/admin/agent/research` | Create/monitor research tasks |
| `/admin/agent/leads` | Review discovered leads |
| `/admin/agent/outreach` | Preview, edit, approve emails |
| `/admin/agent/verification` | Review verification status |
| `/admin/agent/terms` | Term confirmation dashboard |

---

## Environment Variables

```bash
# Feature Toggle
AGENT_ENABLED=false

# Trigger.dev
TRIGGER_SECRET_KEY=tr_dev_...
TRIGGER_PUBLIC_API_KEY=tr_pub_...

# Claude API
ANTHROPIC_API_KEY=sk-ant-...

# External APIs
GOOGLE_PLACES_API_KEY=AIza...
ABN_LOOKUP_GUID=...

# Budget Controls
AGENT_DAILY_BUDGET_AUD=50

# Email Tracking
RESEND_WEBHOOK_SECRET=...
```

---

## Feature Toggle

```typescript
// src/services/agent/config.ts
export function isAgentEnabled(): boolean {
  return env.AGENT_ENABLED === 'true';
}

// Usage in admin pages
if (!isAgentEnabled()) {
  return <div>Agent system is not enabled</div>;
}

// Usage in API routes
if (!isAgentEnabled()) {
  throw new TRPCError({ code: 'FORBIDDEN', message: 'Agent system disabled' });
}
```

---

## Implementation Phases

| Phase | Focus | Key Deliverables |
|-------|-------|------------------|
| **1** | Foundation | Prisma models, Trigger.dev setup, feature toggle |
| **2** | Research | Google Places, ABN Lookup, Claude client, admin UI |
| **3** | Outreach | Email templates, approval workflow, Resend webhooks |
| **4** | Verification | Document requests, manual verification UI |
| **5** | Term Confirmations | Provider portal, reminder sequences |
| **6** | Polish | Error handling, cost tracking, monitoring |

---

## Security Considerations

- **PII Encryption**: Use `encryption.ts` for sensitive lead data
- **Audit Logging**: All agent actions logged via audit system
- **Rate Limiting**: Prevent API cost overruns
- **Data Retention**: Delete unprocessed leads after 30 days
- **Email Compliance**: Include unsubscribe, follow CAN-SPAM
