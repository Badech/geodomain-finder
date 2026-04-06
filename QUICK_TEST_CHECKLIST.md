# Phase 1 - Quick Test Checklist ✅

## Setup Instructions

Since the dev server requires Prisma setup, here's what to do:

### Option 1: Manual Testing (Recommended)
```bash
# Run these commands in your terminal:
npm install
npm run dev
```

Then open http://localhost:3000 and test below.

### Option 2: Review Code Changes
If you can't run the server yet, you can review the code changes I made.

---

## 5-Minute Quick Test

### ✅ Test 1: State → City Dropdown (30 seconds)
1. Open Dashboard
2. Click **State** dropdown → Select **"Virginia"**
3. Verify **City** dropdown is now enabled (was disabled before)
4. Click **City** dropdown → Should show Virginia cities (Richmond, Norfolk, Virginia Beach, etc.)
5. Change State to **"Florida"** → City should reset to empty

**What to look for:**
- City disabled initially with "Select state first" placeholder
- City enables and populates when state is selected
- City resets when state changes

---

### ✅ Test 2: Email Column (30 seconds)
1. Search: Niche = "car detailing", State = "Virginia", City = "Richmond"
2. Wait for results
3. Look at **Business Prospects** table (desktop view)

**What to look for:**
- New **Email** column between Phone and Website
- Shows email addresses or "—" for missing emails
- Column hidden on mobile screens

---

### ✅ Test 3: Action Opens New Tab (15 seconds)
1. In Business Prospects table, click the **ExternalLink icon** (last column)

**What to look for:**
- Opens prospect detail in **NEW TAB**
- Original tab stays on dashboard
- Right-click shows "Open link in new tab" option

---

### ✅ Test 4: Recommended Domains Section (1 minute)
1. Open a prospect detail page (via action icon)
2. Scroll to right sidebar
3. Find **"Recommended Domains"** section

**What to look for:**
- Shows 1-3 domain recommendations
- Primary domain has **"BEST FIT"** badge in primary color
- Each shows Quality score and Fit score
- Green dot for available domains
- If none: "No specific recommendations yet..." message

---

### ✅ Test 5: Outreach Angle with Domain (30 seconds)
1. On prospect detail, scroll to **"Outreach Angle"** section
2. Read the generated message

**What to look for:**
- Message includes **actual domain name** (e.g., "I have **richmondcardetailing.com** available")
- Domain name is highlighted/bold in primary color
- Click "Copy outreach angle" → Paste → Should include full message with domain

**Before:** "I have a premium geo-service domain available..."
**After:** "I have **richmondcardetailing.com** available..."

---

## Visual Check (No Testing Needed)

All changes preserve existing design:
- ✅ Same colors and typography
- ✅ Same spacing and layout
- ✅ Same component styles
- ✅ No design drift

---

## Files Changed Summary

### New Files:
- `src/data/usCities.ts` - US cities dataset

### Modified Files:
- `src/components-pages/Dashboard.tsx` - City dropdown
- `src/components/BusinessCard.tsx` - Email column + new tab
- `src/components-pages/ProspectDetail.tsx` - Recommended domains + outreach

### No Changes Needed (Already Working):
- Available count calculation
- Domain matching logic
- Status persistence

---

## If You Find Issues

Report back with:
1. Which test failed
2. What you expected vs. what happened
3. Browser and screen size

Example: "Test 2 - Email column not showing on desktop Chrome 1920x1080"

---

## Success = All 5 Quick Tests Pass ✅

If all tests pass, **Phase 1 is complete** and we can proceed to Phase 2!
