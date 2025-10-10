# Security Review

Perform a comprehensive security review of the codebase. Analyze the following areas:

## 1. Authentication & Authorization
- Check for proper user authentication mechanisms
- Verify authorization checks on API routes
- Look for missing access control on sensitive operations
- Check for exposed user IDs or sensitive data in URLs/responses

## 2. Input Validation & Sanitization
- Review all API endpoints for input validation
- Check for SQL injection vulnerabilities (Prisma usage)
- Look for XSS vulnerabilities in user inputs
- Verify proper data type checking and constraints
- Check for missing required field validations

## 3. API Security
- Review all API routes in `/app/api/`
- Check for missing error handling
- Look for information disclosure in error messages
- Verify CORS configuration if applicable
- Check for rate limiting considerations

## 4. Data Protection
- Review database schema for sensitive data handling
- Check for proper encryption of sensitive fields
- Look for exposed secrets or API keys in code
- Verify environment variable usage for sensitive config
- Check for secure password handling (if applicable)

## 5. File Upload Security (if implemented)
- Check for file type validation
- Verify file size limits
- Look for path traversal vulnerabilities
- Check file storage location security

## 6. Client-Side Security
- Review for exposed sensitive data in client components
- Check for proper sanitization of user-generated content
- Look for unsafe use of dangerouslySetInnerHTML
- Verify secure handling of tokens/credentials

## 7. Dependencies & Supply Chain
- Check for outdated dependencies with known vulnerabilities
- Review package.json for suspicious packages
- Look for unused dependencies

## 8. Prisma-Specific Security
- Review schema for proper cascading deletes
- Check for missing indexes on filtered fields
- Verify proper use of transactions for critical operations
- Look for N+1 query issues

## Output Format
Provide findings in this structure:

### 🔴 Critical Issues
[List any critical security vulnerabilities that need immediate attention]

### 🟡 Medium Priority Issues
[List security concerns that should be addressed soon]

### 🟢 Best Practice Recommendations
[List security improvements and hardening suggestions]

### ✅ Security Strengths
[List what the codebase is doing well from a security perspective]

Focus on practical, actionable findings specific to this Next.js 15 + Prisma + SQLite application.
