# Role-Based Access Control - Setup Guide

## Overview

Your Ledger app now has **role-based access control** with two user roles:

### 👑 Owner (Full Access)
- View full dashboard with income, expenses, budgets, credit cards, and loans
- Add/edit/delete transactions
- Manage budgets
- View credit card usage
- Manage loans
- Change settings

### 👤 Family Member (Limited Access)
- **Only see Loans dashboard**
- View loan details (EMI, outstanding balance, payments)
- Cannot access income, expenses, budget, or credit cards
- Limited navigation (only Home and More tabs visible)

---

## Setup Instructions

### Step 1: Configure Owner Email

Open `index.html` and find line **718** (search for `OWNER_EMAIL`):

```javascript
const OWNER_EMAIL = "your-email@gmail.com"; // Replace with your actual email
```

**Replace** `your-email@gmail.com` with your actual Google account email address.

**Example:**
```javascript
const OWNER_EMAIL = "john.doe@gmail.com";
```

### Step 2: Configure Google OAuth Client ID

On line **713**, add your Google OAuth Client ID:

```javascript
const GOOG_CLIENT_ID = "YOUR_OAUTH_CLIENT_ID.apps.googleusercontent.com";
```

**How to get this:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google Sheets API
4. Create OAuth 2.0 credentials (Web application)
5. Add authorized JavaScript origins: `http://localhost:PORT` (for testing) and your production URL
6. Copy the Client ID

### Step 3: Configure Spreadsheet ID

On line **715**, add your Google Spreadsheet ID:

```javascript
const SPREADSHEET_ID = "YOUR_SPREADSHEET_ID";
```

**How to get this:**
1. Create a new Google Sheet
2. Copy the ID from the URL: `https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit`

### Step 4: Update OAuth Scopes (Already Done)

The scopes have been updated to include user email access:

```javascript
const SCOPES = "https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.email";
```

---

## How It Works

### Authentication & Role Detection

1. User signs in with Google
2. App fetches user's email address
3. Email is compared with `OWNER_EMAIL`
4. If match → **Owner role** (full access)
5. If no match → **Family member role** (loans only)

### Dashboard Behavior

**Owner View:**
- Full financial dashboard
- All metrics visible
- All navigation tabs available

**Family Member View:**
- Simplified loans-only dashboard
- Shows total EMI and outstanding balance
- List of all loans with details
- Limited navigation (only Home + More tabs)

### Navigation Restrictions

Family members will only see:
- **Home tab** - Loans dashboard
- **More tab** - Settings and sign out (with role indicator)

Hidden from family members:
- Add Entry (+ tab)
- Transactions Log
- Credit Cards
- Budget (accessible from More > Budget for owners only)

---

## Testing

### Test as Owner
1. Sign in with the email you configured in `OWNER_EMAIL`
2. You should see all 5 navigation tabs
3. Dashboard shows full financial overview

### Test as Family Member
1. Sign out
2. Sign in with a **different** Google account
3. You should only see 2 navigation tabs (Home + More)
4. Dashboard shows only loan information

---

## User Interface Changes

### More Screen
Shows user role badge:
- **Owner**: 👑 Owner - Full Access (green)
- **Family Member**: 👤 Family Member - Loans Only (red)

### Dashboard
Family members see an orange notice banner:
> 👤 Family Member Access - You can only view and manage loans

### Settings Access
Bank account settings are hidden from family members.

---

## Security Notes

1. **Role is determined by email** - Make sure `OWNER_EMAIL` is correct
2. **Case insensitive** - Email comparison ignores case
3. **Session-based** - Role is checked on each page load
4. **No backend validation** - This is client-side only. For production, add server-side role validation.

---

## Troubleshooting

### Everyone sees owner view
- Check that `OWNER_EMAIL` is set correctly
- Verify email matches exactly (check for typos)
- Clear browser cache and sign in again

### Everyone sees family view
- Ensure the logged-in email matches `OWNER_EMAIL`
- Check browser console for errors

### Navigation tabs not hiding
- Clear browser cache
- Check for JavaScript errors in console

---

## File Changes Summary

Modified files:
- `index.html` - Added role-based access control

Key functions added:
- `isOwner()` - Checks if current user is owner
- `getUserRole()` - Returns 'owner' or 'family'
- Updated `Dashboard` - Different views per role
- Updated `BottomNav` - Filter tabs by role
- Updated `More` - Show role indicator

---

## Next Steps

1. ✅ Set your `OWNER_EMAIL`
2. ✅ Configure Google OAuth Client ID
3. ✅ Configure Spreadsheet ID
4. 🧪 Test with both owner and family member accounts
5. 📱 Deploy to your hosting provider
6. 📧 Share the URL with family members

---

**Created:** September 6, 2026
**Status:** Role-based access fully implemented ✅
