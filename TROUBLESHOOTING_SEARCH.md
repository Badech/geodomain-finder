# Search Not Returning Results - Troubleshooting

## Issue
After deploying Phases 1-3, search returns no results when searching for domain names.

## Possible Causes

### 1. Environment Variables Missing
Check if these are set:
```bash
DEMO_MODE=true  # Or false with API keys
GOOGLE_MAPS_API_KEY=your_key_here
DYNADOT_ACCOUNT_API_KEY=your_key_here
```

### 2. Database Not Migrated
Run migration for Phase 3 coordinates:
```bash
npx prisma migrate dev --name add_coordinates
npx prisma generate
```

### 3. Browser Console Errors
Open browser DevTools (F12) and check:
- Console tab for JavaScript errors
- Network tab for failed API calls
- Look for 500 errors or failed requests

### 4. Check API Response
Test the search API directly:
```bash
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{
    "niche": "roofing",
    "city": "Tampa",
    "state": "Florida"
  }'
```

## Quick Fixes

### Fix 1: Clear Cache
```bash
# Clear Next.js cache
rm -rf .next
npm run build
npm run dev
```

### Fix 2: Check Provider Configuration
In `.env`:
```bash
# For testing without API keys
DEMO_MODE=true
```

### Fix 3: Verify Database
```bash
# Check if database is accessible
npx prisma studio
```

## Common Issues After Phase 1-3

### Issue: "Unknown" domain status
**Cause**: Domain provider not configured  
**Fix**: Set `DEMO_MODE=true` or add API keys

### Issue: No businesses returned
**Cause**: Google Places API key missing  
**Fix**: Add `GOOGLE_MAPS_API_KEY` or use DEMO_MODE

### Issue: Email enrichment slow
**Cause**: Sequential website scraping  
**Fix**: Normal behavior, Phase 4 will optimize

### Issue: Map not showing
**Cause**: Missing coordinates or Leaflet not loaded  
**Fix**: Run database migration, install Leaflet

## Debugging Steps

### Step 1: Check Server Logs
Look for errors in terminal where `npm run dev` is running

### Step 2: Test Individual Endpoints
```bash
# Test domain generation
curl http://localhost:3000/api/domains?niche=roofing&city=Tampa&state=Florida

# Test business search  
curl http://localhost:3000/api/leads?niche=roofing&city=Tampa&state=Florida
```

### Step 3: Check Frontend State
In browser console:
```javascript
// Check if results are returned but not displayed
console.log(window.__NEXT_DATA__)
```

## Phase-Specific Issues

### Phase 1 (Domain Availability)
- Cache might need clearing
- Mock provider should work without API key
- Check if `lib/cache/domain-cache.ts` is imported correctly

### Phase 2 (Email Enrichment)
- Website audit might timeout on slow sites
- Email classification should not block results
- Check network tab for hanging requests

### Phase 3 (Map)
- Missing Leaflet dependencies
- Coordinates not captured from Google Places
- Database migration not run

## Quick Test Script

Create `test-search.js`:
```javascript
const response = await fetch('http://localhost:3000/api/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    niche: 'roofing',
    city: 'Tampa',
    state: 'Florida'
  })
});

const data = await response.json();
console.log('Results:', data);
```

Run with: `node test-search.js`

## Expected vs Actual

### Expected Response
```json
{
  "domains": [...],  // Array of domain opportunities
  "businesses": [...],  // Array of business leads
  "matches": [...],  // Domain-business matches
  "metadata": {...}
}
```

### If Empty
```json
{
  "domains": [],
  "businesses": [],
  "matches": []
}
```
Check server logs for errors.

## Contact Points

If issue persists, check:
1. Server console output
2. Browser DevTools Network tab
3. API response in Network tab
4. Database connection status

---

**Most Common Fix**: Set `DEMO_MODE=true` in `.env` file
