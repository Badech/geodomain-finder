# Quick Database Fix - Add Columns Manually

## Problem
Prisma migration is taking too long (keeps downloading Prisma 7.6.0)

## Fast Solution (30 seconds)

### Go to Neon Console
1. Open https://console.neon.tech
2. Sign in to your account
3. Select your project
4. Click **SQL Editor** (in left sidebar)

### Run This SQL
```sql
ALTER TABLE "BusinessLead" ADD COLUMN IF NOT EXISTS "latitude" DOUBLE PRECISION;
ALTER TABLE "BusinessLead" ADD COLUMN IF NOT EXISTS "longitude" DOUBLE PRECISION;
```

### Click "Run"
You should see: `ALTER TABLE` (success message)

### Restart Dev Server
```bash
Ctrl+C
npm run dev
```

### Test Search
Search should now work without the Prisma error!

---

## Why This Works

- Prisma migration is just adding these two columns
- We can add them manually via SQL
- Same result, much faster
- No need to wait for Prisma download

---

## Verify It Worked

After adding columns and restarting server:
- Search for Richmond car detailing
- Should see results
- No more "column does not exist" error

---

**Time**: 30 seconds vs 5+ minutes waiting for Prisma
