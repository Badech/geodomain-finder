# API Testing Guide

## Quick Start

### Prerequisites
1. **Start the Next.js development server:**
   ```bash
   npm run dev
   ```

2. **Set demo mode:**
   ```bash
   # PowerShell
   $env:DEMO_MODE='true'
   
   # Bash
   export DEMO_MODE='true'
   ```

3. **Run the test script:**
   ```bash
   npx tsx tmp_rovodev_test-api.ts
   ```

## What Gets Tested

The test script will execute the following tests:

### 1. Search API (POST /api/search)
- Creates a complete search for "car detailing" in Richmond, VA
- Tests domain generation (5 domains)
- Tests business search (3 businesses)
- Tests domain-business matching
- Verifies database persistence
- **Expected**: 200 OK with domains, businesses, and matches

### 2. Domains API (GET /api/domains)
- Lists available domains
- Filters by quality score ≥ 70
- Sorts by quality score (descending)
- **Expected**: 200 OK with paginated domain list

### 3. Domain Detail API (GET /api/domains/[id])
- Retrieves details for a specific domain
- Shows related matches
- **Expected**: 200 OK with domain details

### 4. Leads API (GET /api/leads)
- Lists business leads
- Filters by buyer score ≥ 60
- Sorts by buyer score (descending)
- **Expected**: 200 OK with paginated lead list

### 5. Lead Update API (PATCH /api/leads/[id])
- Updates lead status to "contacted"
- Adds activity notes
- **Expected**: 200 OK with updated lead

### 6. Opportunities API (GET /api/opportunities)
- Lists domain-business matches
- Filters by fit score ≥ 70
- Sorts by fit score (descending)
- **Expected**: 200 OK with opportunity list

### 7. Notes API (GET /api/notes)
- Retrieves recent activity notes
- Can filter by business lead ID
- **Expected**: 200 OK with notes list

### 8. Validation Test (POST /api/search - invalid)
- Tests error handling with invalid data
- Missing required fields
- Empty string validation
- **Expected**: 400 Bad Request with validation errors

## Manual API Testing

You can also test APIs manually using curl or your favorite API client (Postman, Insomnia, etc.):

### Example: Execute Search
```bash
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{
    "niche": "roofing",
    "city": "Tampa",
    "state": "Florida",
    "maxDomains": 10,
    "maxBusinesses": 5
  }'
```

### Example: List Available Domains
```bash
curl "http://localhost:3000/api/domains?status=available&minQualityScore=80&limit=10"
```

### Example: Update Lead Status
```bash
curl -X PATCH http://localhost:3000/api/leads/LEAD_ID \
  -H "Content-Type: application/json" \
  -d '{
    "status": "interested",
    "notes": "Ready to purchase premium domain"
  }'
```

### Example: Create Note
```bash
curl -X POST http://localhost:3000/api/notes \
  -H "Content-Type: application/json" \
  -d '{
    "businessLeadId": "LEAD_ID",
    "content": "Follow-up call scheduled for tomorrow"
  }'
```

## Expected Responses

### Success Response Format
```json
{
  "success": true,
  "data": {
    // ... response data
  }
}
```

### Error Response Format
```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "path": "niche",
        "message": "Required"
      }
    ]
  }
}
```

## Testing Checklist

- [ ] Search API creates search and persists to database
- [ ] Domains API returns filtered and sorted results
- [ ] Domain detail API shows matches
- [ ] Leads API returns scored businesses
- [ ] Lead update API modifies status and notes
- [ ] Opportunities API shows high-fit matches
- [ ] Notes API tracks activity
- [ ] Validation properly rejects invalid data
- [ ] All responses follow standard format
- [ ] Errors are handled gracefully

## Troubleshooting

### Server Not Running
**Error**: Connection refused on localhost:3000
**Solution**: Start the dev server with `npm run dev`

### Database Errors
**Error**: PrismaClient initialization error
**Solution**: Run `npx prisma generate` and `npx prisma db push`

### Demo Mode Issues
**Error**: "API key is required for production mode"
**Solution**: Set `DEMO_MODE='true'` in environment variables

### Import Errors
**Error**: Module not found
**Solution**: The API routes use relative imports, ensure all files are in correct locations

## Performance Expectations

- **Search API**: 3-6 seconds (includes domain checking + business search + email enrichment)
- **List endpoints**: <100ms
- **Get endpoints**: <50ms
- **Update endpoints**: <100ms

## Next Steps After Testing

Once you've verified the APIs work correctly:

1. **Review the logs** - Check console output for any warnings or errors
2. **Check the database** - Verify data was persisted correctly
3. **Test error cases** - Try invalid inputs to see error handling
4. **Performance test** - Run searches with different parameters
5. **Ready for Phase 5** - Connect the frontend UI to these APIs!

---

**Note**: The test script uses mock providers (DEMO_MODE), so no real API keys are required. All data is generated locally.
