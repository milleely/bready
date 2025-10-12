# Clerk Authentication Setup Guide

## Overview

Bready now uses Clerk for authentication. This guide will walk you through setting up your Clerk account and configuring the app.

---

## Step 1: Create a Clerk Account

1. Go to [https://dashboard.clerk.com/sign-up](https://dashboard.clerk.com/sign-up)
2. Sign up for a free account (10,000 monthly active users included)
3. Create a new application:
   - **Application Name:** Bready
   - **Authentication Strategy:** Email + Password (or add Google/GitHub OAuth)
   - Click "Create Application"

---

## Step 2: Get Your API Keys

After creating your application, you'll see your API keys:

1. **Publishable Key** - Starts with `pk_test_...` or `pk_live_...`
2. **Secret Key** - Starts with `sk_test_...` or `sk_live_...`

**Copy both keys** - you'll need them in the next step.

---

## Step 3: Configure Environment Variables

### Option A: Update `.env` file (Current Setup)

Open `/Users/Owner/Desktop/cursor-tutorial/.env` and replace the placeholder values:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_actual_key_here
CLERK_SECRET_KEY=sk_test_your_actual_secret_key_here
```

### Option B: Create `.env.local` (Recommended for Production)

Create a new file `.env.local` in the project root:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_actual_key_here
CLERK_SECRET_KEY=sk_test_your_actual_secret_key_here
```

**Note:** `.env.local` takes precedence over `.env` and is git-ignored by default.

---

## Step 4: Restart the Development Server

After updating your environment variables:

1. Stop the current dev server (Ctrl+C)
2. Restart it: `npm run dev`
3. The server should now connect to Clerk

---

## Step 5: Test Authentication

1. Open your browser to `http://localhost:3000`
2. You should be redirected to `/sign-in`
3. Click "Sign up" to create your first account
4. Fill in your email and password
5. After signing up, you'll be redirected to the main dashboard

---

## What's Protected

### Protected Routes (Require Authentication):
- `/` - Main dashboard
- `/api/*` - All API routes (expenses, budgets, users, etc.)

### Public Routes (No Authentication):
- `/sign-in` - Sign in page
- `/sign-up` - Sign up page

---

## Clerk Dashboard Features

In your Clerk dashboard, you can:

- **View Users:** See all signed-up users
- **Manage Sessions:** View active sessions
- **Configure Auth:** Enable/disable social logins (Google, GitHub, etc.)
- **Customize UI:** Brand the sign-in/sign-up pages
- **Set Up Webhooks:** Sync user data to your database

---

## Next Steps: Production Deployment

When you're ready to deploy to production:

1. **Switch to Production Keys:**
   - In Clerk dashboard, create a "Production" instance
   - Get production keys (starts with `pk_live_` and `sk_live_`)
   - Update environment variables in Vercel/hosting platform

2. **Configure Domains:**
   - Add your production domain to Clerk's allowed domains
   - Update NEXT_PUBLIC_CLERK_* URLs if needed

3. **Enable Social Logins** (Optional):
   - In Clerk dashboard, enable Google/GitHub OAuth
   - No additional code changes needed!

---

## Troubleshooting

### "Clerk: Missing publishable key"
- Ensure `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is set in `.env` or `.env.local`
- Restart the dev server after changing environment variables

### "Clerk: Invalid secret key"
- Double-check your `CLERK_SECRET_KEY` matches the one from Clerk dashboard
- Make sure you're using the correct environment (test vs. production)

### Redirected to /sign-in immediately
- This is expected! The middleware is protecting your routes
- Sign up for an account to access the dashboard

### Can't access /api routes
- API routes are now protected and require authentication
- Frontend requests will automatically include auth tokens via Clerk

---

## Support

- **Clerk Documentation:** [https://clerk.com/docs](https://clerk.com/docs)
- **Clerk Discord:** [https://clerk.com/discord](https://clerk.com/discord)
- **Bready Issues:** Create an issue in this repository

---

**Last Updated:** 2025-10-11
