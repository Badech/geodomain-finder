# GeoDomain Scout 🌎

> **Production-ready full-stack application** for discovering geo-service domain opportunities and matching them with local business prospects.

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5-2D3748)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

## 🚀 Features

### Core Functionality
- ✅ **Domain Generation** - AI-powered geo + service domain name generation
- ✅ **Availability Checking** - Real-time domain availability via Dynadot API
- ✅ **Business Discovery** - Find local businesses using Google Places API
- ✅ **Smart Matching** - Intelligent business-to-domain matching algorithm
- ✅ **Email Extraction** - Public email discovery from business websites
- ✅ **CRM Pipeline** - Drag-and-drop Kanban board for lead management
- ✅ **Notes & Tracking** - Activity notes and lead status tracking

### Production Features
- ✅ **Error Boundaries** - Comprehensive error handling
- ✅ **Rate Limiting** - Protect APIs from abuse
- ✅ **Input Validation** - Server-side validation and sanitization
- ✅ **Caching** - In-memory caching for performance
- ✅ **Loading States** - Skeleton loaders and progress indicators
- ✅ **Empty States** - User-friendly empty state components
- ✅ **Optimized Queries** - Efficient database operations

## 📋 Prerequisites

- **Node.js** 18+ 
- **PostgreSQL** database (we recommend [Neon](https://neon.tech))
- **API Keys**:
  - Google Places API key
  - Dynadot API key

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd geodomain-finder
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create `.env.local` and `.env` files:

```bash
# .env.local (for Next.js)
DATABASE_URL="your-postgresql-connection-string"
GOOGLE_MAPS_API_KEY="your-google-places-api-key"
DYNADOT_ACCOUNT_API_KEY="your-dynadot-api-key"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
DEMO_MODE="false"

# .env (for Prisma)
DATABASE_URL="your-postgresql-connection-string"
```

### 4. Set up the database

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) Open Prisma Studio to view data
npx prisma studio
```

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔑 API Keys Setup

### Google Places API

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable **Places API (New)**
4. Create credentials (API Key)
5. Restrict key to:
   - Places API (New)
   - Text Search
   - Place Details

**Cost**: ~$32 per 1,000 searches

### Dynadot API

1. Log in to [Dynadot](https://www.dynadot.com)
2. Go to Account Settings → API Access
3. Generate API key
4. Ensure billing is set up

**Cost**: Check Dynadot pricing for domain searches

## 🏗️ Project Structure

```
geodomain-finder/
├── app/                      # Next.js App Router
│   ├── api/                  # API routes
│   │   ├── search/          # Search orchestration
│   │   ├── domains/         # Domain management
│   │   ├── leads/           # Business leads
│   │   ├── opportunities/   # Matched opportunities
│   │   └── notes/           # Activity notes
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page
│   └── providers.tsx        # App providers
├── lib/                      # Server-side code
│   ├── api/                 # API utilities
│   │   ├── utils.ts         # Response helpers
│   │   ├── validation.ts    # Input validation
│   │   └── rate-limit.ts    # Rate limiting
│   ├── cache/               # Caching layer
│   ├── providers/           # External API providers
│   │   ├── domain/          # Dynadot integration
│   │   ├── leads/           # Google Places integration
│   │   └── email/           # Email extraction
│   ├── services/            # Business logic
│   │   ├── domain-generator.ts
│   │   ├── business-matcher.ts
│   │   └── search-orchestrator.ts
│   ├── schemas/             # Zod validation schemas
│   └── db.ts                # Prisma client
├── src/                      # Client-side code
│   ├── components/          # React components
│   │   ├── ui/              # shadcn/ui components
│   │   ├── ErrorBoundary.tsx
│   │   ├── LoadingState.tsx
│   │   └── EmptyState.tsx
│   ├── pages/               # Page components
│   ├── hooks/               # Custom hooks
│   └── services/            # API services
├── prisma/                   # Database schema
│   └── schema.prisma
└── __tests__/               # Test files

```

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm run test __tests__/api/search.test.ts
```

## 📊 Database Schema

The application uses PostgreSQL with Prisma ORM:

- **SearchQuery** - Search history
- **DomainOpportunity** - Generated domains with scores
- **BusinessLead** - Discovered businesses
- **OpportunityMatch** - Domain-business matches
- **ActivityNote** - Notes and follow-ups
- **SavedFilter** - Saved search filters

## 🎯 Usage Guide

### Running a Search

1. Navigate to **Dashboard** (`/dashboard`)
2. Enter:
   - **Niche** (e.g., "plumber", "dentist")
   - **City** (e.g., "Miami")
   - **State** (e.g., "Florida")
3. Click **Search**
4. View results:
   - Generated domains with availability status
   - Matching businesses with contact info
   - Fit scores and match reasons

### Managing Leads (CRM)

1. Go to **CRM** (`/crm`)
2. Drag and drop leads between stages:
   - New
   - Contacted
   - Interested
   - Follow-up
   - Closed
3. Click on a lead to view details
4. Add notes to track conversations

### Demo Mode

For testing without API costs, enable demo mode:

```bash
DEMO_MODE="true"
```

This uses mock providers instead of real APIs.

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

```bash
# Or use Vercel CLI
npm install -g vercel
vercel
```

### Environment Variables for Production

Set these in your deployment platform:

```
DATABASE_URL=your-production-database-url
GOOGLE_MAPS_API_KEY=your-api-key
DYNADOT_ACCOUNT_API_KEY=your-api-key
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NODE_ENV=production
DEMO_MODE=false
```

## ⚡ Performance

- **Search**: ~10-15 seconds (depends on API response times)
- **Database queries**: < 100ms (with indexes)
- **Caching**: 24h for domains, 1h for businesses
- **Rate limits**: 
  - Search: 10 requests per 5 minutes
  - General API: 100 requests per minute

## 🔒 Security

- ✅ Server-side input validation
- ✅ SQL injection prevention (Prisma)
- ✅ XSS prevention (input sanitization)
- ✅ Rate limiting
- ✅ API key protection
- ✅ Error messages don't expose sensitive data

## 🛟 Troubleshooting

### "Module not found: Can't resolve '@prisma/client'"

```bash
npx prisma generate
```

### "Database connection failed"

Check your `DATABASE_URL` in `.env` files.

### "Rate limit exceeded"

Wait for the rate limit window to reset, or clear rate limits:

```typescript
// In development only
import { searchRateLimiter } from './lib/api/rate-limit';
searchRateLimiter.reset();
```

### OneDrive file locking issues

Move project outside OneDrive or add `.next` to exclusions.

## 📚 Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.8
- **Database**: PostgreSQL + Prisma ORM
- **Styling**: Tailwind CSS
- **UI**: shadcn/ui (Radix UI)
- **State**: React Context + TanStack Query
- **Validation**: Zod
- **APIs**: Google Places, Dynadot

## 📝 License

MIT

## 🤝 Contributing

Contributions welcome! Please open an issue or PR.

## 📞 Support

For issues or questions, please open a GitHub issue.
