# Deployment Checklist - Bready

Use this checklist to ensure a smooth deployment to Vercel.

## Pre-Deployment Checklist

### Code & Repository
- [ ] All code committed to Git
- [ ] `.env` is in `.gitignore`
- [ ] `.env.example` is committed to repo
- [ ] No hardcoded secrets in code
- [ ] Repository pushed to GitHub/GitLab/Bitbucket

### Database Schema
- [ ] Prisma schema updated to `provider = "postgresql"`
- [ ] All migrations created and tested locally
- [ ] Database indexes are in place

### Authentication
- [ ] Clerk production application created
- [ ] Production API keys obtained (`pk_live_`, `sk_live_`)
- [ ] All API routes protected with `getHouseholdId()`
- [ ] Middleware configured in `middleware.ts`

### Build Configuration
- [ ] `postinstall` script added to package.json
- [ ] `vercel-build` script added to package.json
- [ ] Turbopack removed from production build (should be `next build`, not `next build --turbopack`)

## Vercel Setup Checklist

### Project Creation
- [ ] Vercel project created and linked to Git repo
- [ ] Framework preset set to Next.js
- [ ] Build command: `npm run vercel-build` (or `npm run build`)
- [ ] Output directory: `.next`

### Database Setup
- [ ] Vercel Postgres database created
- [ ] Database region selected
- [ ] `POSTGRES_PRISMA_URL` copied
- [ ] Database migrations will run on first build

### Environment Variables
Required variables in Vercel project settings:

- [ ] `DATABASE_URL` = `POSTGRES_PRISMA_URL` from Vercel Postgres
- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` = Production key from Clerk
- [ ] `CLERK_SECRET_KEY` = Production secret from Clerk
- [ ] `NEXT_PUBLIC_CLERK_SIGN_IN_URL` = `/sign-in`
- [ ] `NEXT_PUBLIC_CLERK_SIGN_UP_URL` = `/sign-up`
- [ ] `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` = `/`
- [ ] `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` = `/`

### Clerk Production Setup
- [ ] Production domain added to Clerk (e.g., `your-app.vercel.app`)
- [ ] Sign-in URL updated: `https://your-app.vercel.app/sign-in`
- [ ] Sign-up URL updated: `https://your-app.vercel.app/sign-up`
- [ ] Home URL updated: `https://your-app.vercel.app`
- [ ] Production keys used (NOT test keys)

## Deployment Checklist

### Initial Deployment
- [ ] Push to main branch triggers deployment
- [ ] Build completes successfully
- [ ] No build errors in Vercel logs
- [ ] Database migrations applied automatically
- [ ] Prisma Client generated

### Post-Deployment Testing
- [ ] App loads at Vercel URL
- [ ] Sign up with new account works
- [ ] Sign in works
- [ ] User can create household member
- [ ] User can add expense
- [ ] Charts display correctly
- [ ] Budget tracking works
- [ ] CSV export works
- [ ] Settlement calculations work
- [ ] Sign out works

### Verification
- [ ] Check Vercel deployment logs for errors
- [ ] Check Vercel Postgres for data
- [ ] Check browser console for errors
- [ ] Test on mobile device
- [ ] Test in incognito/private mode

## Production Security Checklist

### Application Security
- [ ] All API routes require authentication
- [ ] Household-scoping prevents data leaks
- [ ] SQL injection prevented (using Prisma)
- [ ] XSS protection (React escapes by default)
- [ ] CSRF protection (Clerk handles this)

### Data Security
- [ ] Database uses SSL connection
- [ ] Environment variables not exposed to client
- [ ] No sensitive data in logs
- [ ] Error messages don't leak implementation details

### Access Control
- [ ] Users can only see their household data
- [ ] Users can only modify their household data
- [ ] Household member limit enforced (4 users)
- [ ] Budget operations scoped to household
- [ ] Settlement operations scoped to household

## Monitoring Setup (Optional but Recommended)

### Vercel Analytics
- [ ] Enable Vercel Analytics in project settings
- [ ] Monitor page views and performance
- [ ] Check Web Vitals scores

### Error Tracking
- [ ] Set up error tracking (Sentry, LogRocket, etc.)
- [ ] Configure error notifications
- [ ] Test error reporting

### Database Monitoring
- [ ] Monitor Vercel Postgres metrics
- [ ] Set up alerts for connection limits
- [ ] Monitor query performance

## Rollback Plan

If something goes wrong:

### Quick Rollback
1. Go to Vercel Dashboard → Deployments
2. Find previous working deployment
3. Click "..." → "Promote to Production"

### Database Rollback (if needed)
1. Have database backup ready
2. Connect to Vercel Postgres
3. Restore from backup

### Code Rollback
```bash
# Revert to previous commit
git revert HEAD
git push

# Or reset to specific commit
git reset --hard <commit-hash>
git push --force
```

## Post-Launch Tasks

### Documentation
- [ ] Update README with production URL
- [ ] Document any deployment customizations
- [ ] Add deployment badge to README

### Communication
- [ ] Share production URL with stakeholders
- [ ] Provide user documentation if needed
- [ ] Set up feedback channel

### Maintenance
- [ ] Schedule regular dependency updates
- [ ] Plan for database backups
- [ ] Monitor usage and costs
- [ ] Set up uptime monitoring

## Common Issues & Solutions

### Build Fails
- Check Node.js version matches (18+)
- Verify all dependencies in package.json
- Check build logs for specific error

### Database Connection Issues
- Verify `DATABASE_URL` is set correctly
- Check SSL mode is enabled
- Verify Vercel Postgres is in same region

### Authentication Not Working
- Confirm production Clerk keys are used
- Verify domain added to Clerk Dashboard
- Check Clerk URLs match deployment URL

### Migration Errors
- Check Prisma schema is valid
- Verify all migrations are committed
- Consider resetting database if in early testing

## Success Criteria

Your deployment is successful when:
- ✅ App loads without errors
- ✅ Users can sign up and sign in
- ✅ All CRUD operations work
- ✅ Data is properly isolated per household
- ✅ No security vulnerabilities
- ✅ Performance is acceptable
- ✅ Mobile experience is smooth

---

**Need Help?**
- See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for detailed guide
- Check Vercel deployment logs
- Review Clerk Dashboard for auth issues
- Inspect Vercel Postgres for database issues
