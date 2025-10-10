# Performance Optimization Workflow

This workflow defines when and how to trigger the Performance Agent for the Bready application.

## Workflow Triggers

### 1. Post-Feature Implementation Review
**When:** After implementing any new feature with data fetching or rendering

**Steps:**
1. Run `/performance` command
2. Profile the new feature's rendering performance
3. Check API response times for new endpoints
4. Verify bundle size hasn't grown excessively
5. Fix Critical (🔴) and High Priority (🟠) issues before merge

**Focus Areas:**
- New API route response times
- React component render performance
- Bundle size impact
- Database query efficiency

### 2. Pre-Deployment Performance Audit
**When:** Before deploying to production

**Steps:**
1. Run full `/performance` audit
2. Run `next build` and analyze bundle size
3. Profile critical user flows with DevTools
4. Run Lighthouse audit
5. Test on slower device/network
6. Document performance metrics

**Performance Budget Verification:**
- [ ] Dashboard loads in < 2 seconds
- [ ] All API routes respond in < 500ms
- [ ] Charts render in < 1 second
- [ ] JS bundle < 500KB (gzipped)
- [ ] No performance regressions vs previous build

### 3. Prisma Schema Change Review
**When:** After modifying database schema

**Steps:**
1. Review query patterns affected by schema change
2. Identify missing indexes on new fields
3. Check for N+1 query opportunities
4. Run performance tests on affected API routes
5. Add indexes before migrating

**Checklist:**
- [ ] All frequently queried fields have indexes
- [ ] Foreign keys are indexed
- [ ] Composite indexes for common filter combinations
- [ ] No N+1 queries introduced

### 4. Component Optimization Review
**When:** After adding/modifying major React components

**Steps:**
1. Profile component renders with React DevTools
2. Check for unnecessary re-renders
3. Identify missing `useMemo` for expensive calculations
4. Verify `useCallback` usage for stable references
5. Measure render time for component tree

**Components to Profile:**
- `SpendingCharts` (chart rendering)
- `RecentExpenses` (table with many rows)
- `MetricsCards` (calculation-heavy)
- `BudgetProgress` (dynamic calculations)

### 5. API Route Performance Review
**When:** After creating/modifying any API route

**Steps:**
1. Measure response time with realistic data volume
2. Profile database queries (use Prisma query logging)
3. Check for N+1 patterns
4. Verify proper error handling doesn't slow responses
5. Test with concurrent requests

**Performance Targets:**
- Simple queries (GET /api/users): < 100ms
- Complex queries (GET /api/stats): < 300ms
- Mutations (POST/PUT/DELETE): < 500ms
- Batch operations: < 1s

### 6. Bundle Size Review
**When:** After adding new dependencies or major features

**Steps:**
1. Run `next build` and check output
2. Analyze bundle composition
3. Identify unused dependencies
4. Check for duplicate dependencies
5. Consider code splitting opportunities

**Commands:**
```bash
# Build and analyze bundle
npm run build

# Check for large dependencies
npx webpack-bundle-analyzer .next/static/chunks/*.js

# Find duplicate dependencies
npx npm-check-duplicates
```

**Size Budget:**
- Initial JS: < 300KB (gzipped)
- Total JS: < 500KB (gzipped)
- CSS: < 50KB (gzipped)

### 7. Monthly Performance Review
**When:** First Monday of each month

**Steps:**
1. Run comprehensive `/performance` audit
2. Collect performance metrics from previous month
3. Identify performance trends (improving/degrading)
4. Review and update performance budget
5. Plan optimizations for upcoming month
6. Update performance documentation

**Metrics to Track:**
- Average page load time
- API response time percentiles (p50, p95, p99)
- Bundle size trend
- Database query counts
- React render counts

## Performance Testing Strategy

### Load Testing
Test with realistic data volumes:
- **Small household:** 50 expenses, 2 users
- **Medium household:** 200 expenses, 4 users
- **Large dataset:** 1000+ expenses, 4 users

### Device Testing
Test on various devices:
- **High-end:** MacBook Pro, Desktop PC
- **Mid-range:** Standard laptop, iPad
- **Low-end:** Older laptop, budget Android tablet

### Network Testing
Test on different network conditions:
- **Fast:** Localhost (development)
- **Typical:** Regular WiFi
- **Slow:** Throttled 3G simulation

## Performance Optimization Playbook

### Database Optimization Checklist
```typescript
// ✅ Good: Use select to limit fields
const users = await prisma.user.findMany({
  select: { id: true, name: true, color: true }
});

// ❌ Bad: Fetch entire model
const users = await prisma.user.findMany();

// ✅ Good: Single query with include
const expenses = await prisma.expense.findMany({
  include: { user: true }
});

// ❌ Bad: N+1 pattern
for (const expense of expenses) {
  const user = await prisma.user.findUnique({ where: { id: expense.userId } });
}

// ✅ Good: Add indexes for filtered fields
@@index([userId, date])
@@index([category])

// ❌ Bad: No indexes on commonly filtered fields
```

### React Optimization Checklist
```typescript
// ✅ Good: Memoize expensive calculations
const totalSpent = useMemo(() =>
  expenses.reduce((sum, e) => sum + e.amount, 0),
  [expenses]
);

// ❌ Bad: Calculate on every render
const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

// ✅ Good: Stable callback reference
const handleDelete = useCallback((id: string) => {
  deleteExpense(id);
}, [deleteExpense]);

// ❌ Bad: New function on every render
const handleDelete = (id: string) => deleteExpense(id);

// ✅ Good: Proper dependency array
useEffect(() => {
  fetchData();
}, [selectedMonth]);

// ❌ Bad: Missing dependencies or unnecessary deps
useEffect(() => {
  fetchData();
}, []); // Missing selectedMonth dependency
```

### Bundle Optimization Checklist
```typescript
// ✅ Good: Dynamic import for heavy components
const HeavyChart = dynamic(() => import('./HeavyChart'), {
  loading: () => <Spinner />
});

// ❌ Bad: Import everything at top level
import HeavyChart from './HeavyChart';

// ✅ Good: Import only what you need
import { Button } from '@/components/ui/button';

// ❌ Bad: Import entire library
import * as UI from '@/components/ui';
```

## Performance Monitoring

### Metrics to Track

**Page Load Metrics:**
- Time to First Byte (TTFB)
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Time to Interactive (TTI)
- Cumulative Layout Shift (CLS)

**API Metrics:**
- Response time (p50, p95, p99)
- Error rate
- Throughput (requests/second)
- Database query count per request

**Client Metrics:**
- React component render count
- Chart rendering time
- State update frequency
- Memory usage

### Performance Dashboard

Create a simple performance tracking spreadsheet:

| Metric | Target | Current | Trend | Notes |
|--------|--------|---------|-------|-------|
| Dashboard Load | < 2s | 1.2s | ✅ | Improved |
| API Stats Response | < 300ms | 250ms | ✅ | Good |
| Chart Render | < 1s | 800ms | ✅ | Optimized |
| Bundle Size | < 500KB | 420KB | ⚠️ | Growing |

## Performance Regression Detection

### Automated Checks
Set up alerts when:
- Bundle size increases > 10%
- Page load time increases > 20%
- API response time exceeds budget
- Database query count doubles

### Manual Testing
Before each release:
1. Profile critical user flows
2. Compare metrics to previous release
3. Investigate any regressions
4. Fix or document trade-offs

## Integration with CI/CD

### Pre-Commit Hooks
```bash
#!/bin/sh
# Check bundle size on commit
npm run build
# Alert if bundle exceeds budget
```

### GitHub Actions
```yaml
- name: Performance Audit
  run: |
    npm run build
    npm run lighthouse
    npm run bundle-analysis
```

## Escalation Process

### Critical Performance Issue (🔴)
**Definition:** Feature unusable or blocking user experience
- Dashboard load > 5 seconds
- API timeout errors
- UI freezing/crashing

**Response:**
1. Stop deployment immediately
2. Revert if in production
3. Create hotfix branch
4. Fix and test thoroughly
5. Deploy emergency patch

### High Priority Issue (🟠)
**Definition:** Significant degradation but functional
- Page load 2-5 seconds
- API responses 500ms-1s
- Charts render 1-2 seconds

**Response:**
1. Create GitHub Issue with priority label
2. Add to current sprint
3. Assign to developer
4. Fix before next release
5. Document optimization

## Success Metrics

Track performance improvements over time:
- **Issue Resolution Rate:** % of performance issues fixed per sprint
- **Performance Budget Compliance:** % of metrics meeting targets
- **Regression Rate:** # of performance regressions introduced
- **User Experience:** Page load time improvement %
- **Bundle Size:** Trend over releases

## Agent Training

Update `.claude/agents/performance-agent.md` when:
- New performance patterns are identified
- Framework updates change best practices
- New tools become available
- False positives are consistently detected
- Performance budgets are adjusted

Document lessons learned and optimization successes.
