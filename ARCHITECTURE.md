# GeoDomain Scout - Full-Stack Architecture

## Overview
Production-ready Next.js application for discovering geo-service domain opportunities and matching them with local business prospects.

## Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI primitives)
- **State Management**: React Context API + Server State via React Query
- **Animations**: Framer Motion
- **Forms**: React Hook Form + Zod validation
- **Drag & Drop**: @hello-pangea/dnd

### Backend
- **Runtime**: Next.js API Routes (Edge/Node)
- **Database**: PostgreSQL (Neon - serverless)
- **ORM**: Prisma
- **Validation**: Zod schemas
- **APIs**: Google Places, Dynadot Domain API

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Next.js App                          │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                 Client Layer (Browser)                │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────────┐  │  │
│  │  │  Landing   │  │ Dashboard  │  │  CRM Pipeline  │  │  │
│  │  │    Page    │  │    Page    │  │     Page       │  │  │
│  │  └────────────┘  └────────────┘  └────────────────┘  │  │
│  │         │               │                  │          │  │
│  │         └───────────────┴──────────────────┘          │  │
│  │                         │                             │  │
│  │                  ┌──────▼──────┐                      │  │
│  │                  │   React     │                      │  │
│  │                  │   Context   │                      │  │
│  │                  │  (State)    │                      │  │
│  │                  └──────┬──────┘                      │  │
│  │                         │                             │  │
│  └─────────────────────────┼─────────────────────────────┘  │
│                            │                                │
│                            │ API Calls (fetch)              │
│                            │                                │
│  ┌─────────────────────────▼─────────────────────────────┐  │
│  │              Server Layer (API Routes)               │  │
│  │  ┌─────────────────────────────────────────────────┐ │  │
│  │  │        /api/search                              │ │  │
│  │  │  Orchestrates entire search flow                │ │  │
│  │  └─────────────────────────────────────────────────┘ │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │  │
│  │  │ /api/domains │  │  /api/leads  │  │ /api/notes│ │  │
│  │  └──────────────┘  └──────────────┘  └───────────┘ │  │
│  │         │                 │                 │        │  │
│  └─────────┼─────────────────┼─────────────────┼────────┘  │
│            │                 │                 │           │
│            ▼                 ▼                 ▼           │
│  ┌─────────────────────────────────────────────────────┐  │
│  │              Business Logic Layer                   │  │
│  │  ┌────────────────┐  ┌─────────────────────────┐   │  │
│  │  │    Domain      │  │   Business Matching     │   │  │
│  │  │   Generator    │  │      Service            │   │  │
│  │  └────────────────┘  └─────────────────────────┘   │  │
│  │  ┌────────────────┐  ┌─────────────────────────┐   │  │
│  │  │    Search      │  │   Scoring Engine        │   │  │
│  │  │  Orchestrator  │  │  (Quality, SEO, Buyer)  │   │  │
│  │  └────────────────┘  └─────────────────────────┘   │  │
│  └─────────────────────────────────────────────────────┘  │
│            │                 │                            │
│            ▼                 ▼                            │
│  ┌─────────────────────────────────────────────────────┐  │
│  │            Provider Abstraction Layer               │  │
│  │  ┌───────────────┐  ┌──────────────┐  ┌──────────┐ │  │
│  │  │    Domain     │  │     Lead     │  │  Email   │ │  │
│  │  │   Provider    │  │   Provider   │  │ Extractor│ │  │
│  │  │   (Dynadot)   │  │ (Google Maps)│  │(Scraper) │ │  │
│  │  └───────────────┘  └──────────────┘  └──────────┘ │  │
│  │         │                 │                 │        │  │
│  └─────────┼─────────────────┼─────────────────┼────────┘  │
│            │                 │                 │           │
└────────────┼─────────────────┼─────────────────┼───────────┘
             │                 │                 │
             ▼                 ▼                 ▼
    ┌────────────────┐  ┌─────────────┐  ┌────────────┐
    │ Dynadot API    │  │ Google      │  │ Website    │
    │                │  │ Places API  │  │ Scraping   │
    └────────────────┘  └─────────────┘  └────────────┘

             ┌────────────────────────────┐
             │   PostgreSQL (Neon)        │
             │   - SearchQuery            │
             │   - DomainOpportunity      │
             │   - BusinessLead           │
             │   - OpportunityMatch       │
             │   - ActivityNote           │
             └────────────────────────────┘
```

## Data Flow

### 1. Search Flow
```
User Input (Dashboard)
  → POST /api/search
    → Validate with Zod
    → Generate domain candidates
    → Check availability (parallel, batched)
    → Search businesses (Google Places)
    → Enrich with emails (rate-limited)
    → Calculate scores
    → Match domains to businesses
    → Save to database
    → Return results
  ← Render in UI (preserved design)
```

### 2. Domain Generation Flow
```
Input: niche + city + state
  → Generate variations:
    - {city}{service}.com
    - {state}{service}.com
    - {service}{city}.com
    - With modifiers (pros, experts, etc.)
  → Score each domain:
    - Quality (length, readability, memorability)
    - SEO (geo-relevance, keyword strength)
    - Resale (market value estimation)
  → Filter and rank
  → Return top candidates
```

### 3. Business Matching Flow
```
Available Domains + Business Leads
  → Calculate buyer score for each business:
    - Weak current domain (+high)
    - Missing website (+very high)
    - High reviews but weak online presence (+high)
    - Geo-service fit (+medium)
  → Match each domain to best-fit businesses:
    - Exact niche match
    - Geographic alignment
    - Domain need assessment
  → Calculate fit score
  → Generate match reasons
  → Store OpportunityMatch
  → Return matched pairs
```

## Database Schema

### Core Entities

**SearchQuery**
- Tracks searches for caching and analytics
- Links to generated domains

**DomainOpportunity**
- Generated domain with scores
- Availability status
- Reasons for quality rating

**BusinessLead**
- Complete prospect profile
- Contact information
- CRM status tracking
- Buyer score

**OpportunityMatch**
- Links domain to business
- Fit score and reasoning
- Unique per pair

**ActivityNote**
- Chronological notes
- Tied to business lead

## Provider Pattern

### Domain Provider
```typescript
interface DomainProvider {
  checkAvailability(domains: string[]): Promise<AvailabilityResult[]>
}

Implementations:
- DynadotProvider (production)
- MockProvider (demo/development)
```

### Lead Provider
```typescript
interface LeadProvider {
  searchBusinesses(params): Promise<BusinessLeadSeed[]>
  getBusinessDetails(placeId): Promise<BusinessLeadDetails>
}

Implementations:
- GooglePlacesProvider (production)
- MockProvider (demo/development with existing mock data)
```

### Email Extractor
```typescript
interface EmailExtractorProvider {
  extractPublicEmails(url): Promise<PublicEmailResult>
}

Implementations:
- WebsiteScraperProvider (production)
- MockProvider (demo/development)
```

## API Endpoints

### Search
- `POST /api/search` - Main search orchestration

### Domains
- `POST /api/domains/generate` - Generate domain candidates
- `POST /api/domains/availability` - Check availability

### Leads
- `POST /api/leads/search` - Search for businesses
- `POST /api/leads/enrich` - Enrich with email/details
- `GET /api/leads/[id]` - Get lead details
- `PATCH /api/leads/[id]` - Update lead status

### Opportunities
- `GET /api/opportunities` - List saved opportunities
- `POST /api/opportunities` - Create opportunity
- `GET /api/opportunities/[id]` - Get opportunity details
- `PATCH /api/opportunities/[id]` - Update opportunity
- `DELETE /api/opportunities/[id]` - Delete opportunity

### Notes
- `GET /api/notes?businessLeadId={id}` - List notes
- `POST /api/notes` - Create note
- `PATCH /api/notes/[id]` - Update note
- `DELETE /api/notes/[id]` - Delete note

## Security & Compliance

### Environment Variables
- All API keys server-side only
- Validated with Zod on startup
- Never exposed to client

### Data Handling
- Only public emails extracted from websites
- No email fabrication or guessing
- Clear source attribution
- Only generic geo-service domains (no trademarks)

### Rate Limiting
- Provider calls batched and throttled
- Caching for repeated queries
- Exponential backoff on errors

## Performance Optimizations

### Database
- Indexed frequently queried fields
- Optimized Prisma queries (select only needed fields)
- Connection pooling (Neon handles automatically)

### Caching Strategy
- Domain availability: 1 hour TTL
- Business search: 30 minutes TTL
- Place details: 24 hours TTL

### Parallel Processing
- Domain availability checks (batched)
- Business enrichment (rate-limited parallel)
- Independent score calculations

## Deployment

### Environment Setup
1. Set DATABASE_URL (Neon PostgreSQL)
2. Set GOOGLE_MAPS_API_KEY
3. Set DYNADOT_ACCOUNT_API_KEY
4. Run `npx prisma migrate deploy`
5. Deploy to Vercel/similar

### Production vs Demo Mode
- `DEMO_MODE=false` - Uses real APIs
- `DEMO_MODE=true` - Uses mock providers (no API calls)

## Monitoring & Logging

### Error Tracking
- Provider errors logged with context
- API errors returned with safe messages
- Database errors handled gracefully

### Analytics
- Search queries logged
- Provider performance tracked
- User flow metrics

## Future Enhancements

- Real-time domain availability updates
- Email verification service
- Advanced filtering and sorting
- Bulk export functionality
- Email templates for outreach
- Integration with domain registrars
