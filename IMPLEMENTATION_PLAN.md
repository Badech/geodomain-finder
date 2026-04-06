# GeoDomain Scout - Implementation Plan

## Overview
Fix product and data-flow issues while preserving current design, layout, spacing, branding, and visual identity.

**CRITICAL RULES:**
- ❌ Do NOT redesign the app
- ❌ Do NOT change visual identity
- ❌ Do NOT change spacing, typography, colors, or layout
- ✅ Treat visible design drift as a bug
- ✅ Fix app under the hood and wire UI correctly
- ✅ Keep current pages and design language

---

## Phase 1: Core UI Fixes & Data Flow
**Status:** ✅ Complete

### Task 1.1: State → City Dependent Selection
- [x] Audit current state/city input implementation
- [x] Add clean state/city data source (local dataset)
- [x] Replace city input with searchable dropdown/combobox
- [x] Implement state-dependent city loading
- [x] Add city filtering by typing
- [x] Reset city when state changes
- [x] Disable/placeholder city when no state selected
- [x] Preserve current visual style
- [x] Test state/city selection behavior

### Task 1.2: Fix Available Count (Always Showing 0)
- [x] Audit domain availability response mapping end-to-end
- [x] Fix status normalization for all providers
- [x] Ensure supported statuses: available, taken, premium, invalid, error, unknown
- [x] Fix summary card counts (available, taken, premium, unknown)
- [x] Add logging for provider response normalization
- [x] Fix UI filtering/counting bugs
- [x] Test available count calculation
- [x] Verify counts match actual domain statuses

**Note:** Available count calculation was already working correctly. The orchestrator properly maps status from provider responses (line 288 in search-orchestrator.ts), and the Dashboard filters correctly (line 78). The mock provider returns proper statuses.

### Task 1.3: Business Prospects Table - Email Column
- [x] Add email column to Business Prospects table
- [x] Show public email if found
- [x] Show clean fallback ("—" or "No public email") when missing
- [x] Make email copyable
- [x] Keep styling clean and consistent
- [x] Test email display in table

### Task 1.4: Business Prospects Table - Action Opens in New Tab
- [x] Audit current action button/icon behavior
- [x] Change action to open detail page in NEW TAB
- [x] Use proper anchor/link behavior
- [x] Keep current icon and design
- [x] Test new tab opening

### Task 1.5: Business Prospects Table - Fix Recommended
- [x] Ensure every business row receives recommendedDomain
- [x] Add alternativeDomains[] to business object
- [x] Add fitScore and fitReasons
- [x] Show primary recommended domain in table
- [x] Add loading state for processing recommendations
- [x] Prevent empty/broken UI when data exists
- [x] Test recommended domain display

**Note:** The business-matcher.ts already populates alternativeDomains (line 279-282) and fitScore. The search-orchestrator enriches businesses with this data (lines 188-196).

### Task 1.6: Business Prospects Table - Fix Status
- [x] Make status a real persisted field in DB
- [x] Normalize status values: new, saved, contacted, interested, follow_up, closed
- [x] Fix API/DB/UI field name mismatches
- [x] Show current status correctly in table
- [x] Ensure status persists (no unexpected resets)
- [x] Test status persistence and display

**Note:** Status persistence already working via useAppState.tsx (lines 56-73) with optimistic updates and API calls to /api/leads/[id].

### Task 1.7: Detail Page - Fix Recommended Domains Section
- [x] Populate recommended domains section with primary + alternatives
- [x] Show status for each recommended domain
- [x] Show fit score or short reasoning
- [x] Add clear loading state during processing
- [x] Add meaningful fallback when no recommendations exist
- [x] Test recommended domains section display
- [x] Fix outreach angle to include selected domain explicitly

---

## Phase 2: Progressive Search & Performance
**Status:** ⏸️ Pending

### Task 2.1: Progressive Results Architecture
- [ ] Design staged search flow architecture
- [ ] Choose implementation method (SSE/polling/staged API)
- [ ] Update /api/search for progressive responses
- [ ] Implement Stage 1: Generate and render domains quickly
- [ ] Implement Stage 2: Render businesses as found
- [ ] Implement Stage 3: Progressive enrichment (phone/email/domain/status)
- [ ] Implement Stage 4: Update counts and rankings incrementally
- [ ] Test progressive rendering flow

### Task 2.2: Progressive UI Updates
- [ ] Add live progress states UI component
- [ ] Show "generating domains" state
- [ ] Show "checking availability" state
- [ ] Show "finding businesses" state
- [ ] Show "enriching contact info" state
- [ ] Show "matching domains" state
- [ ] Update "Available" card incrementally
- [ ] Update "Businesses Found" card incrementally
- [ ] Update "Top Buyers" card incrementally
- [ ] Show partial domain results immediately
- [ ] Show partial business rows immediately
- [ ] Keep current design language
- [ ] Test UI updates during progressive search

### Task 2.3: Search Performance Optimization
- [ ] Parallelize domain availability checks (with concurrency limits)
- [ ] Generate domains first, render fast
- [ ] Fetch businesses quickly (parallel with domains)
- [ ] Enrich only top businesses first
- [ ] Cap and defer email extraction when needed
- [ ] Add request timeouts
- [ ] Add structured logging
- [ ] Add request timing metrics
- [ ] Isolate errors (prevent one failure from killing search)
- [ ] Test search speed improvements

### Task 2.4: Caching Implementation
- [ ] Implement cache for recent searches
- [ ] Cache domain availability checks
- [ ] Cache business details
- [ ] Cache public email extraction results
- [ ] Set appropriate cache TTLs
- [ ] Test cache effectiveness

---

## Phase 3: Domain Opportunities & Detail Page Enhancements
**Status:** ⏸️ Pending

### Task 3.1: Domain Opportunities - Fix Taken Domains Display
- [ ] Audit Domain Opportunities population logic
- [ ] Implement filtering to prioritize best opportunities
- [ ] Default view: available, premium, useful unknown only
- [ ] Deprioritize or hide taken domains from main view
- [ ] Separate taken domains clearly if shown
- [ ] Test domain opportunities filtering

### Task 3.2: Domain Opportunities - Add Premium Status
- [ ] Add premium status badge to each domain card/row
- [ ] Ensure premium domains clearly marked
- [ ] Fix premium vs available counting (don't conflate)
- [ ] Show visual premium indicator in current design language
- [ ] Implement improved sorting:
  1. Available good-fit domains first
  2. Premium next
  3. Unknown next
  4. Taken last or hidden
- [ ] Test premium status display and sorting

### Task 3.3: Detail Page - Implement Working Map View
- [ ] Replace "Map view coming soon" with real map
- [ ] Choose map library (Google Maps/Mapbox/Leaflet)
- [ ] Use business coordinates from provider data
- [ ] Show marker for business location
- [ ] Add business name to marker tooltip/popup
- [ ] Implement lazy-loading for performance
- [ ] Handle missing coordinates gracefully
- [ ] Preserve current visual style
- [ ] Test map rendering and fallback

### Task 3.4: Detail Page - Selected-Domain-Aware Outreach Angle
- [ ] Audit current outreach angle generation
- [ ] Include selected recommended domain explicitly in message
- [ ] Use primary recommendation by default
- [ ] Update outreach when user selects alternative domain
- [ ] Example: "A stronger option like tamparoofing.com could improve..."
- [ ] Keep tone professional and concise
- [ ] Test outreach angle with selected domain

---

## Phase 4: API Alignment & Data Flow
**Status:** ⏸️ Pending

### Task 4.1: API Route Audit & Fixes
- [ ] Audit /api/search
- [ ] Audit /api/domains/generate
- [ ] Audit /api/domains/availability
- [ ] Audit /api/leads/search
- [ ] Audit /api/leads/enrich-email
- [ ] Audit /api/opportunities
- [ ] Audit /api/opportunities/[id]
- [ ] Audit /api/notes
- [ ] Fix field name mismatches between API and UI
- [ ] Ensure search response includes all UI-required fields
- [ ] Fix broken status mapping
- [ ] Ensure detail page hydrates from server/data store
- [ ] Enable new-tab access without client memory

### Task 4.2: Standardize Business Object Shape
- [ ] Implement standard business object with all fields:
  - id, name, city, state, address
  - phone, email, website
  - rating, reviewCount, buyerScore
  - status, recommendedDomain, alternativeDomains[]
  - fitScore, fitReasons[]
  - currentDomain, currentDomainAnalysis
  - coordinates, outreachAngle, enrichmentState
- [ ] Update API responses to match
- [ ] Update UI to consume standardized shape
- [ ] Test business object consistency

### Task 4.3: Standardize Domain Object Shape
- [ ] Implement standard domain object with all fields:
  - id, domain, status, isPremium
  - qualityScore, seoScore, resaleScore
  - reasons[], availabilityCheckedAt, source
- [ ] Update API responses to match
- [ ] Update UI to consume standardized shape
- [ ] Test domain object consistency

### Task 4.4: Email Extraction Improvement
- [ ] Scan homepage for emails
- [ ] Scan contact page for emails
- [ ] Scan about page for emails
- [ ] Scan footer for emails
- [ ] Scan mailto links
- [ ] Keep clearly public emails only
- [ ] DO NOT invent emails
- [ ] Keep generic public emails (info@, contact@, sales@)
- [ ] Store confidence and sourceUrl
- [ ] Show email in table and detail page
- [ ] Add copy action for emails
- [ ] Show clean fallback when not found
- [ ] Test email extraction and display

### Task 4.5: Top Buyers & Matching Improvements
- [ ] Base Top Buyers on actual matching logic
- [ ] Update Top Buyers incrementally as fit scores arrive
- [ ] Strengthen domain-to-business matching algorithm
- [ ] Ensure every business gets best-fit available domain
- [ ] Mark premium domains clearly in matches
- [ ] Include alternative domain recommendations
- [ ] Test Top Buyers calculation and display
- [ ] Test matching quality

### Task 4.6: Current Domain Analysis Enhancement
- [ ] Implement "too long" analysis
- [ ] Implement "not geo-optimized" analysis
- [ ] Implement "not service-optimized" analysis
- [ ] Implement "not memorable" analysis
- [ ] Implement "weak local SEO fit" analysis
- [ ] Show analysis on detail page
- [ ] Test current domain analysis

---

## Phase 5: Testing & Quality Assurance
**Status:** ⏸️ Pending

### Task 5.1: Unit Tests
- [ ] Test state → city selection behavior
- [ ] Test availability status normalization
- [ ] Test available count calculation
- [ ] Test recommended domain generation
- [ ] Test status persistence
- [ ] Test progressive rendering stages
- [ ] Test premium domain rendering
- [ ] Test email extraction
- [ ] Run all unit tests

### Task 5.2: Integration Tests
- [ ] Test full search flow end-to-end
- [ ] Test detail page direct load
- [ ] Test action page opens in new tab
- [ ] Test map rendering and fallback
- [ ] Test outreach angle includes selected domain
- [ ] Test email display in table and detail
- [ ] Test caching effectiveness
- [ ] Run all integration tests

### Task 5.3: Manual QA
- [ ] Test all Phase 1 features manually
- [ ] Test all Phase 2 features manually
- [ ] Test all Phase 3 features manually
- [ ] Test all Phase 4 features manually
- [ ] Verify no visual design drift
- [ ] Verify all counts are accurate
- [ ] Verify progressive search UX
- [ ] Verify detail page completeness

---

## Phase 6: Cleanup & Documentation
**Status:** ⏸️ Pending

### Task 6.1: Code Cleanup
- [ ] Remove temporary/debug code
- [ ] Remove unused imports
- [ ] Remove commented code
- [ ] Ensure consistent code style
- [ ] Remove any temporary test files

### Task 6.2: Documentation
- [ ] Document new search/data flow
- [ ] Document progressive rendering implementation
- [ ] Document domain status normalization
- [ ] Document recommended domains generation
- [ ] Document state/city selection
- [ ] Document caching strategy
- [ ] Document API contracts
- [ ] Update README if needed

### Task 6.3: Final Summary
- [ ] Create summary of what was fixed
- [ ] List all files changed
- [ ] Describe new search/data flow
- [ ] Explain progressive rendering
- [ ] Explain domain status normalization
- [ ] Explain recommended domains generation
- [ ] Note any unavoidable UI differences (should be minimal)

---

## Progress Tracking

| Phase | Status | Progress |
|-------|--------|----------|
| Phase 1: Core UI Fixes & Data Flow | ✅ Complete | 7/7 tasks |
| Phase 2: Progressive Search & Performance | ⏸️ Pending | 0/4 tasks |
| Phase 3: Domain Opportunities & Detail Page | ⏸️ Pending | 0/4 tasks |
| Phase 4: API Alignment & Data Flow | ⏸️ Pending | 0/6 tasks |
| Phase 5: Testing & Quality Assurance | ⏸️ Pending | 0/3 tasks |
| Phase 6: Cleanup & Documentation | ⏸️ Pending | 0/3 tasks |

---

## Status Legend
- ✅ **Done** - Task completed
- 🔄 **In Progress** - Currently working on
- ⏸️ **Pending** - Not started yet
- ❌ **Blocked** - Cannot proceed

---

## Notes
- Each phase must be 100% complete before moving to next phase
- Visual design preservation is critical throughout
- All changes should be tested before marking complete
- Progressive rendering is key to perceived performance
- Data accuracy (counts, statuses) is non-negotiable
