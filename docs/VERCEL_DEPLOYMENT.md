# Vercel Deployment Guide - Bready Expense Tracker

This guide walks you through deploying Bready to Vercel with PostgreSQL database.

## Prerequisites

- [Vercel Account](https://vercel.com) (free tier works)
- [Clerk Account](https://clerk.com) (already set up)
- Git repository (GitHub, GitLab, or Bitbucket)
- Node.js 18+ installed locally

## Step 1: Push Code to Git Repository

If you haven't already, initialize a git repository and push to GitHub:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "feat: production-ready app with Clerk auth and household model"

# Add remote (replace with your GitHub repo URL)
git remote add origin https://github.com/yourusername/bready.git

# Push to main branch
git push -u origin main
```

## Step 2: Create Vercel Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New"** → **"Project"**
3. Import your Git repository
4. Vercel will auto-detect Next.js settings

**Build Settings (auto-configured):**
- Framework Preset: `Next.js`
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

## Step 3: Add Vercel Postgres Database

1. In your Vercel project, go to the **"Storage"** tab
2. Click **"Create Database"**
3. Select **"Postgres"**
4. Choose a database name (e.g., `bready-db`)
5. Select region closest to your users
6. Click **"Create"**

Vercel will automatically:
- Create the PostgreSQL database
- Add `DATABASE_URL` environment variable to your project
- Add `POSTGRES_URL`, `POSTGRES_PRISMA_URL`, etc.

**Important:** Use `POSTGRES_PRISMA_URL` as your `DATABASE_URL` for Prisma.

## Step 4: Configure Environment Variables

In Vercel project settings → **Environment Variables**, add:

### Required Variables:

| Variable | Value | Notes |
|----------|-------|-------|
| `DATABASE_URL` | `(use POSTGRES_PRISMA_URL)` | Auto-added by Vercel Postgres |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_live_...` | Get from Clerk Dashboard (Production) |
| `CLERK_SECRET_KEY` | `sk_live_...` | Get from Clerk Dashboard (Production) |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/sign-in` | Already configured |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/sign-up` | Already configured |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | `/` | Already configured |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | `/` | Already configured |

### Getting Production Clerk Keys:

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Click **"API Keys"** in sidebar
4. Toggle from **Development** to **Production**
5. Copy the production keys (they start with `pk_live_` and `sk_live_`)

**Important:** Use production keys for Vercel, NOT test keys!

## Step 5: Update Clerk Production URLs

In Clerk Dashboard → **Paths**:

1. Set **Sign-in URL**: `https://your-app.vercel.app/sign-in`
2. Set **Sign-up URL**: `https://your-app.vercel.app/sign-up`
3. Set **Home URL**: `https://your-app.vercel.app`

In Clerk Dashboard → **Domains** → **Add production domain**:
- Add your Vercel domain: `your-app.vercel.app`

## Step 6: Run Database Migration

After deploying, you need to initialize the database schema.

### Option A: Use Vercel CLI (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link to your project
vercel link

# Pull environment variables (includes DATABASE_URL)
vercel env pull .env.production

# Run migration using production database
DATABASE_URL="$(grep DATABASE_URL .env.production | cut -d '=' -f2)" npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate
```

### Option B: Manual Migration via Vercel Postgres

1. Go to Vercel project → **Storage** → Your Postgres database
2. Click **"Query"** tab
3. Run the SQL migration manually (copy from `prisma/migrations/` folder)

### Option C: Add Migration Script

Add to `package.json`:
```json
{
  "scripts": {
    "vercel-build": "prisma generate && prisma migrate deploy && next build"
  }
}
```

Then in Vercel project settings → **Build & Development Settings**:
- Override build command: `npm run vercel-build`

## Step 7: Deploy!

Vercel will automatically deploy when you push to your main branch.

**Manual deployment:**
```bash
vercel --prod
```

Your app will be live at: `https://your-app.vercel.app`

## Post-Deployment

### Test the Application

1. Visit your Vercel URL
2. Sign up with Clerk authentication
3. Create a user in your household
4. Add test expense
5. Verify all features work:
   - [ ] User authentication (sign in/out)
   - [ ] Expense CRUD operations
   - [ ] Budget tracking
   - [ ] Charts and analytics
   - [ ] CSV export
   - [ ] Settlement calculations

### Monitor Deployment

- **Logs**: Vercel Dashboard → Your Project → **Deployments** → View logs
- **Database**: Vercel Dashboard → **Storage** → View queries and metrics
- **Analytics**: Vercel Dashboard → **Analytics** tab

## Troubleshooting

### Issue: Prisma Client Not Found

**Error:** `@prisma/client did not initialize yet`

**Solution:**
```bash
# Add postinstall script to package.json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

Then redeploy.

### Issue: Database Connection Error

**Error:** `Can't reach database server`

**Solution:**
1. Verify `DATABASE_URL` in Vercel environment variables
2. Use `POSTGRES_PRISMA_URL` provided by Vercel Postgres
3. Ensure `?sslmode=require` is in connection string
4. Check database is in same region as deployment

### Issue: Clerk Authentication Not Working

**Error:** Redirects to localhost or shows 401

**Solution:**
1. Use **production** Clerk keys (`pk_live_`, `sk_live_`)
2. Add production domain to Clerk Dashboard
3. Update Clerk URLs to use production domain
4. Clear browser cache/cookies

### Issue: Migration Fails

**Error:** `Migration failed to apply`

**Solution:**
```bash
# Reset production database (WARNING: deletes all data!)
npx prisma migrate reset --skip-seed

# Or manually apply migrations
npx prisma migrate deploy
```

## Custom Domain (Optional)

To use a custom domain like `bready.com`:

1. Vercel Dashboard → Your Project → **Settings** → **Domains**
2. Add your domain
3. Configure DNS records as instructed by Vercel
4. Update Clerk Dashboard with new domain

## Environment Management

### Development vs Production

Keep separate Clerk applications for development and production:

**Development:**
- Use test keys (`pk_test_`, `sk_test_`)
- Database: SQLite locally
- Domain: `localhost:3000`

**Production:**
- Use live keys (`pk_live_`, `sk_live_`)
- Database: Vercel Postgres
- Domain: Your Vercel/custom domain

### Local Development with Production DB (Optional)

If you want to test against production database locally:

```bash
# Pull production environment variables
vercel env pull .env.local

# Run dev server
npm run dev
```

**Warning:** Be careful when running against production database!

## Scaling Considerations

### Database Optimization

As your app grows:
- Add database indexes (already included in schema)
- Enable connection pooling (Prisma Accelerate)
- Monitor query performance in Vercel Postgres dashboard

### Vercel Plans

- **Free Tier**: Perfect for personal use, 100GB bandwidth
- **Pro Tier**: For production apps with custom domains
- **Enterprise**: High-traffic applications

### Prisma Optimization

For better cold start performance:
```bash
# Add to package.json
{
  "prisma": {
    "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  }
}
```

## Security Checklist

Before going live:

- [ ] Environment variables are set in Vercel (not in code)
- [ ] Production Clerk keys are used
- [ ] Database connection uses SSL (`?sslmode=require`)
- [ ] API routes are protected with `getHouseholdId()`
- [ ] Clerk middleware is active in `middleware.ts`
- [ ] CORS is not disabled
- [ ] Error messages don't leak sensitive info
- [ ] `.env` is in `.gitignore`

## Continuous Deployment

Vercel automatically deploys on every push to main:

```bash
# Make changes
git add .
git commit -m "feat: add new feature"
git push

# Vercel automatically deploys!
```

View deployment progress in Vercel Dashboard.

## Backup Strategy

### Database Backups

Vercel Postgres provides automatic backups on paid plans. For free tier:

1. Manual export via Vercel Postgres Query tab
2. Or use `pg_dump`:

```bash
# Export database
pg_dump $DATABASE_URL > backup.sql

# Restore database
psql $DATABASE_URL < backup.sql
```

### Code Backups

Your code is backed up in Git. Vercel also keeps deployment history.

## Additional Resources

- [Vercel Docs](https://vercel.com/docs)
- [Vercel Postgres Docs](https://vercel.com/docs/storage/vercel-postgres)
- [Prisma Deployment Docs](https://www.prisma.io/docs/guides/deployment/deployment)
- [Clerk Production Checklist](https://clerk.com/docs/deployments/overview)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

## Support

- Vercel Support: https://vercel.com/support
- Clerk Support: https://clerk.com/support
- Prisma Community: https://www.prisma.io/community

---

**Congratulations! Your Bready app is now live in production! 🎉🍞**
