# GeoDomain Scout - Full-Stack Upgrade Implementation Roadmap

## Project Overview
Upgrade the existing Next.js prototype into a production-ready full-stack application with real APIs, database persistence, and live data providers while preserving 100% of the current UI/UX.

## Critical Constraints
- ✅ PRESERVE current UI exactly as-is
- ✅ PRESERVE all existing components
- ✅ PRESERVE current styling (Tailwind, colors, spacing, typography)
- ✅ PRESERVE current animations and interactions
- ✅ PRESERVE current user flow
- ✅ NO redesigns, NO visual changes, NO layout changes
- ✅ Only add backend functionality and wire up real data

---

## Phase 1: Foundation & Database Setup
**Status**: ✅ COMPLETE (100%)

### Tasks

#### 1.1 Environment & Configuration
- [x] Create `.env.example` with all required variables
- [x] Set up `.env.local` with provided credentials
- [x] Add environment variable validation using Zod (`lib/env.ts`)
- [x] Configure DATABASE_URL (Neon PostgreSQL)
- [x] Configure GOOGLE_MAPS_API_KEY
- [x] Configure DYNADOT_ACCOUNT_API_KEY
- [x] Configure NEXT_PUBLIC_APP_URL

#### 1.2 Prisma Setup
- [x] Install Prisma dependencies (`prisma`, `@prisma/client`)
- [x] Initialize Prisma with PostgreSQL provider
- [x] Create Prisma schema with all models:
  - SearchQuery
  - DomainOpportunity
  - BusinessLead
  - OpportunityMatch
  - ActivityNote
  - SavedFilter
- [x] Run initial migration
- [x] Generate Prisma Client
- [x] Create database utilities in `lib/db.ts`
- [x] Test database connection

#### 1.3 Type Definitions & Schemas
- [x] Audit existing types in `src/types/index.ts`
- [x] Create Zod schemas in `lib/schemas/` for:
  - Search input validation (`search.ts`)
  - Domain generation validation (`domain.ts`)
  - Business search validation (`lead.ts`)
  - Email enrichment validation (`lead.ts`)
  - Opportunity creation/update (`opportunity.ts`)
  - Note creation (`note.ts`)
- [x] Create API response types
- [x] Create provider interface types (`lib/providers/types.ts`)
- [x] Ensure compatibility with existing UI types

#### 1.4 Project Structure Audit
- [x] Document current file structure
- [x] Identify components that need API integration
- [x] Identify mock data to be replaced
- [x] Map existing UI flows to new backend endpoints
- [x] Create architecture diagram (`ARCHITECTURE.md`)

**Phase 1 Completion Criteria**: ✅ Database connected, Prisma schema deployed, all types and schemas defined, environment configured.

---

## Phase 2: Provider Abstraction Layer
**Status**: ⏳ Not Started

### Tasks

#### 2.1 Provider Interfaces
- [ ] Create `lib/providers/types.ts` with provider interfaces:
  - `DomainProvider` interface
  - `LeadProvider` interface
  - `EmailExtractorProvider` interface
- [ ] Define provider result types
- [ ] Define error handling patterns
- [ ] Create provider configuration types

#### 2.2 Domain Provider Implementation
- [ ] Create `lib/providers/domain/base.ts` (abstract provider)
- [ ] Implement `lib/providers/domain/dynadot.ts`:
  - Domain availability check via Dynadot API
  - Bulk availability checking
  - Rate limiting
  - Error handling
  - Response normalization
- [ ] Implement `lib/providers/domain/mock.ts` (demo mode)
- [ ] Create domain provider factory in `lib/providers/domain/index.ts`
- [ ] Add unit tests for domain providers

#### 2.3 Lead Provider Implementation
- [ ] Create `lib/providers/leads/base.ts` (abstract provider)
- [ ] Implement `lib/providers/leads/google-places.ts`:
  - Text Search implementation
  - Place Details implementation
  - Field masking
  - Data normalization to BusinessLead model
  - Rate limiting
  - Error handling
- [ ] Implement `lib/providers/leads/mock.ts` (demo mode with existing mock data)
- [ ] Create lead provider factory in `lib/providers/leads/index.ts`
- [ ] Add unit tests for lead providers

#### 2.4 Email Extractor Implementation
- [ ] Create `lib/providers/email/base.ts` (abstract extractor)
- [ ] Implement `lib/providers/email/website-scraper.ts`:
  - Fetch homepage
  - Scan common pages (contact, about)
  - Extract mailto: links
  - Parse email patterns
  - Confidence scoring
  - Return only public emails
  - Never fabricate emails
- [ ] Implement `lib/providers/email/mock.ts` (demo mode)
- [ ] Create email extractor factory in `lib/providers/email/index.ts`
- [ ] Add unit tests for email extraction

#### 2.5 Provider Configuration
- [ ] Create `lib/providers/config.ts` for provider selection
- [ ] Implement demo/production mode switching
- [ ] Add provider health checks
- [ ] Add fallback mechanisms

**Phase 2 Completion Criteria**: All provider abstractions implemented, tested, and configurable. Demo mode works offline. Production mode ready for API keys.

---

## Phase 3: Business Logic & Services
**Status**: ⏳ Not Started

### Tasks

#### 3.1 Domain Generation Service
- [ ] Create `lib/services/domain-generator.ts`
- [ ] Implement niche/service variant mapping
- [ ] Implement domain pattern generation:
  - `{city}{service}.com`
  - `{state}{service}.com`
  - `{service}{city}.com`
  - `{city}{service}pros.com`
  - `{city}{service}experts.com`
  - Additional variations
- [ ] Implement domain quality scoring algorithm
- [ ] Implement SEO score calculation
- [ ] Implement resale score estimation
- [ ] Add trademark risk heuristics
- [ ] Normalize and sanitize generated domains
- [ ] Add unit tests for domain generation

#### 3.2 Business Matching Service
- [ ] Create `lib/services/business-matcher.ts`
- [ ] Implement buyer score calculation:
  - Weak domain detection
  - Website quality assessment
  - Review/rating analysis
  - Geo-service fit scoring
- [ ] Implement domain-to-business matching logic
- [ ] Calculate fit scores
- [ ] Generate match reasons
- [ ] Rank matches
- [ ] Add unit tests for matching logic

#### 3.3 Search Orchestration Service
- [ ] Create `lib/services/search-orchestrator.ts`
- [ ] Implement end-to-end search flow:
  - Validate input
  - Generate domain candidates
  - Check domain availability (parallel)
  - Search for businesses
  - Enrich business data
  - Extract public emails (rate-limited)
  - Calculate scores
  - Match domains to businesses
  - Persist results to database
  - Return normalized response
- [ ] Add error recovery
- [ ] Add progress tracking
- [ ] Add caching layer
- [ ] Add unit tests for orchestration

#### 3.4 Data Persistence Services
- [ ] Create `lib/services/opportunity-service.ts`:
  - Save opportunities
  - Update opportunity status
  - List opportunities with filters
  - Delete opportunities
- [ ] Create `lib/services/note-service.ts`:
  - Create notes
  - List notes for business
  - Update notes
  - Delete notes
- [ ] Create `lib/services/lead-service.ts`:
  - Update lead status
  - Enrich lead data
  - Track lead history
- [ ] Add database transaction support
- [ ] Add unit tests for services

**Phase 3 Completion Criteria**: All business logic implemented, tested, and ready to be exposed via API routes.

---

## Phase 4: API Routes Implementation
**Status**: ⏳ Not Started

### Tasks

#### 4.1 Search API
- [ ] Create `app/api/search/route.ts` (POST):
  - Validate request with Zod schema
  - Call search orchestration service
  - Return normalized results matching current UI expectations
  - Add error handling
  - Add request/response logging
- [ ] Add API tests

#### 4.2 Domain APIs
- [ ] Create `app/api/domains/generate/route.ts` (POST):
  - Validate niche, location input
  - Generate domain candidates
  - Return scored domains
- [ ] Create `app/api/domains/availability/route.ts` (POST):
  - Validate domain list
  - Check availability via provider
  - Return availability results
- [ ] Add API tests

#### 4.3 Business Lead APIs
- [ ] Create `app/api/leads/search/route.ts` (POST):
  - Validate search parameters
  - Query lead provider
  - Return business prospects
- [ ] Create `app/api/leads/enrich/route.ts` (POST):
  - Validate lead ID or place ID
  - Fetch additional details
  - Extract public email if website available
  - Update database
  - Return enriched data
- [ ] Create `app/api/leads/[id]/route.ts` (GET, PATCH):
  - Get lead details
  - Update lead status/data
- [ ] Add API tests

#### 4.4 Opportunity APIs
- [ ] Create `app/api/opportunities/route.ts` (GET, POST):
  - List saved opportunities
  - Create new opportunity
  - Support filtering/sorting
- [ ] Create `app/api/opportunities/[id]/route.ts` (GET, PATCH, DELETE):
  - Get opportunity details
  - Update opportunity
  - Delete opportunity
- [ ] Add API tests

#### 4.5 Notes API
- [ ] Create `app/api/notes/route.ts` (GET, POST):
  - List notes for a business
  - Create new note
- [ ] Create `app/api/notes/[id]/route.ts` (PATCH, DELETE):
  - Update note
  - Delete note
- [ ] Add API tests

#### 4.6 API Middleware & Utilities
- [ ] Create error handler middleware
- [ ] Create request logger
- [ ] Add rate limiting where appropriate
- [ ] Add CORS configuration if needed
- [ ] Create API response helpers

**Phase 4 Completion Criteria**: All API routes implemented, tested, and returning data in format compatible with existing UI.

---

## Phase 5: Frontend Integration (Preserve UI)
**Status**: ⏳ Not Started

### Tasks

#### 5.1 Replace Mock Services
- [ ] Update `src/services/searchService.ts`:
  - Replace mock implementation with API calls
  - Keep function signatures identical
  - Preserve return types
  - Add error handling
  - Add loading states
- [ ] Verify existing UI still works with real data
- [ ] Test all existing search flows

#### 5.2 Update State Management
- [ ] Update `src/hooks/useAppState.tsx`:
  - Add API integration for persistence
  - Save search queries to database
  - Persist lead status changes
  - Persist notes to database
  - Keep existing hook interface identical
- [ ] Add optimistic updates where appropriate
- [ ] Add error recovery

#### 5.3 Dashboard Page Integration
- [ ] Update `src/pages/Dashboard.tsx`:
  - Connect search to real API
  - Display real domain availability
  - Display real business prospects
  - Add loading states (preserve design)
  - Add error states (preserve design)
  - Keep all existing UI components
  - No visual changes
- [ ] Test all interactions

#### 5.4 CRM Page Integration
- [ ] Update `src/pages/CRMPage.tsx`:
  - Load real opportunities from database
  - Persist drag-and-drop status changes
  - Keep all existing UI/animations
  - No visual changes
- [ ] Test drag-and-drop persistence

#### 5.5 Prospect Detail Integration
- [ ] Update `src/pages/ProspectDetail.tsx`:
  - Load real prospect data from database
  - Display enriched data (email if available)
  - Persist notes to database
  - Persist status changes
  - Keep all existing UI components
  - No visual changes
- [ ] Test all detail page interactions

#### 5.6 Landing Page (Minimal Changes)
- [ ] Verify `src/pages/LandingPage.tsx` works with new backend
- [ ] Update metadata if needed (keep branding)
- [ ] No other changes unless required

**Phase 5 Completion Criteria**: All pages connected to real backend, UI preserved exactly, full functionality working end-to-end.

---

## Phase 6: Production Hardening
**Status**: ⏳ Not Started

### Tasks

#### 6.1 Error Handling
- [ ] Add comprehensive error boundaries
- [ ] Add API error handling with user-friendly messages
- [ ] Add retry logic for transient failures
- [ ] Add fallback UI states
- [ ] Add error logging/monitoring hooks

#### 6.2 Loading States
- [ ] Audit all async operations
- [ ] Add loading indicators (preserve design)
- [ ] Add skeleton loaders where appropriate
- [ ] Add progress indicators for long operations
- [ ] Ensure no layout shift

#### 6.3 Empty States
- [ ] Add empty state for no search results
- [ ] Add empty state for no saved opportunities
- [ ] Add empty state for no notes
- [ ] Keep existing design language

#### 6.4 Validation & Security
- [ ] Server-side validation on all endpoints
- [ ] Input sanitization
- [ ] SQL injection prevention (Prisma handles this)
- [ ] XSS prevention
- [ ] Rate limiting on expensive operations
- [ ] API key security audit

#### 6.5 Performance Optimization
- [ ] Add database indexes
- [ ] Implement caching strategy:
  - Cache domain availability checks (short TTL)
  - Cache business search results (short TTL)
  - Cache place details (longer TTL)
- [ ] Optimize Prisma queries (select only needed fields)
- [ ] Add request deduplication
- [ ] Profile slow operations

#### 6.6 Testing
- [ ] Unit tests for all services
- [ ] Integration tests for API routes
- [ ] E2E tests for critical user flows
- [ ] Test demo mode vs production mode
- [ ] Test error scenarios
- [ ] Test edge cases

#### 6.7 Documentation
- [ ] Create API documentation
- [ ] Update README.md with:
  - Setup instructions
  - Environment variables
  - Database setup
  - Provider configuration
  - Demo mode vs production mode
- [ ] Create deployment guide
- [ ] Document provider setup instructions
- [ ] Create troubleshooting guide

**Phase 6 Completion Criteria**: Production-ready application with comprehensive error handling, testing, and documentation.

---

## Phase 7: Final Review & Deployment Prep
**Status**: ⏳ Not Started

### Tasks

#### 7.1 Code Quality
- [ ] Fix all TypeScript errors
- [ ] Fix all ESLint warnings
- [ ] Run Prettier on all files
- [ ] Remove console.logs
- [ ] Remove commented code
- [ ] Code review

#### 7.2 UI/UX Verification
- [ ] Compare current UI with original (should be identical)
- [ ] Document any unavoidable differences
- [ ] Test responsive behavior on all breakpoints
- [ ] Test all animations still work
- [ ] Test dark mode (if applicable)
- [ ] Cross-browser testing

#### 7.3 Data Migration
- [ ] Plan for migrating any existing saved data (if applicable)
- [ ] Create seed script for demo data
- [ ] Test fresh database initialization

#### 7.4 Deployment Checklist
- [ ] Set up production database (Neon)
- [ ] Configure environment variables in production
- [ ] Set up API key rotation strategy
- [ ] Configure monitoring/logging
- [ ] Set up error tracking (Sentry or similar)
- [ ] Configure CI/CD pipeline
- [ ] Create deployment runbook

#### 7.5 Legal & Compliance
- [ ] Verify only generic domains are generated
- [ ] Verify no trademark violations in generated domains
- [ ] Verify email extraction follows rules:
  - Only public emails
  - Never fabricated
  - Clear disclosure
- [ ] Add privacy policy if needed
- [ ] Add terms of service if needed
- [ ] Add disclaimer about domain availability

#### 7.6 Deliverables
- [ ] Architecture diagram
- [ ] Database schema documentation
- [ ] API documentation
- [ ] Provider setup guide
- [ ] Deployment guide
- [ ] List of changes made
- [ ] List of unavoidable UI differences (should be minimal/none)

**Phase 7 Completion Criteria**: Application fully tested, documented, and ready for production deployment.

---

### Progress Tracking

### Overall Status
- **Current Phase**: Phase 2 - Provider Abstraction Layer
- **Completion**: 1/7 phases (14%)

### Phase Completion
- [x] Phase 1: Foundation & Database Setup (100%) ✅
- [ ] Phase 2: Provider Abstraction Layer (0%)
- [ ] Phase 3: Business Logic & Services (0%)
- [ ] Phase 4: API Routes Implementation (0%)
- [ ] Phase 5: Frontend Integration (0%)
- [ ] Phase 6: Production Hardening (0%)
- [ ] Phase 7: Final Review & Deployment (0%)

---

## Credentials Summary

### Database
```
PostgreSQL (Neon):
postgresql://neondb_owner:npg_lhfED2TKGz5o@ep-autumn-bird-agkaokep-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

### APIs
```
Google Places API Key:
AIzaSyCgh7GJ0BK9AG0SiZAvCQSoHAysluevifs

Dynadot Account API Key:
X6IzF626z8M6zi6l8b7y7h7Yv6b8o8l8B7R7i8o7l8u
```

---

## Notes
- This roadmap follows a strict preservation-first approach
- No UI changes unless absolutely required for functionality
- All visual differences are considered bugs
- Demo mode must work offline for development
- Production mode requires valid API keys
- Each phase must be completed before moving to next
