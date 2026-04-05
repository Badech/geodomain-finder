# GeoDomain Scout - Production Deployment Guide

**Version**: 1.0.0  
**Last Updated**: April 5, 2026  
**Status**: ✅ Production Ready

---

## Quick Start Deployment

### Fastest Path to Production (5 minutes)

1. **Push to GitHub**
```bash
git push origin main
```

2. **Deploy to Vercel**
- Visit https://vercel.com/new
- Click "Import Project"
- Select your `geodomain-finder` repository
- Click "Import"

3. **Add Environment Variables**
```env
DATABASE_URL=your_neon_postgresql_url
GOOGLE_PLACES_API_KEY=your_google_api_key
DYNADOT_API_KEY=your_dynadot_api_key
```

4. **Deploy**
- Click "Deploy"
- Wait 2-3 minutes
- Visit your live site! 🎉

---

## Detailed Deployment Steps

### Prerequisites Checklist

- [x] Code pushed to GitHub
- [ ] Vercel account created
- [ ] Neon database URL ready
- [ ] Google Places API key obtained
- [ ] Dynadot API key obtained (optional)

### Step 1: Prepare Database

**Option A: Use Existing Neon Database** ✅
```env
DATABASE_URL=postgresql://neondb_owner:...@ep-proud-poetry-a5pjnvmu.us-east-2.aws.neon.tech/neondb?sslmode=require
```
Your database is already configured and migrated!

**Option B: Create New Database**
1. Go to https://neon.tech
2. Create new project
3. Copy connection string
4. Run migrations:
```bash
DATABASE_URL="your_url" npx prisma migrate deploy
```

### Step 2: Get API Keys

#### Google Places API
1. Go to https://console.cloud.google.com/
2. Enable "Places API"
3. Create API key
4. Restrict to your domain (recommended)

**Cost**: Free tier includes 200 requests/day

#### Dynadot API (Optional)
1. Go to https://www.dynadot.com/account/domain/setting/api.html
2. Generate API key
3. Copy key

**Alternative**: Use `USE_MOCK_PROVIDERS=true` for demo mode

### Step 3: Deploy to Vercel

#### Via Vercel Dashboard

1. **Import Repository**
   - Go to https://vercel.com/new
   - Select your GitHub account
   - Find `geodomain-finder`
   - Click "Import"

2. **Configure Project**
   - Framework Preset: Next.js (auto-detected)
   - Root Directory: ./
   - Build Command: `npm run build`
   - Output Directory: .next (auto)

3. **Environment Variables**

Click "Environment Variables" and add:

```env
# Required
DATABASE_URL=postgresql://...
GOOGLE_PLACES_API_KEY=AIza...

# Optional - for domain checking
DYNADOT_API_KEY=your_key

# Optional - for demo mode
USE_MOCK_PROVIDERS=false

# Auto-configured by Vercel
NODE_ENV=production
```

4. **Deploy**
   - Click "Deploy"
   - Wait for build (2-3 minutes)
   - Get deployment URL

#### Via Vercel CLI

```bash
# Install CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Follow prompts
# Add environment variables when asked

# Deploy to production
vercel --prod
```

### Step 4: Verify Deployment

#### Health Checks

1. **Visit Homepage**
```
https://your-app.vercel.app
```
Should load dashboard

2. **Test API**
```bash
# Replace with your URL
curl https://your-app.vercel.app/api/search?niche=plumbing&state=TX&city=Austin
```

3. **Check Database**
- Run a search in the UI
- Verify results are saved
- Check Neon dashboard for data

#### Common Issues

**Build Fails**
- Check environment variables are set
- Verify DATABASE_URL is correct
- Check Vercel build logs

**Database Connection Fails**
- Verify DATABASE_URL includes `?sslmode=require`
- Check Neon database is active
- Test connection locally first

**API Errors**
- Check API keys are valid
- Verify environment variables are set
- Check Vercel function logs

### Step 5: Custom Domain (Optional)

1. **In Vercel Dashboard**
   - Go to project settings
   - Click "Domains"
   - Enter your domain

2. **Update DNS**
   - Add CNAME record:
   ```
   CNAME  www  cname.vercel-dns.com
   ```
   - Or A record for apex domain

3. **Wait for DNS Propagation**
   - Usually 5-30 minutes
   - Vercel will auto-provision SSL

---

## Alternative Deployment Options

### Deploy to Railway

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize
railway init

# Add environment variables in dashboard
railway open

# Deploy
railway up
```

**Environment Variables**:
- Same as Vercel (DATABASE_URL, etc.)

**Cost**: ~$5/month for basic usage

### Deploy to Render

1. Create new "Web Service"
2. Connect GitHub repository
3. Configure:
   - Build Command: `npm install && npx prisma generate && npm run build`
   - Start Command: `npm start`
4. Add environment variables
5. Deploy

**Cost**: Free tier available

### Deploy with Docker

**Create `Dockerfile`**:
```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build application
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

**Deploy**:
```bash
# Build image
docker build -t geodomain-scout .

# Run locally
docker run -p 3000:3000 --env-file .env geodomain-scout

# Or deploy to any Docker hosting service
```

---

## Environment Configuration

### Production Environment Variables

```env
# Database (Required)
DATABASE_URL=postgresql://user:password@host:5432/dbname?sslmode=require

# APIs (Required for full functionality)
GOOGLE_PLACES_API_KEY=your_api_key_here
DYNADOT_API_KEY=your_api_key_here

# Application Settings
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Optional: Demo Mode
USE_MOCK_PROVIDERS=false

# Optional: Custom Settings
ENABLE_API_LOGGING=true
```

### Development vs Production

| Variable | Development | Production |
|----------|-------------|------------|
| NODE_ENV | development | production |
| USE_MOCK_PROVIDERS | true | false |
| DATABASE_URL | Local/Neon | Neon |
| API Keys | Optional | Required |

---

## Post-Deployment Checklist

### Immediate After Deploy

- [ ] Homepage loads successfully
- [ ] Can perform a search
- [ ] Results are displayed
- [ ] Data is saved to database
- [ ] CRM page loads with leads
- [ ] Prospect detail pages work
- [ ] No console errors

### Performance Verification

- [ ] Search completes in < 20 seconds
- [ ] Page load < 3 seconds
- [ ] API responses < 500ms
- [ ] No memory leaks
- [ ] Mobile responsive

### Security Verification

- [ ] Environment variables not exposed
- [ ] API keys not in client code
- [ ] HTTPS enabled
- [ ] Rate limiting working
- [ ] Input validation active

### Monitoring Setup

- [ ] Error tracking configured (Sentry)
- [ ] Analytics configured (optional)
- [ ] Uptime monitoring (optional)
- [ ] Log aggregation (optional)

---

## Monitoring & Maintenance

### Vercel Built-in Monitoring

**Access Analytics**:
- Go to Vercel dashboard
- Select project
- View "Analytics" tab

**Check Logs**:
- Go to "Functions" tab
- Click on any function
- View real-time logs

**Monitor Performance**:
- View "Speed Insights"
- Check Core Web Vitals
- Review performance scores

### Recommended External Tools

**Error Tracking**:
- Sentry (https://sentry.io)
- Free tier: 5,000 errors/month

**Uptime Monitoring**:
- UptimeRobot (https://uptimerobot.com)
- Free tier: 50 monitors

**Analytics** (optional):
- Google Analytics
- Plausible Analytics

### Regular Maintenance Tasks

**Weekly**:
- [ ] Review error logs
- [ ] Check API quota usage
- [ ] Monitor database size
- [ ] Review slow queries

**Monthly**:
- [ ] Update dependencies
- [ ] Review security advisories
- [ ] Database backup verification
- [ ] Performance audit

**Quarterly**:
- [ ] Dependency security audit
- [ ] Database optimization
- [ ] Feature usage analysis
- [ ] Cost optimization review

---

## Scaling Considerations

### Current Capacity

**Out of the box supports**:
- ~100 concurrent users
- ~1,000 searches/day
- ~10,000 leads stored
- ~1 GB database

### When to Scale

**Upgrade caching** (> 100 users):
```typescript
// Switch from in-memory to Redis
// Update lib/cache/memory-cache.ts
```

**Upgrade database** (> 10,000 leads):
- Increase Neon tier
- Add read replicas
- Enable connection pooling

**Horizontal scaling** (> 1,000 concurrent users):
- Multiple Vercel instances (automatic)
- External Redis for caching
- CDN for static assets
- Database read replicas

---

## Troubleshooting

### Build Failures

**Error**: `Prisma Client not generated`
```bash
# Solution: Add postinstall script
# Already in package.json:
"postinstall": "prisma generate"
```

**Error**: `Cannot find module '@prisma/client'`
```bash
# Run locally:
npx prisma generate

# Verify in vercel build settings
```

### Database Connection Issues

**Error**: `Connection timeout`
- Check DATABASE_URL is correct
- Verify `?sslmode=require` is present
- Check Neon database is not paused

**Error**: `Too many connections`
- Enable connection pooling in Neon
- Use Prisma connection pooling
- Reduce max connections

### API Rate Limiting

**Error**: `429 Too Many Requests`
- User hit rate limit (10 searches / 5 min)
- Normal behavior for protection
- Increase limits if needed

### Performance Issues

**Slow searches**:
- Check API key quotas
- Monitor external API response times
- Review database query performance

**High memory usage**:
- Clear in-memory cache
- Switch to Redis
- Optimize database queries

---

## Cost Estimation

### Free Tier (Testing/Small Scale)

**Vercel**: Free
- 100 GB bandwidth
- Unlimited requests
- 1 million Serverless Function executions

**Neon**: Free
- 3 GB storage
- 1 GB data transfer
- Auto-suspend after inactivity

**Total**: $0/month for testing

### Production Tier (< 10,000 users/month)

**Vercel Pro**: $20/month
- 1 TB bandwidth
- 1 million Serverless Functions
- Analytics included

**Neon**: $19/month
- 10 GB storage
- 10 GB data transfer
- Always active

**APIs**:
- Google Places: ~$50/month (1,000 searches)
- Dynadot: Pay-per-check

**Total**: ~$90-100/month

### Enterprise Tier (> 100,000 users/month)

**Vercel**: $150-300/month
**Neon**: $69-200/month
**APIs**: $200-500/month
**Redis**: $30-100/month

**Total**: ~$450-1,100/month

---

## Success Metrics

### Key Performance Indicators

**Technical**:
- Uptime > 99.9%
- Search time < 20 seconds
- API response < 500ms
- Error rate < 0.1%

**Business**:
- Searches per day
- Leads generated
- Conversion to CRM
- User retention

**User Experience**:
- Page load time < 3s
- Mobile performance > 80
- Desktop performance > 90
- User satisfaction

---

## Support Resources

### Documentation
- **This Guide**: Complete deployment reference
- **README.md**: Setup and usage
- **ARCHITECTURE.md**: Technical details
- **API_TESTING_GUIDE.md**: API documentation

### External Resources
- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **Neon Docs**: https://neon.tech/docs

### Getting Help
1. Check this deployment guide
2. Review Vercel deployment logs
3. Check application error logs
4. Review troubleshooting section
5. Check external service status pages

---

## Next Steps After Deployment

### Week 1
- [ ] Monitor error rates
- [ ] Verify all features work
- [ ] Test with real users
- [ ] Gather initial feedback

### Month 1
- [ ] Review analytics
- [ ] Optimize based on usage
- [ ] Add monitoring tools
- [ ] Plan feature enhancements

### Quarter 1
- [ ] Scale if needed
- [ ] Add advanced features
- [ ] Optimize costs
- [ ] Expand integrations

---

**🚀 Ready to Deploy!**

Your GeoDomain Scout application is production-ready. Follow this guide to deploy in minutes and start generating business value immediately.

For questions or issues, refer to the troubleshooting section or review the comprehensive documentation in the repository.

**Good luck with your deployment!** 🎉
