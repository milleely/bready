# Performance Review

Perform a comprehensive performance audit of the Bready application based on the Performance Agent configuration in `.claude/agents/performance-agent.md`.

## Performance Targets (from PRD)

- **Dashboard Load Time:** < 2 seconds
- **Mutation Response Time:** < 500ms
- **Chart Rendering:** < 1 second

## Review Areas

### 1. Page Load Performance
- Analyze bundle size and code splitting
- Check for render-blocking resources
- Review image and font loading strategies
- Measure First Contentful Paint (FCP) and Time to Interactive (TTI)

### 2. API Response Time
- Profile all API routes in `/app/api/`
- Identify slow database queries
- Check for N+1 query patterns
- Verify proper use of Prisma `select` and `include`

### 3. Client-Side Rendering
- Analyze React component re-renders
- Check for missing `useMemo` and `useCallback`
- Review chart rendering performance (Recharts)
- Identify unnecessary state updates

### 4. Database Query Optimization
- Review Prisma schema for missing indexes
- Check query patterns in all API routes
- Identify inefficient `where` clauses
- Look for opportunities to batch queries

### 5. State Management Efficiency
- Analyze data fetching patterns
- Check for over-fetching or unnecessary API calls
- Review state update patterns
- Identify opportunities for optimistic updates

### 6. Bundle Size Analysis
- Check total JavaScript bundle size
- Identify unused dependencies
- Review code splitting effectiveness
- Suggest dynamic imports for heavy components

## Output Format

Provide findings in this structure:

### 🔴 Critical Performance Issues
[Issues blocking user experience - immediate fix required]

### 🟠 High Priority Optimizations
[Significant performance improvements - fix before next release]

### 🟡 Medium Priority Improvements
[Moderate performance gains - address when capacity allows]

### 🟢 Low Priority Optimizations
[Nice-to-have improvements and micro-optimizations]

### ✅ Performance Strengths
[What the application is doing well performance-wise]

## Performance Budget Compliance

Check against these targets:
- Initial JS bundle: < 300KB (gzipped)
- Total JS: < 500KB (gzipped)
- Simple API queries: < 100ms
- Complex API queries: < 300ms
- Mutations: < 500ms

Focus on actionable, measurable optimizations specific to this Next.js 15 + Prisma + Recharts application.
