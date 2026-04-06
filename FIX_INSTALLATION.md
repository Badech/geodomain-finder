# Fix Installation Issue

## Problem
Next.js dependencies aren't installing correctly, causing "next is not recognized" error.

## Solution - Run These Commands in Your Terminal

**Option 1: Clean Install (Recommended)**
```bash
# Delete node_modules and lockfiles
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
Remove-Item -Force bun.lock

# Clear npm cache
npm cache clean --force

# Reinstall everything
npm install

# Generate Prisma client
npx prisma generate

# Start dev server
npm run dev
```

**Option 2: Use Bun (Faster Alternative)**
Since you have `bun.lock` in the project:
```bash
# Install bun if not already installed
# Visit: https://bun.sh/

# Install dependencies with bun
bun install

# Start dev server
bun run dev
```

**Option 3: Manual Fix**
```bash
# Install Next.js directly
npm install --save next@14.2.35

# Install React
npm install --save react@18.3.1 react-dom@18.3.1

# Install all other dependencies
npm install

# Try running
npm run dev
```

## If Still Failing

Try running from a terminal **outside** of OneDrive folder:
1. Copy the project to `C:\Projects\geodomain-finder`
2. Run `npm install` from there
3. OneDrive sync can sometimes interfere with node_modules

## Alternative: Test Without Running Server

You can also **review the code changes** without running the server:

1. Open `src/data/usCities.ts` - See the cities dataset
2. Open `src/components-pages/Dashboard.tsx` - See city dropdown implementation (lines 12, 28, 40-54, 120-130)
3. Open `src/components/BusinessCard.tsx` - See email column (lines 96, 113, 138-142)
4. Open `src/components-pages/ProspectDetail.tsx` - See recommended domains (lines 31-68, 207-233, 180-195)

All the Phase 1 changes are complete in the code - just need to get the server running to test them!

## Once It's Working

Follow **QUICK_TEST_CHECKLIST.md** to verify all 5 features work correctly.
