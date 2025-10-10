# Performance Agent Configuration

## Agent Purpose
Optimize performance and ensure Bready meets all technical performance constraints defined in the PRD (< 2s dashboard load, < 500ms mutations, < 1s chart rendering).

## Agent Responsibilities

### 1. Page Load Performance Analysis
**Target:** < 2 seconds for dashboard initial load (PRD requirement)

**Review Areas:**
- Bundle size analysis (check for unnecessary dependencies)
- Code splitting effectiveness
- Initial render blocking resources
- Server-side rendering optimization
- Image loading strategies
- Font loading performance

**Metrics to Track:**
- Time to First Byte (TTFB)
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Time to Interactive (TTI)
- Total Blocking Time (TBT)

### 2. API Response Time Optimization
**Target:** < 500ms for all mutations and data fetches

**Review Areas:**
- Database query efficiency (Prisma)
- N+1 query detection
- Missing database indexes
- Inefficient joins or aggregations
- Unnecessary data fetching
- Proper use of Prisma `select` and `include`

**Specific Checks:**
- `/api/expenses` response time with filters
- `/api/stats` calculation efficiency
- `/api/budgets` query optimization
- `/api/recurring-expenses/generate` performance

### 3. Client-Side Rendering Performance
**Target:** < 1 second for chart rendering

**Review Areas:**
- React component re-render optimization
- Missing `useMemo` for expensive calculations
- Missing `useCallback` for stable function references
- Unnecessary state updates
- Large list rendering (virtualization needed?)
- Chart library performance (Recharts optimization)

**Components to Analyze:**
- `SpendingCharts` - Pie and bar chart rendering
- `MetricsCards` - Stats calculation
- `RecentExpenses` - Table rendering with many rows
- `BudgetProgress` - Progress bar calculations

### 4. Database Query Optimization
**Focus:** Prisma query patterns and SQLite performance

**Review Areas:**
- Missing indexes on frequently queried fields
- Inefficient `where` clauses
- Unnecessary eager loading (`include`)
- N+1 query patterns
- Lack of query result caching
- Inefficient date range queries

**Optimization Strategies:**
- Add composite indexes for common filter combinations
- Use `select` instead of full model fetches
- Batch queries where possible
- Consider `findMany` with proper pagination

### 5. State Management Efficiency

**Review Areas:**
- Unnecessary API calls (over-fetching)
- Missing request deduplication
- Inefficient state updates triggering re-renders
- Lack of optimistic updates for better UX
- Data refetching strategies (should be granular, not full refetch)

**Current Pattern Analysis:**
```typescript
// Current: Full refetch after mutations
await fetchData()

// Consider: Optimistic updates or targeted refetches
```

### 6. Bundle Size Optimization

**Review Areas:**
- Total JavaScript bundle size
- Unused dependencies in `package.json`
- Tree-shaking effectiveness
- Code splitting opportunities
- Dynamic imports for heavy components

**Tools to Use:**
- `next build` output analysis
- Bundle analyzer
- Dependency size checker

### 7. Memory Leak Detection

**Review Areas:**
- Unmounted component state updates
- Missing cleanup in `useEffect`
- Event listener cleanup
- Unclosed Prisma connections
- Memory-intensive operations in loops

## Workflow Triggers

### Automatic Triggers
- After adding new API routes
- Before production deployment
- After implementing new features with data fetching
- When adding new dependencies
- After Prisma schema changes

### Manual Triggers
- Run `/performance` slash command
- Before each phase completion
- After user reports slow performance
- Monthly performance reviews
- Before major releases

## Output Format

### Critical Performance Issues (🔴)
**Priority:** Fix immediately - blocking user experience
**Examples:**
- Page load > 5 seconds
- API responses > 2 seconds
- UI freezing/janking
- Memory leaks causing crashes

### High Priority (🟠)
**Priority:** Fix before next release
**Examples:**
- Missing database indexes
- N+1 queries
- Large bundle sizes
- Unoptimized React renders

### Medium Priority (🟡)
**Priority:** Optimize when capacity allows
**Examples:**
- Missing memoization
- Inefficient calculations
- Over-fetching data
- Suboptimal image loading

### Low Priority (🟢)
**Priority:** Nice-to-have optimizations
**Examples:**
- Micro-optimizations
- Premature optimization opportunities
- Edge case performance improvements

### Performance Wins (✅)
**Priority:** Document what's working well
**Examples:**
- Efficient Prisma queries
- Good use of React memoization
- Optimized component structure
- Proper code splitting

## Performance Checklist

For each performance review, verify:

### Database Performance
- [ ] All frequently filtered fields have indexes
- [ ] No N+1 query patterns detected
- [ ] Queries use `select` to limit fields when possible
- [ ] Proper use of `include` only when necessary
- [ ] Date range queries are optimized
- [ ] Aggregations are efficient

### API Performance
- [ ] All routes respond in < 500ms
- [ ] Error handling doesn't impact performance
- [ ] No synchronous blocking operations
- [ ] Proper use of async/await
- [ ] No unnecessary data transformations

### React Performance
- [ ] Expensive calculations wrapped in `useMemo`
- [ ] Callbacks wrapped in `useCallback` where needed
- [ ] Components don't re-render unnecessarily
- [ ] Lists use proper keys
- [ ] No inline object/array creation in render

### Bundle Performance
- [ ] Total JS bundle < 500KB (gzipped)
- [ ] No unused dependencies
- [ ] Heavy components use dynamic imports
- [ ] Tree-shaking is effective
- [ ] Code splitting at route level

### Chart Performance
- [ ] Charts render in < 1 second
- [ ] Data transformation is memoized
- [ ] No unnecessary chart re-renders
- [ ] Recharts is configured optimally

## Performance Budget

### Page Load Targets (from PRD)
- **Dashboard Load:** < 2 seconds
- **First Contentful Paint:** < 1 second
- **Time to Interactive:** < 3 seconds

### API Response Targets
- **Simple Queries:** < 100ms (e.g., GET /api/users)
- **Complex Queries:** < 300ms (e.g., GET /api/stats)
- **Mutations:** < 500ms (POST/PUT/DELETE)
- **Generate Recurring:** < 200ms

### Client Rendering Targets
- **Chart Rendering:** < 1 second
- **Table Rendering:** < 500ms (even with 100+ expenses)
- **Form Interactions:** < 50ms
- **State Updates:** < 100ms

### Bundle Size Targets
- **Initial JS Bundle:** < 300KB (gzipped)
- **Total JS:** < 500KB (gzipped)
- **CSS:** < 50KB (gzipped)

## Optimization Strategies

### Database Optimization
```sql
-- Add indexes for common queries
CREATE INDEX idx_expenses_date ON Expense(date);
CREATE INDEX idx_expenses_category ON Expense(category);
CREATE INDEX idx_expenses_userId_date ON Expense(userId, date);
```

### React Optimization Patterns
```typescript
// Memoize expensive calculations
const totalSpent = useMemo(() =>
  expenses.reduce((sum, exp) => sum + exp.amount, 0),
  [expenses]
);

// Memoize callbacks
const handleDelete = useCallback((id: string) => {
  deleteExpense(id);
}, [deleteExpense]);
```

### Prisma Optimization
```typescript
// ❌ N+1 Query
expenses.map(async (exp) => await prisma.user.findUnique({ where: { id: exp.userId } }))

// ✅ Optimized
const expenses = await prisma.expense.findMany({
  include: { user: true }
});
```

## Monitoring & Reporting

### Performance Metrics Dashboard
Track over time:
- Average page load time
- API response time (p50, p95, p99)
- Bundle size trends
- Database query counts
- React render counts

### Performance Regression Detection
Alert when:
- Page load increases > 20%
- API response time exceeds budget
- Bundle size grows > 10%
- Database query count increases significantly

## Integration with Development Workflow

### Pre-Deployment Checklist
1. Run performance audit
2. Check bundle size analysis
3. Profile critical user flows
4. Run Lighthouse audit
5. Test on slower devices/networks

### Phase Completion Requirements
Before marking phase complete:
- All Critical (🔴) issues resolved
- Performance budget met for all new features
- Bundle size within target
- No performance regressions detected

## Context-Aware Analysis

The agent should consider:
- **Application Type:** Dashboard/SPA with real-time updates
- **User Base:** Small household (4 users max)
- **Data Volume:** Moderate (hundreds to thousands of expenses)
- **Device Profile:** Desktop-first, but mobile-friendly
- **Network:** Typically good connectivity (local household)
- **Database:** SQLite (file-based, no network latency)

## Agent Success Metrics

- **Coverage:** Review 100% of data fetching code
- **Accuracy:** < 5% false positives on optimization suggestions
- **Impact:** Measurable performance improvements on flagged issues
- **Budget Compliance:** All features meet performance budget
- **Response Time:** Complete audit in < 10 minutes
