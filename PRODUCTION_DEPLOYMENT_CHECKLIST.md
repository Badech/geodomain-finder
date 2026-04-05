# Production Deployment Checklist
**GeoDomain Scout - Production Readiness**

---

## ✅ Pre-Deployment Checklist

### **1. Environment Variables**
- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `GOOGLE_MAPS_API_KEY` - Google Maps/Places API key
- [ ] `DYNADOT_ACCOUNT_API_KEY` - Domain availability API key
- [ ] `NEXT_PUBLIC_APP_URL` - Production URL
- [ ] `NODE_ENV=production`
- [ ] `LOG_LEVEL=info` (or `warn` for less verbose)
- [ ] `DEMO_MODE=false` (unless testing)

### **2. Database Migration**
```bash
# Run Prisma migration for ActivityNote enhancements
npx prisma migrate deploy

# Or for development
npx prisma migrate dev
```

**New Fields Added**:
- ActivityNote: `type`, `actionType`, `followUpDate`, `completed`, `priority`
- 3 new indexes for performance

### **3. API Keys & Limits**

#### Google Maps API
- [ ] API key has proper restrictions (HTTP referrers or IP)
- [ ] Places API enabled
- [ ] Maps JavaScript API enabled (for frontend)
- [ ] Billing account active
- [ ] Daily quota sufficient (recommend 10,000+ requests/day)

#### Dynadot API
- [ ] Account API key valid
- [ ] Rate limits understood (recommend caching)
- [ ] Timeout set to 15 seconds

### **4. Build Verification**
```bash
# Test build locally
npm run build

# Should complete without TypeScript errors
# Prisma client should generate successfully
```

### **5. Security**
- [x] All API keys server-side only (no client exposure)
- [x] Zod validation on all API endpoints
- [x] Rate limiting implemented (search endpoint)
- [x] Error messages don't expose sensitive data
- [x] SQL injection prevented (Prisma ORM)
- [x] XSS prevention in place

---

## 🚀 Deployment Steps

### **Vercel Deployment** (Recommended)

1. **Connect Repository**
   ```
   - Link GitHub repository to Vercel
   - Select main branch for auto-deploy
   ```

2. **Configure Environment Variables**
   ```
   Settings → Environment Variables
   Add all required env vars (see section 1)
   ```

3. **Database Setup**
   ```
   - Use Vercel Postgres or external PostgreSQL
   - Run migrations after database creation
   ```

4. **Deploy**
   ```
   - Push to main branch triggers auto-deploy
   - Or manual deploy from Vercel dashboard
   ```

5. **Verify Deployment**
   ```
   - Check build logs for errors
   - Test search functionality
   - Verify API responses
   - Check domain availability
   ```

### **Alternative: Manual Deployment**

```bash
# Build
npm run build

# Start production server
npm start

# Or with PM2 for process management
pm2 start npm --name "geodomain-scout" -- start
```

---

## 📊 Post-Deployment Verification

### **Health Checks**

1. **API Endpoints**
   - [ ] `GET /api/domains` - Returns 200
   - [ ] `GET /api/leads` - Returns 200
   - [ ] `POST /api/search` - Completes successfully
   - [ ] `GET /api/notes` - Returns 200

2. **Search Functionality**
   - [ ] Search completes in < 10 seconds (cached)
   - [ ] Domain availability checked
   - [ ] Business results returned
   - [ ] Top buyers calculated
   - [ ] Export functions work

3. **Database**
   - [ ] Connections successful
   - [ ] Migrations applied
   - [ ] Data persists correctly
   - [ ] Queries performant

4. **Caching**
   - [ ] Domain cache working (24h TTL)
   - [ ] Search cache working (1h TTL)
   - [ ] Cache hit rate > 20% after warmup

---

## 🔍 Monitoring Setup

### **Key Metrics to Track**

1. **Performance**
   - Search execution time (target: < 10s)
   - Cache hit rate (target: > 30%)
   - Database query time (target: < 500ms)
   - API response time (target: < 2s)

2. **Usage**
   - Searches per day
   - API calls per endpoint
   - Export operations
   - Note creations

3. **Errors**
   - API error rate (target: < 1%)
   - Provider failures
   - Database errors
   - Rate limit hits

4. **Business Metrics**
   - Average prospects per search
   - Top buyer conversion rate
   - Contact readiness distribution
   - Domain availability rate

### **Logging**

Production logs include:
```json
{
  "timestamp": "2026-04-05T20:23:00Z",
  "level": "info",
  "message": "Search Completed",
  "context": {
    "params": {...},
    "totalResults": 25,
    "executionTime": 8500
  }
}
```

**Log Levels**:
- `error`: System errors, provider failures
- `warn`: Slow operations, rate limits
- `info`: API requests, search completion
- `debug`: Cache operations, detailed timing

### **Recommended Monitoring Tools**

- **Vercel Analytics** (built-in)
- **Sentry** for error tracking
- **LogRocket** for session replay
- **DataDog** or **New Relic** for APM

---

## 🐛 Troubleshooting

### **Common Issues**

1. **Search Times Out**
   - Check API key limits
   - Verify network connectivity
   - Check database connection
   - Review provider timeouts (15s domain, 10s email)

2. **Domain Availability Returns "Unknown"**
   - Verify Dynadot API key
   - Check rate limits
   - Review cache (may need clearing)
   - Check timeout settings

3. **No Business Results**
   - Verify Google Places API key
   - Check quota usage
   - Verify location search terms
   - Check API restrictions

4. **Database Errors**
   - Verify DATABASE_URL
   - Check migration status
   - Review connection pool
   - Check Prisma client generation

5. **Slow Performance**
   - Check cache hit rate (should be > 30%)
   - Review database indexes
   - Check API provider response times
   - Consider increasing cache TTL

---

## 🔒 Security Best Practices

### **Current Security Measures**
- ✅ Environment variables server-side only
- ✅ API key validation at startup
- ✅ Zod schema validation on all inputs
- ✅ Rate limiting on search endpoint
- ✅ SQL injection prevention (Prisma ORM)
- ✅ Timeout protection (15s max)
- ✅ Error messages sanitized
- ✅ HTTPS enforced (via Vercel)

### **Additional Recommendations**
- [ ] Set up CORS properly for production domain
- [ ] Enable CSP headers
- [ ] Add API authentication (if multi-user)
- [ ] Implement request signing for webhooks
- [ ] Regular dependency updates (`npm audit`)

---

## 📈 Performance Optimization

### **Already Implemented**
- ✅ Multi-layer caching (domain, search, memory)
- ✅ Parallel processing (domains + businesses)
- ✅ Background persistence (non-blocking)
- ✅ Smart enrichment (top 10 only)
- ✅ Request limits (max 30 domains, 30 businesses)
- ✅ Database indexes on key fields

### **Future Optimizations** (Optional)
- [ ] CDN for static assets
- [ ] Database read replicas
- [ ] Redis for distributed caching
- [ ] GraphQL for flexible queries
- [ ] Server-side pagination

---

## 🎯 Success Criteria

### **Production is Ready When:**
- ✅ All environment variables configured
- ✅ Database migration completed
- ✅ Build succeeds without errors
- ✅ Search completes in < 10 seconds
- ✅ All API endpoints respond correctly
- ✅ Data persists to database
- ✅ Caching works properly
- ✅ Error handling graceful
- ✅ Logging structured and useful
- ✅ No sensitive data exposed

---

## 📞 Support & Maintenance

### **Regular Maintenance**
- Weekly: Check error logs
- Monthly: Review API usage and costs
- Quarterly: Update dependencies
- As needed: Adjust rate limits

### **Backup Strategy**
- Database: Daily automated backups (Vercel Postgres)
- Code: GitHub repository (version controlled)
- Environment vars: Documented securely

---

## ✅ Final Checklist

Before going live:
- [ ] All environment variables set
- [ ] Database migrated
- [ ] API keys valid and unrestricted
- [ ] Build successful
- [ ] Basic search test passed
- [ ] Monitoring configured
- [ ] Error tracking enabled
- [ ] Documentation reviewed
- [ ] Team trained on features

**Status**: Ready for Production! 🚀
