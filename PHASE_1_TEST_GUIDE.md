# Phase 1 Testing Guide

## Quick Test Setup

### 1. Install Dependencies & Start Dev Server
```bash
npm install
npm run dev
```

Expected: Server starts on http://localhost:3000

---

## Test Cases

### ✅ Test 1: State → City Dependent Selection

**Steps:**
1. Navigate to Dashboard (home page)
2. Observe the City field - should be disabled with placeholder "Select state first"
3. Click the State dropdown
4. Select "Virginia"
5. Observe City dropdown - should now be enabled with placeholder "Select city"
6. Click City dropdown
7. Verify it shows Virginia cities: Richmond, Virginia Beach, Norfolk, Chesapeake, etc.
8. Select "Richmond"
9. Change State to "Florida"
10. Observe City field - should reset to empty

**Expected Results:**
- ✅ City disabled when no state selected
- ✅ City populates with state-specific cities
- ✅ City resets when state changes
- ✅ Dropdown is searchable (can scroll through cities)

**Visual Check:**
- ✅ Styling matches existing state dropdown
- ✅ Same height (h-11)
- ✅ Same spacing and alignment

---

### ✅ Test 2: Email Column in Business Prospects Table

**Steps:**
1. In Dashboard, fill in:
   - Niche: "car detailing"
   - State: "Virginia"
   - City: "Richmond"
2. Click Search
3. Wait for results
4. On desktop (lg screen), look at Business Prospects table header

**Expected Results:**
- ✅ Table shows: Business | Phone | **Email** | Website | Rating | Buyer Score | Recommended | Status | Action
- ✅ Email column shows email addresses or "—" for businesses without email
- ✅ Email column is hidden on mobile/tablet (< lg breakpoint)
- ✅ Text truncates properly if email is long

**Visual Check:**
- ✅ Column header matches styling of other columns
- ✅ Email values align properly
- ✅ No layout shifts or overflow

---

### ✅ Test 3: Action Button Opens in New Tab

**Steps:**
1. With search results visible, find the Action column (last column)
2. Right-click the ExternalLink icon button
3. Verify context menu shows "Open link in new tab"
4. Click the ExternalLink icon (left-click)

**Expected Results:**
- ✅ New tab opens with prospect detail page
- ✅ Original tab stays on dashboard
- ✅ Detail page loads correctly in new tab
- ✅ Icon and button appearance unchanged

**Alternative Test:**
- Middle-click (scroll wheel click) the icon
- Should also open in new tab

---

### ✅ Test 4: Detail Page - Recommended Domains Section

**Steps:**
1. From dashboard results, click an action icon to open detail page in new tab
2. Scroll to right sidebar
3. Find "Recommended Domains" section

**Expected Results:**
- ✅ Section shows 1-3 recommended domains
- ✅ Primary recommendation has "BEST FIT" badge in primary color
- ✅ Each domain shows:
  - Domain name
  - Quality score (e.g., "Quality: 95/100")
  - Fit score if available (e.g., "• Fit: 85/100")
  - Status indicator (green dot for available)
- ✅ If no recommendations, shows: "No specific recommendations yet. Domain matching in progress..."

**Visual Check:**
- ✅ "BEST FIT" badge is styled with primary color
- ✅ Cards have rounded corners with secondary background
- ✅ Matches existing card design language

---

### ✅ Test 5: Outreach Angle Includes Selected Domain

**Steps:**
1. On prospect detail page, scroll to "Outreach Angle" section
2. Read the generated message
3. Click "Copy outreach angle" button
4. Paste into a text editor

**Expected Results:**
- ✅ Message includes the business name and review stats
- ✅ **Most important:** Message includes the actual recommended domain name highlighted in primary color
- ✅ Example: "I have **richmondcardetailing.com** available — an exact match for car detailing in Richmond"
- ✅ Copy button copies the complete message with domain name included
- ✅ If no recommendation exists, uses generic fallback

**Compare:**
- **Before:** Generic "a premium geo-service domain"
- **After:** Specific domain like "richmondcardetailing.com"

---

### ✅ Test 6: Available Count (Verification)

**Steps:**
1. Complete a search (e.g., car detailing in Richmond, VA)
2. Look at the summary cards at top of results
3. Find "Available" card (green icon, TrendingUp)
4. Count actual available domains in Domain Opportunities section manually

**Expected Results:**
- ✅ "Available" count matches number of green "Available" badges in domain list
- ✅ Count is not 0 (unless truly all domains are taken)
- ✅ Summary card updates immediately when search completes

**Note:** This was already working, we're just verifying it still works.

---

### ✅ Test 7: Status Persistence

**Steps:**
1. From dashboard results, note the status of a business (should be "new")
2. Click the action icon to open detail page
3. In detail page, click the Status dropdown (top right of business summary)
4. Change status from "new" to "contacted"
5. Refresh the page (F5 or Ctrl+R)
6. Check if status is still "contacted"
7. Go back to dashboard
8. Navigate to CRM page (top right, "CRM" button)
9. Verify business appears in "Contacted" column

**Expected Results:**
- ✅ Status changes immediately (optimistic update)
- ✅ Status persists after page refresh
- ✅ Status shows correctly in CRM kanban board
- ✅ Drag-and-drop in CRM also updates status

**Note:** This was already working, we're just verifying.

---

## Edge Cases to Test

### Edge Case 1: No Email Found
**Test:** Search for a business that likely has no email
- **Expected:** Table shows "—" in email column, not blank or error

### Edge Case 2: State with Few Cities
**Test:** Select "Wyoming" as state
- **Expected:** City dropdown shows cities like Cheyenne, Casper, Laramie, etc.
- **Expected:** Dropdown still works smoothly

### Edge Case 3: No Recommendations
**Test:** View a business detail where matching might fail
- **Expected:** "Recommended Domains" section shows fallback message
- **Expected:** Outreach angle uses generic fallback

### Edge Case 4: Direct URL Access
**Test:** Copy a prospect detail URL (e.g., `/prospect/b1`)
- Open in new incognito window
- **Expected:** Page loads (may show "not found" if no data, which is OK)
- **Expected:** No crashes or undefined errors

---

## Responsive Testing

### Mobile View (< 768px)
1. Open Chrome DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select iPhone or mobile device
4. Navigate through app

**Check:**
- ✅ Email column is hidden on mobile
- ✅ City dropdown still works
- ✅ Table switches to card view
- ✅ No horizontal scroll issues

### Tablet View (768px - 1024px)
**Check:**
- ✅ Email column appears on lg+ screens (1024px+)
- ✅ Layout remains clean

---

## Performance Check

### Search Speed (Baseline)
1. Start search with "car detailing", "Virginia", "Richmond"
2. Note time to complete
3. **Expected:** Results appear within 5-10 seconds (we'll optimize in Phase 2)

---

## Visual Regression Check

### Compare Before/After
**Colors:**
- ✅ Primary color usage unchanged
- ✅ Success/warning/error colors consistent
- ✅ Badge colors match existing patterns

**Spacing:**
- ✅ Table row heights consistent
- ✅ Card padding unchanged
- ✅ Section gaps maintained

**Typography:**
- ✅ Font sizes match existing patterns
- ✅ Font weights consistent
- ✅ No text overflow or truncation issues

---

## Known Issues from Phase 1

None - All features either fixed or verified working.

---

## Reporting Issues

If you encounter any issues during testing:

1. **Note the test case number**
2. **Describe what happened vs. what was expected**
3. **Include browser and screen size if relevant**
4. **Screenshot if visual issue**

Example:
```
Test 2 Failed: Email column not showing
- Browser: Chrome 120
- Screen: 1920x1080
- Issue: Email column header appears but no data in rows
- Expected: Should show email or "—"
```

---

## Success Criteria

Phase 1 is successfully implemented if:
- ✅ All 7 main tests pass
- ✅ No visual design drift
- ✅ No console errors
- ✅ Responsive views work correctly
- ✅ Edge cases handle gracefully

---

## Quick Smoke Test (2 minutes)

If short on time, run this minimal test:

1. **Select state → Select city** (Test 1)
2. **Search** → Check email column in table (Test 2)
3. **Click action icon** → Opens in new tab (Test 3)
4. **View recommended domains section** → Shows domains with "BEST FIT" (Test 4)
5. **Read outreach angle** → Includes actual domain name (Test 5)

✅ If these 5 quick checks pass, Phase 1 is good!
