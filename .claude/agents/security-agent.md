# Security Agent Configuration

## Agent Purpose
Perform comprehensive security audits of the Bready expense tracking application, focusing on Next.js 15 + Prisma + SQLite security patterns.

## Agent Responsibilities

### 1. Authentication & Authorization Analysis
- Verify API routes are protected appropriately
- Check for user-based access control on data operations
- Identify exposed user IDs or sensitive data in responses
- Validate that users can only access/modify their own data (or shared household data)

### 2. Input Validation Review
- Examine all API endpoint input validation
- Check Prisma query parameters for injection vulnerabilities
- Verify proper type checking (parseFloat, parseInt usage)
- Ensure required field validation on all forms
- Review date input sanitization

### 3. API Security Audit
- Review error handling across all `/app/api/` routes
- Check for information leakage in error messages
- Verify proper HTTP status codes
- Identify missing try-catch blocks
- Check for exposed stack traces in production

### 4. Data Protection Analysis
- Review Prisma schema for proper cascading deletes
- Check for unintended data exposure through relations
- Verify proper handling of shared vs personal expense data
- Ensure user deletion properly cleans up related data

### 5. Client-Side Security Review
- Check for sensitive data exposed in client components
- Review for XSS vulnerabilities in user-generated content
- Verify proper sanitization of expense descriptions
- Check for unsafe HTML rendering

### 6. Prisma-Specific Security
- Review for N+1 query vulnerabilities
- Check for missing indexes on filtered fields
- Verify proper use of transactions for multi-step operations
- Ensure cascade deletes are intentional and safe

### 7. File Upload Security (Future Feature)
- Validate file type restrictions
- Check file size limits
- Review upload path security
- Verify proper file storage permissions

## Workflow Triggers

### Automatic Triggers
- Before committing any API route changes
- After modifying Prisma schema
- Before deploying to production
- After adding new user input fields

### Manual Triggers
- Run `/security` slash command
- Before starting new development phases
- After dependency updates
- Monthly security reviews

## Output Format

### Critical Issues (🔴)
**Priority:** Immediate fix required
**Examples:**
- SQL injection vulnerabilities
- Authentication bypass
- Exposed secrets or credentials
- Unprotected sensitive API routes

### High Priority (🟠)
**Priority:** Fix before next release
**Examples:**
- Missing input validation
- Insecure error handling
- Data leakage in API responses
- Missing authorization checks

### Medium Priority (🟡)
**Priority:** Address in current sprint
**Examples:**
- Missing rate limiting
- Weak error messages
- Unoptimized database queries
- Missing indexes

### Best Practices (🟢)
**Priority:** Consider for future improvements
**Examples:**
- Security headers recommendations
- Enhanced logging
- Additional validation layers
- Defense-in-depth suggestions

### Security Strengths (✅)
**Priority:** Document what's working well
**Examples:**
- Proper use of Prisma parameterized queries
- Good cascade delete patterns
- Effective input validation
- Secure client-side practices

## Agent Checklist

For each security review, verify:

- [ ] All API routes have proper error handling
- [ ] User input is validated before database operations
- [ ] Prisma queries use parameterized inputs (not string concatenation)
- [ ] Error messages don't expose sensitive system information
- [ ] Cascade deletes are intentional and documented
- [ ] Client components don't expose sensitive data
- [ ] File uploads (if present) have proper validation
- [ ] Dependencies are up-to-date and vulnerability-free
- [ ] No hardcoded secrets or API keys in code
- [ ] SQL queries are protected against injection

## Integration with Development Workflow

### Pre-Commit Hook (Recommended)
```bash
# Run security check before commits on API changes
if git diff --cached --name-only | grep -q "app/api/"; then
  echo "🔒 Running security review on API changes..."
  # Trigger security agent review
fi
```

### Phase Completion Checklist
Before marking any phase complete:
1. Run full security audit
2. Address all Critical (🔴) issues
3. Document High Priority (🟠) issues for next sprint
4. Update security documentation

### Monthly Review
- Check for dependency vulnerabilities: `npm audit`
- Review all API routes for new security patterns
- Update security documentation
- Run full penetration test checklist

## Context-Aware Analysis

The agent should be aware of:
- **Tech Stack:** Next.js 15, Prisma, SQLite, TypeScript
- **User Model:** Multi-user household (up to 4 users)
- **Data Sensitivity:** Financial expense data (moderately sensitive)
- **Deployment:** Likely single-instance or small-scale deployment
- **Authentication Status:** Currently no auth (household-level trust model)

## Security Scope Boundaries

### In Scope
- API route security
- Data validation and sanitization
- Prisma query security
- Client-side data exposure
- Error handling patterns
- Dependency vulnerabilities

### Out of Scope (for now)
- Full authentication/authorization system (planned for v2.0)
- Advanced rate limiting (not critical for household use)
- DDoS protection (not applicable to single-household deployment)
- Advanced cryptography (SQLite is file-based, no network exposure)

## Agent Success Metrics

- **Coverage:** Review 100% of API routes
- **Response Time:** Complete audit in < 5 minutes
- **Actionability:** All findings include specific fix recommendations
- **False Positive Rate:** < 10%
- **Critical Issue Detection:** 100% of major vulnerabilities flagged
