# Application Testing Guide

## Quick Start

### 1. Start the Development Server

```bash
npm run dev
```

The application will start on **http://localhost:3000**

### 2. What to Test

#### Landing Page
- Visit http://localhost:3000
- Verify the landing page loads correctly
- Click "Get Started" or "Try Demo"

#### Dashboard - Search Functionality
1. Navigate to `/dashboard` or click "Get Started"
2. Try the demo search:
   - **Niche**: car detailing
   - **City**: Richmond
   - **State**: Virginia
3. Click "Search"
4. **Expected Results**:
   - Loading spinner appears
   - After 3-6 seconds, results appear
   - Domain cards show availability status
   - Business cards show buyer scores
   - Check browser console for:
     ```
     Search completed: { domains: X, businesses: Y, matches: Z, executionTime: XXXms }
     ```

#### Test Features

**1. Domain Save/Unsave**
- Click the bookmark icon on any domain card
- Verify it toggles between saved/unsaved
- Check that it persists (refresh page and check saved domains)

**2. Business Lead Interactions**
- Click on a business card to view details
- Try changing the status (new → saved → contacted)
- Add a note in the notes section
- Verify changes persist after refresh

**3. CRM Page**
- Navigate to `/crm`
- View saved opportunities
- Try drag-and-drop between columns
- Status changes should persist

#### Search Variations

Try different searches to test the backend:

```
Niche: roofing     | City: Tampa    | State: Florida
Niche: hvac        | City: Phoenix  | State: Arizona
Niche: plumbing    | City: Austin   | State: Texas
Niche: landscaping | City: Seattle  | State: Washington
```

## What You Should See

### Successful Search
✅ Domain cards with:
- Domain name (e.g., "richmondcardetailing.com")
- Status badge (Available/Taken/Unknown)
- Quality, SEO, Resale scores
- Reasons for the score

✅ Business cards with:
- Business name
- Buyer score (0-100)
- Address, phone, website
- Rating and review count

### Console Output
```
[API] POST /api/search {"niche":"car detailing","city":"Richmond","state":"Virginia"...}
[API] POST /api/search - 200 (4245ms)
Search completed: {
  domains: 20,
  businesses: 15,
  matches: 8,
  executionTime: 4245ms
}
```

### Database Persistence
After a search:
1. Open your database viewer (Prisma Studio): `npx prisma studio`
2. Check tables:
   - `SearchQuery` - Your search should be saved
   - `DomainOpportunity` - Generated domains
   - `BusinessLead` - Found businesses
   - `OpportunityMatch` - Domain-business matches

## Troubleshooting

### Error: "Module not found: @prisma/client"
```bash
npm install @prisma/client
npx prisma generate
```

### Error: "Database connection failed"
```bash
npx prisma db push
```

### Search Returns Empty Results
- Check console for errors
- Verify DEMO_MODE=true in .env.local
- Try one of the suggested search combinations above

### API Errors
- Check that dev server is running
- Look for errors in terminal where `npm run dev` is running
- Check browser Network tab for failed requests

## Performance Expectations

- **Landing Page**: <1 second
- **Dashboard Load**: <2 seconds
- **Search Execution**: 3-6 seconds (includes domain checking, business search, email extraction, matching)
- **State Updates**: Instant (optimistic) + 50-150ms (API persistence)

## Testing Checklist

- [ ] Landing page loads
- [ ] Dashboard loads
- [ ] Search executes successfully
- [ ] Domains display with correct data
- [ ] Businesses display with buyer scores
- [ ] Domain save/unsave works and persists
- [ ] Business status updates work
- [ ] Notes can be created
- [ ] Data persists after refresh
- [ ] CRM page shows opportunities
- [ ] Console shows no critical errors

## Next Steps

After testing:
1. Review browser console for any errors
2. Check database with `npx prisma studio`
3. Test with different search parameters
4. Verify all UI interactions work
5. Report any issues found

---

**Note**: The application is running in DEMO_MODE with mock providers. All functionality works, but data is generated locally without requiring external API keys.
